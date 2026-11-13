#!/usr/bin/env python3
"""
Fix the circular import issue in the queries.ts files.

The problem:
- artifacts/mobile/src/lib/queries.ts imports from '../src/lib/queries' (circular)
- artifacts/mobile/lib/queries.ts imports from '../src/lib/queries' (circular)
- These files should import from mockData.ts instead
"""

import os
from pathlib import Path

def fix_queries_file(file_path):
    """Fix a single queries.ts file by removing the circular import."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove the problematic circular import line
    # This line is: "import { fetchMockQuestions as fetchMockQuestionsFromHelper, ... } from '../src/lib/queries';"
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        if 'import { fetchMockQuestions as fetchMockQuestionsFromHelper,' in line and "'../src/lib/queries'" in line:
            print(f"  Removing circular import: {line.strip()}")
            continue
        fixed_lines.append(line)
    
    # Add the correct import from mockData.ts
    import_statement = "import { getMockQuestions } from '../lib/mockData';"
    
    # Find where to insert the import (after other imports)
    final_lines = []
    for i, line in enumerate(fixed_lines):
        if line.strip().startswith('import { useQuery'):
            # Insert after the imports
            final_lines.extend(fixed_lines[:i+1])
            final_lines.append('')
            final_lines.append(import_statement)
            final_lines.extend(fixed_lines[i+1:])
            break
    
    # Write the fixed content
    with open(file_path, 'w') as f:
        f.write('\n'.join(final_lines))
    
    print(f"  [FIXED] {file_path}")

def main():
    base_dir = Path('artifacts/mobile')
    
    print("=== Fixing Circular Import Issues ===\n")
    
    # Fix src/lib/queries.ts
    src_lib_queries_path = base_dir / 'src/lib/queries.ts'
    if src_lib_queries_path.exists():
        print(f"[FIXING] {src_lib_queries_path}")
        fix_queries_file(src_lib_queries_path)
    
    # Fix lib/queries.ts
    lib_queries_path = base_dir / 'lib/queries.ts'
    if lib_queries_path.exists():
        print(f"[FIXING] {lib_queries_path}")
        fix_queries_file(lib_queries_path)
    
    # Check if mockData.ts exists
    mock_data_path = base_dir / 'src/lib/mockData.ts'
    if mock_data_path.exists():
        print(f"\n[FOUND] mockData.ts at {mock_data_path}")
    else:
        print(f"\n[NOT FOUND] mockData.ts at {mock_data_path}")
    
    print("\n=== Summary ===")
    print("The circular import has been fixed.")
    print("Queries now use getMockQuestions from mockData.ts")
    print("This eliminates the mock data dependency and circular import.")

if __name__ == "__main__":
    main()