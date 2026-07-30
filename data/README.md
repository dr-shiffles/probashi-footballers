# Data Folder
This folder contains the Player Database in 2 separate files by gender, 'mens.csv' and 'women.csv'. The data in these 2 files are updated manually.

Once the files are updated, a Github worker/action is used to update the 'lastUpdate.json' file to record the last time there was a change to the database. This date is to be presented at the bottom of the website (WIP)

## Editing the File
Please use LibreOffice Calc to edit the .csv file for best compatibility and to avoid issues with data formats being changed without your knowledge. 

For example, Microsoft Excel has a habit of changing the values in column E to dates ending in the current year the file is opened, i.e. 10/12 becomes 10/12/2026. This breaks the age calculation formula below. LibreOffice Calc treats this column as text. 

## Formulae to use for .CSV file when modifying:

**Age (Column F):** 

`=IFERROR(IFERROR(DATEDIF(E2&"/"&D2,TODAY(),"Y"),DATEDIF("1/1/"&D2,TODAY(),"Y")),"??")`

Put this in cell **F2** when editing the .csv in LibreOffice and autofill.

**Sorting Function (Column R):** 

`=J2&","&B2&","&A2&","&D2&","&I2`

Put this in cell **R2** when editing the .csv in LibreOffice and autofill.

The JavaScript on the website should automatically sort the data when presenting it. 
However, you can apply an AutoFilter on Row 1, and sort column R by Ascending to make it easier to read when editing the file later. 
