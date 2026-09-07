import os
from pathlib import Path

def create_project_structure():
    # Define the project root relative to where the script is run
    root_dir = Path.cwd()
    
    # List of all directories to create
    directories = [
        # Source Components
        "src/components/ui",
        "src/components/layout",
        "src/components/shared",
        
        # Pages
        "src/pages/auth",
        "src/pages/psu",
        "src/pages/projects",
        "src/pages/blogs",
        "src/pages/members",
        "src/pages/opportunities",
        "src/pages/events",
        "src/pages/resources",
        "src/pages/dashboard",
        "src/pages/admin",
        
        # Core Architecture Folders
        "src/layouts",
        "src/routes",
        "src/hooks",
        "src/services",
        "src/api",
        "src/context",
        "src/store",
        "src/lib",
        "src/utils",
        "src/types",
        "src/features",
        "src/styles",
    ]
    
    print(f"🚀 Initializing project structure in: {root_dir}\n")
    
    created_count = 0
    for dir_path in directories:
        # Resolve full path
        target_path = root_dir / dir_path
        
        # parents=True creates missing parent folders (like src/ or src/pages/)
        # exist_ok=True prevents crashes if the folder already exists
        if not target_path.exists():
            target_path.mkdir(parents=True, exist_ok=True)
            print(f"📁 Created: {dir_path}")
            created_count += 1
        else:
            print(f"🟡 Already exists: {dir_path}")
            
    print(f"\n✅ Setup complete! Created {created_count} new directories.")

if __name__ == "__main__":
    create_project_structure()