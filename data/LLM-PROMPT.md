# LLM Prompt
If you want to use an LLM to add lines to the CSV files based on screenshots people send you, you can use the following LLM prompt:

---

Extract player data from the attached image(s) and format it as CSV rows following the precise schema and rules outlined below. Output ONLY the CSV block without any introductory or concluding text.

### Target Schema
The CSV headers (first row) are:
Given Names(s),Last Name,Positions,YYYY,MM/DD,Age,Birthplace,Citizenship,Club Name,Country,Tier,Notes,NT,Tier,Caps,Gls.,Last Update,Sorting String

### Data Extraction Rules

1. **Positions:** 
   * Use 2/3 letter abbreviations (e.g., FW, MF, DF, CAM, CM, LW).
   * If a player has multiple positions (e.g., CM/CAM), split them with a comma and space, and enclose in quotes (e.g., `"CM, CAM"`).

2. **Birth Year (YYYY) & Birth Date (MM/DD):**
   * Format `MM/DD` as 2-digit month and 2-digit day (e.g., `09/06`).
   * If `MM/DD` is unknown, enter `??`.
   * If `YYYY` is missing but `Age` is provided, calculate `YYYY` by subtracting `Age` from the current year (2026). (e.g., Age 15 in 2026 = 2011).

3. **Citizenship:**
   * Use ISO 3166-1 alpha-3 country codes (e.g., USA, ENG, CAN, THA).
   * If multiple citizenship/nationalities are provided, separate them with a comma and space, and wrap the field in quotes (e.g., `"USA, THA"`).

4. **Club & Tier:**
   * `Club Name`: List the primary official club name.
   * `Country`: Country where the club competes using FIFA 3-letter codes.
   * `Tier`: Use `YA` for Youth/Academy teams, `AM` for Amateur, `CL` for College/University, or numeric tier (1-12) if explicitly specified for a senior team.
   * `Notes`: If the player plays for a specific youth side (e.g., U16/U17) or specific league, detail it here (e.g., "Plays for U16 team in CJSL D1").

5. **National Team Info (NT, Tier, Caps, Gls.):**
   * If National Team information is unavailable, fill each of these four columns with a hyphen (`-`).

6. **Last Update:**
   * Set to today's date in `MM/DD/YYYY` format.

7. **Sorting String:**
   * Auto-generate using the formula: `Country,Last Name,Given Names(s),YYYY,Club Name`
   * Wrap the entire string in quotes (e.g., `"BAN,Boka Striker,Ashraful,1971,Goal Dite Pare Na F.C."`).
