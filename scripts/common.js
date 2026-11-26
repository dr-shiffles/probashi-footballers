// common.js - helpers shared by the player pages (script.js) and the stats page (stats.js).

// Column positions in mens.csv / women.csv
const COL = {
    GIVEN_NAMES: 0,
    LAST_NAME: 1,
    POSITIONS: 2,
    BIRTH_YEAR: 3,
    BIRTH_DATE: 4,
    AGE: 5,
    BIRTHPLACE: 6,
    CITIZENSHIP: 7,
    CLUB: 8,
    COUNTRY: 9,        // club's country (FIFA code)
    TIER: 10,
    NOTES: 11,
    MARKET_VALUE: 12,
    NT: 13,            // national team (FIFA code)
    NT_TIER: 14,
    CAPS: 15,
    GOALS: 16,
    SOCIALS: 17,
    LAST_UPDATE: 18,
    SORT_KEY: 19       // hidden "Sorting String" column
};

// Parse CSV text into an array of rows (handles quoted fields and "" escapes)
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');

    return lines.map(line => {
        const values = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentValue += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }

        values.push(currentValue);
        return values;
    }).filter(row => row.length > 1);
}

// Fetch a player CSV and return its rows without the header row.
// Throws if the file can't be loaded.
async function loadCSV(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    const rows = parseCSV(await response.text());
    if (rows.length > 0 && rows[0][COL.GIVEN_NAMES].includes('Given Names')) {
        rows.shift();
    }
    return rows;
}

// Fetch data/lastUpdate.json. Returns its contents, or null if unavailable.
async function loadLastUpdate() {
    try {
        const response = await fetch('data/lastUpdate.json');
        if (!response.ok) {
            console.warn('lastUpdate.json not found');
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading lastUpdate.json:', error);
        return null;
    }
}

// True for empty / placeholder codes: "", "-", "---", "~~~" (unattached), "??", "Unknown"
function isBlankCode(value) {
    if (!value) return true;
    const v = value.trim().toUpperCase();
    return v === '' || v === 'UNKNOWN' || /^[-~?]+$/.test(v);
}

// "Given Names Last Name", or "Unknown Player"
function getPlayerName(player) {
    const firstName = (player[COL.GIVEN_NAMES] || '').trim();
    const lastName = (player[COL.LAST_NAME] || '').trim();
    return `${firstName} ${lastName}`.trim() || 'Unknown Player';
}

// National team appearance: 'bangladesh', 'others' or 'none'
function getNTCategory(player) {
    const nt = player[COL.NT];
    if (isBlankCode(nt)) return 'none';
    return nt.trim().toUpperCase() === 'BAN' ? 'bangladesh' : 'others';
}

// "Club Name (COUNTRY-Tier)", "Unattached", or "—"
function formatClub(player) {
    const club = (player[COL.CLUB] || '').trim();
    const country = (player[COL.COUNTRY] || '').trim();
    const tier = (player[COL.TIER] || '').trim();

    if (!club || club === '-') return '—';
    if (club.toLowerCase() === 'unattached') return 'Unattached';
    if (isBlankCode(country)) return club;

    const countryTier = isBlankCode(tier) ? country : `${country}-${tier}`;
    return `${club} (${countryTier})`;
}
