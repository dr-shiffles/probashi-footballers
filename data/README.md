# Data Folder

This folder contains the 2 .csv files that list all Bangladeshi-origin players that are presented on the website.
Feel free to download for your own uses.

## Formulae to use for .CSV file when modifying:

**Sorting Function:** =J2&","&B2&","&A2&","&D2&","&I2

For new database version with flags: =RIGHT($J2,3)&","&B2&","&A2&","&D2&","&I2

**Age:** =IFERROR(IFERROR(DATEDIF(E2&"/"&D2,TODAY(),"Y"),DATEDIF("1/1/"&D2,TODAY(),"Y")),"??")

Please use LibreOffice to edit the .CSV files. Microsoft Excel, despite multiple attempts to configure it, will make all the dates end in the current year, i.e. 10/12 becomes 10/12/2026. This breaks the above age formula. 
