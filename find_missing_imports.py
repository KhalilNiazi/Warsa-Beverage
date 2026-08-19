import os

def check_files():
    for root, dirs, files in os.walk('src/pages'):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                    
                has_dialog = '<ResponsiveDialog' in content
                has_import = 'ResponsiveDialog' in content and 'import' in content and 'responsive-dialog' in content
                
                if has_dialog and not has_import:
                    print(f"Missing ResponsiveDialog import in: {path}")

check_files()
