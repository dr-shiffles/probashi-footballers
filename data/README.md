# Data Folder

This folder contains the Player Database split into two separate files by gender:

- **`mens.csv`** – Men's player data
- **`women.csv`** – Women's player data

These files are updated manually. It is highly recommended that these files be downloaded first and edited locally, instead of using GitHub's web interface directly.

## Folder Structure

data/
├── mens.csv           # Men's player database
├── women.csv          # Women's player database
├── lastUpdate.json    # Auto-updated timestamp file
└── README.md          # This file

## Editing the Files

Please use a spreadsheet editor to edit these files. **LibreOffice Calc** is recommended for best compatibility.

### Editing Checklist

1. Open the `.csv` file in LibreOffice Calc (or another spreadsheet editor)
2. Add or update player rows as needed
3. Ensure formulas in columns **F** and **R** are applied to all rows
4. Save the file as `.csv` (UTF-8 encoding recommended)
5. Commit and push the changes

## Formulas to Use

### Age (Column F)
Place this in cell **F2** and autofill down:

`=IFERROR(IFERROR(DATEDIF(E2&"/"&D2,TODAY(),"Y"),DATEDIF("1/1/"&D2,TODAY(),"Y")),"??")`

- Calculates age based on birth date (month/day in column E, year in column D)  
- Falls back to `??` if data is missing or invalid

### Sorting Helper (Column R)
Place this in cell **R2** and autofill down:

`=J2&","&B2&","&A2&","&D2&","&I2`

- Concatenates key fields for easier sorting
- The website's JavaScript handles sorting automatically, but this column helps when manually reviewing the file

### Optional: Apply AutoFilter
To make manual editing easier:

1. Select Row 1
2. Apply **AutoFilter**
3. Sort column **R** in Ascending order

This groups similar players together and makes the file easy to read.

## Automation Scripts

When changes are pushed to this folder, a **GitHub Action** automatically:

- Detects the update
- Updates `lastUpdate.json` with the current timestamp

This timestamp is displayed at the bottom of the website to show when the database was last modified.

## Check Website Was Updated

After editing and pushing:

1. Wait for the GitHub Action to complete (check the Actions tab)
2. Verify `lastUpdate.json` was updated
3. Visit the live site to confirm the data appears correctly
   - You may need to use incognito/private mode to bypass cached content

## Questions?

If you run into any issues, please open an issue in the repository or reach out to me via Twitter/X.
