# Data Folder
This folder contains the 2 .csv files that list all Bangladeshi-origin players that are presented on the website. Feel free to download for your own uses.

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

The JavaScript on the website should automatically sort the data when presenting it. However, you can apply an AutoFilter on Row 1, and sort column R by Ascending to make it easier to read when editing the file later. 
