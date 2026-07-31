# This script will update the age and sorting string columns of mens.csv and women.csv whenever there is a commit to these files.

import csv
import os
from datetime import datetime
import sys
import re

def calculate_age_from_columns(row, header):
    """
    Calculate age based on YYYY and MM/DD columns
    Similar to Excel formula: =IFERROR(IFERROR(DATEDIF(E2&"/"&D2,TODAY(),"Y"),DATEDIF("1/1/"&D2,TODAY(),"Y")),"??")
    """
    try:
        # Find column indices
        yyyy_idx = header.index('YYYY') if 'YYYY' in header else -1
        mmdd_idx = header.index('MM/DD') if 'MM/DD' in header else -1
        
        if yyyy_idx == -1 or mmdd_idx == -1:
            return '??'
        
        yyyy = row[yyyy_idx].strip() if yyyy_idx < len(row) else ''
        mmdd = row[mmdd_idx].strip() if mmdd_idx < len(row) else ''
        
        # If YYYY is ?? or empty
        if not yyyy or yyyy == '??':
            return '??'
        
        # Try to parse the date
        try:
            year = int(yyyy)
        except ValueError:
            return '??'
        
        # Handle MM/DD format
        if mmdd and mmdd != '??' and '/' in mmdd:
            parts = mmdd.split('/')
            if len(parts) == 2:
                month = int(parts[0])
                day = int(parts[1])
                
                # Try with full date
                try:
                    birth_date = datetime(year, month, day)
                    today = datetime.now()
                    age = today.year - birth_date.year
                    # Check if birthday has passed this year
                    if (today.month, today.day) < (birth_date.month, birth_date.day):
                        age -= 1
                    return str(age)
                except ValueError:
                    # If date is invalid, try with Jan 1
                    try:
                        birth_date = datetime(year, 1, 1)
                        today = datetime.now()
                        age = today.year - birth_date.year
                        return str(age)
                    except:
                        return '??'
        else:
            # If MM/DD is ?? or invalid, use Jan 1
            try:
                birth_date = datetime(year, 1, 1)
                today = datetime.now()
                age = today.year - birth_date.year
                return str(age)
            except:
                return '??'
                
    except Exception as e:
        print(f"  Error calculating age: {e}")
        return '??'

def generate_sorting_string(row, header):
    """
    Generate sorting string based on formula: J2&","&B2&","&A2&","&D2&","&I2
    Where: J=Country, B=Last Name, A=Given Names(s), D=YYYY, I=Club Name
    """
    try:
        # Map columns to indices
        col_map = {
            'Country': header.index('Country') if 'Country' in header else -1,
            'Last Name': header.index('Last Name') if 'Last Name' in header else -1,
            'Given Names(s)': header.index('Given Names(s)') if 'Given Names(s)' in header else -1,
            'YYYY': header.index('YYYY') if 'YYYY' in header else -1,
            'Club Name': header.index('Club Name') if 'Club Name' in header else -1
        }
        
        # Check if all required columns exist
        for col_name in ['Country', 'Last Name', 'Given Names(s)', 'YYYY', 'Club Name']:
            if col_map[col_name] == -1:
                print(f"  Warning: Column '{col_name}' not found in header")
                return ''
        
        # Get values in order: Country, Last Name, Given Names(s), YYYY, Club Name
        values = []
        for col_name in ['Country', 'Last Name', 'Given Names(s)', 'YYYY', 'Club Name']:
            idx = col_map[col_name]
            if idx < len(row):
                val = row[idx].strip()
                # Handle empty/unknown values
                if not val:
                    val = '??'
                values.append(val)
            else:
                values.append('??')
        
        return ','.join(values)
        
    except Exception as e:
        print(f"  Error generating sorting string: {e}")
        return ''

def process_csv_file(filepath):
    """Process a single CSV file"""
    print(f"Processing {filepath}...")
    
    # Read the CSV file
    rows = []
    with open(filepath, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        header = next(reader)  # Read header
        rows = list(reader)
    
    # Find column indices for Age and Sorting String
    try:
        age_idx = header.index('Age') if 'Age' in header else -1
        sort_idx = header.index('Sorting String') if 'Sorting String' in header else -1
        
        if age_idx == -1:
            print("  Warning: 'Age' column not found in header")
            # Try to find it by position (6th column, 0-indexed)
            if len(header) > 6:
                age_idx = 6
                print(f"  Using position {age_idx} for Age column")
            else:
                return False
        
        if sort_idx == -1:
            print("  Warning: 'Sorting String' column not found in header")
            # Try to find it by position (17th column, 0-indexed)
            if len(header) > 17:
                sort_idx = 17
                print(f"  Using position {sort_idx} for Sorting String column")
            else:
                return False
        
        # Ensure all rows have enough columns
        max_cols = max(len(row) for row in rows)
        needed_cols = max(age_idx, sort_idx, len(header)) + 1
        
        if max_cols < needed_cols:
            print(f"  Adding {needed_cols - max_cols} columns to rows...")
            for row in rows:
                while len(row) < needed_cols:
                    row.append('')
        
        # Process each row
        updated_rows = 0
        for i, row in enumerate(rows):
            if not any(row):  # Skip completely empty rows
                continue
            
            # Calculate age
            age = calculate_age_from_columns(row, header)
            if age_idx < len(row):
                old_age = row[age_idx] if age_idx < len(row) else ''
                if old_age != age:
                    row[age_idx] = age
                    updated_rows += 1
            
            # Generate sorting string
            sort_string = generate_sorting_string(row, header)
            if sort_idx < len(row):
                old_sort = row[sort_idx] if sort_idx < len(row) else ''
                if old_sort != sort_string:
                    row[sort_idx] = sort_string
                    updated_rows += 1
        
        if updated_rows > 0:
            print(f"  Updated {updated_rows} rows in {filepath}")
        else:
            print(f"  No changes needed in {filepath}")
        
        # Write back the updated CSV
        with open(filepath, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(header)
            writer.writerows(rows)
        
        return True
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    # Get the repository root
    repo_root = os.getenv('GITHUB_WORKSPACE', '.')
    
    # Define CSV files to process
    csv_files = [
        os.path.join(repo_root, 'women.csv'),
        os.path.join(repo_root, 'men.csv'),
    ]
    
    success = True
    for csv_file in csv_files:
        if os.path.exists(csv_file):
            if not process_csv_file(csv_file):
                success = False
        else:
            print(f"File not found: {csv_file}")
    
    if success:
        print("All files processed successfully!")
        sys.exit(0)
    else:
        print("Some files failed to process")
        sys.exit(1)

if __name__ == "__main__":
    main()
