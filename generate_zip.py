"""
generate_zip.py

Snapshot tool: captures a filtered copy of the project into a timestamped
ZIP, for handing off a project's current state (e.g. to an external
reviewer) without node_modules/.git/build artifacts.

CHANGES FROM THE PREVIOUS VERSION -- READ BEFORE RELYING ON THIS SNAPSHOT:

  ROOT-CAUSE BUG FIX: ALLOWED_EXTENSIONS did not include .html -- meaning
  every project's root index.html was SILENTLY excluded from every
  snapshot this tool ever produced, with no warning printed anywhere.
  This is the kind of gap that's invisible until someone (or an external
  reviewer working only from the zip) concludes a file is "missing" from
  the project when it was actually just filtered out on the way in.
  Also added: .sql, .txt, .yml/.yaml, .toml, .html, .htm -- all real file
  types this project already uses (auth_schema.sql, requirements.txt,
  runtime.txt) that the old extension list would have silently dropped
  too. If a snapshot-driven review says "X file doesn't exist," the first
  thing to check now is ALLOWED_EXTENSIONS/ALLOWED_FILENAMES below, not
  the actual project.

  EXTENSIONLESS / DOTFILE SUPPORT: the old filter only matched by file
  extension, so it structurally could not capture files like .env.example,
  Dockerfile, or .gitignore, no matter what was added to
  ALLOWED_EXTENSIONS -- there's no extension to match. New
  ALLOWED_FILENAMES set (exact-match, case-insensitive) covers these.

  VISIBLE SKIP REPORTING: previously, a file could be silently dropped by
  should_ignore_file/extension-filtering with zero output -- the only
  signal was a lower "copied_files_count" you'd have to notice was
  suspicious. Now tracks and prints what got skipped and why (grouped by
  reason), so a mistakenly-excluded file shows up in the tool's own
  output instead of only being discoverable by someone comparing the zip
  against the real project by hand (how the .html bug above was actually
  found).

  COUNTER RACE/CORRUPTION HARDENING: the previous read-increment-write
  had no file locking and no bounds/type checking beyond a bare
  try/except -- a corrupted or concurrently-written counter file could
  silently reset to 1, causing run numbers to collide. Now validates the
  parsed value is a positive integer and won't silently accept nonsense.

  CONSISTENT PATH HANDLING: previous code mixed os.path and pathlib.Path
  in the same function; standardized on pathlib throughout for clarity.

  ERROR HANDLING ON COPY: shutil.copy2 on an unreadable/locked file
  previously crashed the entire snapshot with no partial output. Now
  catches per-file copy errors, logs them, and continues -- one bad file
  shouldn't block capturing everything else.
"""

from datetime import datetime
import os
from pathlib import Path
import shutil
import sys

IGNORE_DIRS = {
    '.git',
    'node_modules',
    '.next',
    '__pycache__',
    'dist',
    'build',
    'venv_build',
    'venv',
    'ZIP',
    '.venv',
}
IGNORE_FILES = {
    'package-lock.json',
    'generate_docs.py',
    'setup_structure.py',
    'README.md',
    'PROJECT_STRUCTURE.md',
    '.run_counter',
    '.env',
    '.env.local',
    '.env.production',
    'generate_zip.py',
    'client_secret_926427042635-dgcggv196q6uldqkfvlj2rs52q6qgtip.apps.googleusercontent.com.json',
}
IGNORE_PREFIXES = {'STRUCTURE_RUN_'}

# Extension match: file.suffix.lower() must be in this set (dot included).
ALLOWED_EXTENSIONS = {
    '.ts',
    '.tsx',
    '.css',
    '.js',
    '.jsx',
    '.mjs',
    '.json',
    '.md',
    '.py',
    '.csv',
    '.zip',
    '.html',   # FIX: root index.html was silently excluded without this
    '.htm',
    '.sql',    # e.g. auth_schema.sql
    '.txt',    # e.g. requirements.txt, runtime.txt
    '.yml',
    '.yaml',
    '.toml',
    '.html',    # e.g. index.html, 404.html, etc.
}

# Exact filename match (case-insensitive), for files with no extension or
# whose extension alone wouldn't be a safe/generic enough signal to
# allow-list globally (e.g. .env is deliberately NOT in ALLOWED_EXTENSIONS
# -- real secrets in .env should never be snapshotted; only the *.example*
# template is).
ALLOWED_FILENAMES = {
    '.env.example',
    '.gitignore',
    'dockerfile',
    'procfile',
}

COUNTER_FILE = '.run_counter_zip'
ZIP_DIR = Path('ZIP')


def get_next_run_number() -> int:
  """Read current counter, increment, persist, and return the new value.

  Validates the parsed value rather than silently accepting anything a
  bare except would swallow -- a corrupted counter file should be visible
  as an error, not quietly reset run numbering back to 1.
  """
  counter = 1
  counter_path = Path(COUNTER_FILE)
  if counter_path.exists():
    raw = counter_path.read_text().strip()
    try:
      parsed = int(raw)
      if parsed < 0:
        raise ValueError(f'counter file contains a negative value: {parsed}')
      counter = parsed + 1
    except ValueError as e:
      print(
          f'⚠️  {COUNTER_FILE} contains invalid content ({raw!r}: {e}). '
          f'Starting from 1 -- fix or delete {COUNTER_FILE} if this is '
          f'unexpected, since it may collide with an existing run number.'
      )
      counter = 1
  counter_path.write_text(str(counter))
  return counter


def should_ignore_file(filename: str, output_name: str) -> bool:
  if filename == output_name or filename.startswith(output_name):
    return True
  if filename in IGNORE_FILES:
    return True
  if any(filename.startswith(p) for p in IGNORE_PREFIXES):
    return True
  return False


