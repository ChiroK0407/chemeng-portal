import os
from pathlib import Path

def create_project_structure():
    # Define the base structure using a dictionary
    # Keys with empty lists/dicts represent empty directories
    structure = {
        "server": {
            "prisma": {},
            "src": {
                "controllers": [
                    "auth.controller.ts",
                    "psu.controller.ts",
                    "project.controller.ts",
                    "blog.controller.ts",
                    "event.controller.ts",
                    "opportunity.controller.ts",
                    "member.controller.ts",
                    "resource.controller.ts",
                    "admin.controller.ts"
                ],
                "routes": [
                    "auth.routes.ts",
                    "psu.routes.ts",
                    "project.routes.ts",
                    "blog.routes.ts",
                    "event.routes.ts",
                    "opportunity.routes.ts",
                    "member.routes.ts",
                    "resource.routes.ts",
                    "admin.routes.ts"
                ],
                "middleware": [
                    "auth.middleware.ts",
                    "admin.middleware.ts",
                    "error.middleware.ts"
                ],
                "services": [
                    "auth.service.ts",
                    "email.service.ts",
                    "token.service.ts"
                ],
                "emails": [
                    "welcome.email.ts",
                    "reset-password.email.ts",
                    "verify-email.email.ts"
                ],
                "lib": [
                    "prisma.ts"
                ],
                "files": [
                    "index.ts"
                ]
            },
            "files": [
                ".env",
                "package.json"
            ]
        }
    }

    def build_structure(base_path, struct):
        for key, value in struct.items():
            # Skip the special tracking key for files inside a directory
            if key == "files":
                continue
                
            current_path = base_path / key
            
            if isinstance(value, dict):
                # Create directory
                current_path.mkdir(parents=True, exist_ok=True)
                print(f"📁 Created directory: {current_path}")
                
                # If there are standalone files targeted for this directory level
                if "files" in value:
                    for file in value["files"]:
                        file_path = current_path / file
                        file_path.touch(exist_ok=True)
                        print(f"📄 Created file:      {file_path}")
                        
                # Recursively build nested structures
                build_structure(current_path, value)
                
            elif isinstance(value, list):
                # Create the directory container for the list of files
                current_path.mkdir(parents=True, exist_ok=True)
                print(f"📁 Created directory: {current_path}")
                
                # Create each file inside the list
                for file in value:
                    file_path = current_path / file
                    file_path.touch(exist_ok=True)
                    print(f"📄 Created file:      {file_path}")

    # Set the starting point to the current working directory where the script runs
    root_path = Path.cwd()
    print(f"🚀 Starting project scaffolding in: {root_path}\n")
    build_structure(root_path, structure)
    print("\n✅ Project structure created successfully!")

if __name__ == "__main__":
    create_project_structure()