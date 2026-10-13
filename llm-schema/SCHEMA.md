# Probashi Footballers Database Schema

## Purpose

This document defines the preferred structure for player records.

The schema exists to ensure consistency between human contributors and AI systems.

---

# Core Principles

1. Consistency is preferred over perfection.
2. Unknown information should remain blank.
3. Do not invent values.
4. Do not guess player details.
5. Every update should be traceable to one or more sources.

---

# Recommended Unique Identifier

Each player should have a permanent ID.

Example:

PF000001
PF000002
PF000003

The player ID never changes.

---

# Player Record

## player_id

Type:

String

Example:

PF000001

Unique identifier.

---

## name

Type:

String

Example:

Hamza Choudhury

Use the most commonly used football name.

---

## first_name

Type:

String

Optional.

---

## last_name

Type:

String

Optional.

---

## gender

Allowed Values:

- Male
- Female

---

## birth_date

Format:

YYYY-MM-DD

Example:

2005-03-05

Leave blank if unknown.

---

## birth_year

Format:

YYYY

Example:

2005

Use when only the year is known.

---

## country_of_birth

Example:

England

---

## eligible_nations

Example:

Bangladesh;England

Use semicolon separation.

---

## current_club

Example:

Leicester City

---

## competition

Example:

Premier League 2

---

## position

Examples:

Goalkeeper

Defender

Midfielder

Forward

---

## preferred_foot

Allowed Values:

Right

Left

Both

Blank

---

## status

Allowed Values:

Active

Inactive

Status Unknown

Retired

Duplicate

Needs Verification

---

## last_verified

Format:

YYYY-MM-DD

Date last checked.

---

## source_count

Number of verified sources.

Example:

3

---

## notes

Free text.

Should remain short.

---

# Archiving Rules

If a player becomes difficult to verify:

Move status to:

Status Unknown

instead of deleting immediately.

---

# Duplicate Rules

Do not create a new player record if a matching player already exists.

Check:

- Name
- Date of Birth
- Club
- Nationality
- Social Media Profiles

before creating a new record.

---

# Validation Rules

Never:

- Invent dates
- Invent clubs
- Invent nationalities
- Invent positions

If uncertain:

Leave blank and flag for review.