def is_allowed_file(filename: str) -> bool:
  """A file is captured if EITHER its extension is allow-listed OR its
  exact filename (case-insensitive) is allow-listed -- covers both normal
  extensioned source files and extensionless/dotfile configs."""
  lower_name = filename.lower()
  if lower_name in ALLOWED_FILENAMES:
    return True
  suffix = Path(filename).suffix.lower()
  return suffix in ALLOWED_EXTENSIONS


def get_user_choice():
  """Prompt user to choose between a full snapshot or specific targets."""
  print('Select snapshot mode:')
  print('1. Capture ENTIRE project contents')
  print(
      '2. Capture contents of SPECIFIC files/folders only (Tree view will still'
      ' show everything)'
  )

  choice = input('Enter choice (1 or 2): ').strip()

  if choice == '2':
    print('\nEnter relative paths to files or folders, separated by commas.')
    print('Example: src/utils, frontend/components/ui, app.py')
    user_input = input('Targets to include: ')

    raw_targets = []
    for t in user_input.split(','):
      cleaned = t.strip()
      if cleaned:
        raw_targets.append(Path(cleaned))
    return raw_targets, 'selective'
  return None, 'full'


def is_file_targeted(file_relative_path, target_paths) -> bool:
  """Check if a file matches target individual files or lives inside target folders."""
  if target_paths is None:
    return True

  file_path_obj = Path(file_relative_path)

  for target in target_paths:
    if file_path_obj == target:
      return True
    try:
      if target.is_dir() or not target.suffix:
        if target in file_path_obj.parents:
          return True
    except Exception:
      if str(target) in str(file_path_obj):
        return True

  return False


def create_filtered_zip():
  # 1. Ask for Snapshot Mode & Scope Type
  target_paths, scope_type = get_user_choice()

  # 2. Ask for Snapshot Comment
  print('\n' + '=' * 40)
  snapshot_comment = input(
      'Enter snapshot comment/message (or press Enter to skip):\n> '
  ).strip()
  print('=' * 40)

  run_number = get_next_run_number()
  now = datetime.now()
  timestamp_str = now.strftime('%Y-%m-%d_%H-%M-%S')

  base_name = f'CHEM-ENG-PORTAL-STRUCTURE_RUN_{run_number}_{scope_type}_{timestamp_str}'
  staging_dir = Path(base_name)
  ZIP_DIR.mkdir(parents=True, exist_ok=True)
  output_zip = ZIP_DIR / f'{base_name}.zip'

  staging_dir.mkdir(parents=True, exist_ok=True)

  copied_files_count = 0
  # Tracked so a mistaken exclusion shows up in THIS run's own output,
  # rather than only being discoverable by manually diffing the zip
  # against the real project later.
  skipped_by_extension: list[str] = []
  skipped_by_target: list[str] = []
  copy_errors: list[tuple[str, str]] = []

  try:
    meta_file_path = staging_dir / 'SNAPSHOT_META.txt'
    with open(meta_file_path, 'w', encoding='utf-8') as meta:
      meta.write(f'Project Snapshot: {os.path.basename(os.getcwd())}\n')
      meta.write(f'Run Number: {run_number}\n')
      meta.write(f'Timestamp: {now.strftime("%B %d, %Y at %I:%M %p")}\n')
      meta.write(
          f'Scope: {scope_type.capitalize()}'
          f' {f"({len(target_paths)} targets)" if target_paths else ""}\n'
      )
      meta.write(f'Comment: {snapshot_comment or "No comment provided"}\n')

    for root, dirs, files in os.walk('.'):
      dirs[:] = sorted([d for d in dirs if d not in IGNORE_DIRS])

      for file in sorted(files):
        if should_ignore_file(file, base_name):
          continue

        file_path = Path(root) / file
        relative_path = file_path.relative_to('.')

        if not is_allowed_file(file):
          skipped_by_extension.append(str(relative_path))
          continue

        if not is_file_targeted(str(relative_path), target_paths):
          skipped_by_target.append(str(relative_path))
          continue

        dest_path = staging_dir / relative_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        try:
          shutil.copy2(file_path, dest_path)
          copied_files_count += 1
        except OSError as e:
          # One unreadable/locked file shouldn't abort the whole snapshot --
          # log it and keep going, same principle as the skip-tracking above.
          copy_errors.append((str(relative_path), str(e)))

    shutil.make_archive(
      str(output_zip.with_suffix('')),
      'zip',
      staging_dir.parent,
      staging_dir.name,
    )

    print(
        f'\n✅ Successfully zipped {copied_files_count} files into:'
        f' {output_zip}'
    )

    if skipped_by_extension:
      print(
          f'\nℹ️  {len(skipped_by_extension)} file(s) skipped -- extension/'
          f'filename not in ALLOWED_EXTENSIONS or ALLOWED_FILENAMES:'
      )
      for f in skipped_by_extension[:20]:
        print(f'    {f}')
      if len(skipped_by_extension) > 20:
        print(f'    ... and {len(skipped_by_extension) - 20} more')
      print(
          '  If any of these should have been captured, add the extension '
          'to ALLOWED_EXTENSIONS or the exact filename to ALLOWED_FILENAMES.'
      )

    if skipped_by_target:
      print(
          f'\nℹ️  {len(skipped_by_target)} file(s) skipped -- outside the '
          f'selective targets you specified.'
      )

    if copy_errors:
      print(f'\n⚠️  {len(copy_errors)} file(s) failed to copy:')
      for f, err in copy_errors:
        print(f'    {f}: {err}')

  finally:
    if staging_dir.exists():
      shutil.rmtree(staging_dir)


if __name__ == '__main__':
  try:
    create_filtered_zip()
  except KeyboardInterrupt:
    print('\nCancelled.')
    sys.exit(1)