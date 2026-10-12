Extract player data from the attached image(s), links and/or text information, and format it as CSV rows following the precise schema and rules outlined below. Output ONLY the CSV block without any introductory or concluding text. Format the data into a string I can copy paste into any spreadsheet editor where I will be editing the .csv database.

### Target Schema
The CSV headers (first row) are:
Given Names(s),Last Name,Positions,YYYY,MM/DD,Age,Birthplace,Citizenship,Club Name,Club Country,Tier,Notes,NT,Tier,Caps,Gls.,Last Update,Sorting String

1. **Positions:** 
   * Use 2/3 letter abbreviations (e.g., FW, MF, DF, CAM, CM, LW).
   * If a player has multiple positions (e.g., CM/CAM), split them with a comma and space, and enclose in quotes (e.g., `"CM, CAM"`).

2. **Birth Year (YYYY) & Birth Date (MM/DD):**
   * Format `MM/DD` as 2-digit month and 2-digit day (e.g., `09/06`). Ensure they are enclosed in double quotes, (e.g `"10/02"`) to ensure they are encoded as text in the .csv file for any editor. 
   * If `MM/DD` is unknown, enter `??`.
   * If `YYYY` is missing but `Age` is provided, calculate `YYYY` by subtracting `Age` from the current year (2026). (e.g., Age 15 in 2026 = 2011).

3. **Citizenship:**
   * Use ISO 3166-1 alpha-3 country codes (e.g., USA, ENG, CAN, THA).
   * If multiple citizenship/nationalities are provided, separate them with a comma and space, and wrap the field in quotes (e.g., `"USA, THA"`).await
   * Do not include Bangladeshi Citizenship (BAN) in this field.

4. **Club & Tier:**
   * `Club Name`: List the primary official club name.
   * `Country`: Country where the club competes using FIFA 3-letter codes.
   * `Tier`: Use `YA` for Youth/Academy teams, `AM` for Amateur, `CL` for College/University, or numeric tier (1-12) if explicitly specified for a senior team.
	   * In the case for Youth/Academy teams, if a senior team exists, then use the name of the senior team in the club name field, and the tier of the senior team in the tier field, and explain in the Notes field where the player plays at. For example, if a player plays for the U21 academy of a English Premier League Team, `Club Name` will be the name of the parent club in the Premier Leauge, `Tier` will be `1`. In the `Notes` field, explain that the player is with the U21 team (e.g. `"Plays for U21 team, parent club in ENG-1"`)
   * `Notes`: If the player plays for a specific youth side (e.g., U16/U17) or specific league, detail it here (e.g., "Plays for U16 team in CJSL D1").

5. **National Team Info (NT, Tier, Caps, Gls.):**
   * If National Team information is unavailable, fill each of these four columns with a hyphen (`-`).
   * Senior National Team caps/goals take precedence. `NT Tier` should say `Senior`, if the player has U21/U19/etc national team caps, and then later gets senior caps, the caps/goals should only show the senior caps. In the notes, explain that the player has age-group caps in addition to any other comments added to the field previously. 

6. **Last Update:**
   * Set to today's date in `MM/DD/YYYY` format.

7. **Sorting String:**
   * Auto-generate using the formula: `Club Country,Last Name,Given Names(s),YYYY,Club Name`
   * Wrap the entire string in quotes (e.g., `"BAN,Boka Striker,Ashraful,1971,Goal Dite Pare Na F.C."`).

After you read through this, wait for further instructions for me to start giving you player information. 
