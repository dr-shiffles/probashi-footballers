# Probashi Footballers Schema

## Principles

1. Never invent information.
2. Unknown values should be blank.
3. Historical information should be preserved.
4. Every update should be traceable to at least one source.
5. Consistency is preferred over perfection.

---

# Future Unique Identifier

Recommended:

PF000001
PF000002
PF000003

Player IDs should never change.

---

# Core Fields

## name

Player's commonly used football name.

Example:

Hamza Choudhury

---

## gender

Allowed:

Male
Female

---

## birth_date

Format:

YYYY-MM-DD

Example:

2005-03-15

Blank if unknown.

---

## birth_year

Use when only year is known.

Example:

2005

---

## country_of_birth

Example:

England

---

## eligible_nations

Format:

Bangladesh;England

Use semicolon separator.

---

## current_club

Example:

Leicester City

---

## competition

Example:

Premier League 2

USL League One

NISA

---

## position

Examples:

Goalkeeper
Defender
Midfielder
Forward

---

## preferred_foot

Values:

Right
Left
Both
Blank

---

## status

Allowed values:

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

Date most recently verified.

---

## source_count

Number of supporting sources.

Example:

3

---

## notes

Short comments only.

Avoid long paragraphs.

---

# Duplicate Detection

When adding players, compare:

- Name
- Club
- Date of Birth
- Nationality
- Social Media Accounts

If uncertain:

Flag for review.

---

# Archiving Rules

Do not immediately delete players.

If verification becomes difficult:

Move status to:

Status Unknown

instead.

---

# Validation Rules

Never infer:

- Date of birth
- Nationality
- Club
- Position

If not confirmed:

Leave blank.

---

# Changelog Categories

Use the following categories:

NEW_PLAYER

PLAYER_UPDATE

TRANSFER

CALLUP

DEBUT

GOAL

NAME_CORRECTION

POSITION_CHANGE

STATUS_CHANGE

REMOVAL

ARCHIVE

These categories should be used when generating changelog entries.
