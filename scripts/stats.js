// stats.js - Analyze player data from both mens.csv and womens.csv

// Global variables
let menData = [];
let womenData = [];
let isLoading = true;

// Position categories mapping - UPDATED
const positionCategories = {
    'Forwards': ['ST', 'CF', 'FW'],
    'Midfielders': ['LM', 'CM', 'CAM', 'CDM', 'RM', 'MF'],
    'Defenders': ['LB', 'CB', 'RB', 'DF'],
    'Wingers': ['LW', 'RW', 'LWB', 'RWB'],
    'Goalkeepers': ['GK']
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    displayStats();
    setupMobileMenu();
});

// Load both CSV files
async function loadAllData() {
    try {
        // Show loading state
        document.getElementById('loadingMessage').style.display = 'block';

        // Load men's data
        try {
            const menResponse = await fetch('data/mens.csv');
            if (menResponse.ok) {
                const menText = await menResponse.text();
                menData = parseCSV(menText);
                // Remove header row
                if (menData.length > 0 && menData[0][0].includes('Given Names')) {
                    menData = menData.slice(1);
                }
                console.log(`Loaded ${menData.length} men's players`);
            } else {
                console.warn('Men\'s data file not found');
            }
        } catch (error) {
            console.warn('Error loading men\'s data:', error);
        }

        // Load women's data
        try {
            const womenResponse = await fetch('data/women.csv');
            if (womenResponse.ok) {
                const womenText = await womenResponse.text();
                womenData = parseCSV(womenText);
                // Remove header row
                if (womenData.length > 0 && womenData[0][0].includes('Given Names')) {
                    womenData = womenData.slice(1);
                }
                console.log(`Loaded ${womenData.length} women's players`);
            } else {
                console.warn('Women\'s data file not found');
            }
        } catch (error) {
            console.warn('Error loading women\'s data:', error);
        }

        // Hide loading state
        document.getElementById('loadingMessage').style.display = 'none';

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loadingMessage').innerHTML = 'Error loading database file.';
    }
}

// Parse CSV function (copied from script.js)
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    return lines.map(line => {
        const values = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
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

// Extract country from player data (column index 9)
function getPlayerCountry(player) {
    return player[9] || 'Unknown';
}

// Extract NT from player data (column index 12)
function getPlayerNT(player) {
    return player[12] || '';
}

// Extract position from player data (column index 2) - HANDLES MULTIPLE POSITIONS
function getPlayerPositions(player) {
    const positionField = player[2] || '';
    // Split by comma and clean up each position
    return positionField.split(',').map(pos => pos.trim()).filter(pos => pos && pos !== '??' && pos !== 'Unknown');
}

// Categorize position - CHECKS EACH POSITION INDIVIDUALLY
function categorizePosition(position) {
    if (!position) return 'Unknown';

        const positionUpper = position.toUpperCase().trim();

        for (const [category, positions] of Object.entries(positionCategories)) {
            for (const pos of positions) {
                // Check if the position exactly matches or contains the category code
                if (positionUpper === pos || positionUpper.includes(pos)) {
                    return category;
                }
            }
        }

        return 'Other';
}

// Calculate statistics
function calculateStats(data) {
    const stats = {
        total: data.length,
        countries: new Set(),
        countryCounts: {}, // Track frequency of each country
        positions: {
            'Forwards': 0,
            'Midfielders': 0,
            'Wingers': 0,
            'Defenders': 0,
            'Goalkeepers': 0,
            'Other': 0,
            'Unknown': 0
        },
        ntCallups: {
            'Bangladesh': 0,
            'Other Countries': 0,
            'No NT': 0
        }
    };

    data.forEach(player => {
        // Count countries - Ignore empty, '-', and '~~~' (Unattached/Unknown)
        const countryRaw = getPlayerCountry(player);
        if (countryRaw && countryRaw !== '-' && countryRaw !== '~~~' && countryRaw.toUpperCase() !== 'UNKNOWN') {
            const country = countryRaw.trim().toUpperCase();
            stats.countries.add(country);

            // Increment country frequency count
            stats.countryCounts[country] = (stats.countryCounts[country] || 0) + 1;
        }

        // NT Callups
        const nt = getPlayerNT(player);
        if (nt === 'BAN') {
            stats.ntCallups['Bangladesh']++;
        } else if (nt && nt !== '-' && nt !== '') {
            stats.ntCallups['Other Countries']++;
        } else {
            stats.ntCallups['No NT']++;
        }

        // Positions
        const positions = getPlayerPositions(player);
        if (positions.length === 0) {
            stats.positions['Unknown']++;
        } else {
            const countedCategories = new Set();
            positions.forEach(position => {
                const category = categorizePosition(position);
                if (category !== 'Unknown' && category !== 'Other') {
                    countedCategories.add(category);
                }
            });

            if (countedCategories.size > 0) {
                countedCategories.forEach(category => {
                    stats.positions[category] = (stats.positions[category] || 0) + 1;
                });
            } else {
                stats.positions['Other']++;
            }
        }
    });

    return stats;
}

// Display statistics
function displayStats() {
    const menStats = calculateStats(menData);
    const womenStats = calculateStats(womenData);

    console.log('Men stats:', menStats);
    console.log('Women stats:', womenStats);

    // Helper to safely set text content only if the element exists in HTML
    const safeSetText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

        // Update summary cards
        safeSetText('totalMen', menStats.total.toLocaleString());
        safeSetText('totalWomen', womenStats.total.toLocaleString());

        // Update countries count
        safeSetText('menCountries', menStats.countries.size.toLocaleString());
        safeSetText('womenCountries', womenStats.countries.size.toLocaleString());

        // Update NT callups
        safeSetText('menNTBangladesh', menStats.ntCallups['Bangladesh'].toLocaleString());
        safeSetText('menNTOther', menStats.ntCallups['Other Countries'].toLocaleString());
        safeSetText('menNTNone', menStats.ntCallups['No NT'].toLocaleString());
        safeSetText('womenNTBangladesh', womenStats.ntCallups['Bangladesh'].toLocaleString());
        safeSetText('womenNTOther', womenStats.ntCallups['Other Countries'].toLocaleString());
        safeSetText('womenNTNone', womenStats.ntCallups['No NT'].toLocaleString());

        // Update position table
        const positionRows = {
            'Forwards': 'forwardsRow',
            'Wingers': 'wingersRow',
            'Midfielders': 'midfieldersRow',
            'Defenders': 'defendersRow',
            'Goalkeepers': 'goalkeepersRow',
            'Other': 'otherRow'
        };

        for (const [position, rowId] of Object.entries(positionRows)) {
            const menCount = menStats.positions[position] || 0;
            const womenCount = womenStats.positions[position] || 0;

            safeSetText(`${rowId}Men`, menCount.toLocaleString());
            safeSetText(`${rowId}Women`, womenCount.toLocaleString());
        }

        // Render Top 5 Countries Tables
        renderTopCountriesTable('menTopCountriesBody', menStats.countryCounts);
        renderTopCountriesTable('womenTopCountriesBody', womenStats.countryCounts);

        updateLastUpdateDate();
}

// Helper: Generates and injects text-only rows for the Top 5 Countries tables
function renderTopCountriesTable(targetElementId, countryCounts) {
    const tableBody = document.getElementById(targetElementId);
    if (!tableBody) return;

        // Sort countries by count (descending) and take top 5
        const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

        tableBody.innerHTML = '';

        if (sortedCountries.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 15px; color: #777;">No data available</td></tr>`;
            return;
        }

        sortedCountries.forEach(([code, count], index) => {
            const rank = index + 1;

            // Use global countryCodeMap (from countries.js) if available, fallback to code
            const displayName = (typeof countryCodeMap !== 'undefined' && countryCodeMap[code]) ? countryCodeMap[code] : code;

            const row = document.createElement('tr');
            row.innerHTML = `
            <td style="text-align: center; font-weight: bold; width: 60px; color: #115c32;">#${rank}</td>
            <td class="category-name" style="font-weight: 500;">
            ${displayName}
            </td>
            <td class="number-cell" style="font-weight: bold; text-align: right;">${count.toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
}

// Update last updated timestamp from actual data
function updateLastUpdateDate() {
    // Combine men and women data
    const allData = [...menData, ...womenData];
    let latestDate = null;

    allData.forEach(player => {
        const updateDate = player[16]; // Last Update column
        if (updateDate && updateDate !== "Status Unknown" && updateDate !== "-") {
            const dateStr = updateDate.trim();

            // Try different date formats
            if (dateStr.includes('/')) {
                // Format: MM/DD/YYYY or MM/DD/YY
                const dateParts = dateStr.split('/');
                if (dateParts.length === 3) {
                    let year = dateParts[2];
                    if (year.length === 2) {
                        year = '20' + year;
                    }
                    const date = new Date(year, dateParts[0] - 1, dateParts[1]);
                    if (!isNaN(date) && (!latestDate || date > latestDate)) {
                        latestDate = date;
                    }
                }
            } else if (dateStr.includes('-')) {
                // Format: YYYY-MM-DD
                const dateParts = dateStr.split('-');
                if (dateParts.length === 3) {
                    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                    if (!isNaN(date) && (!latestDate || date > latestDate)) {
                        latestDate = date;
                    }
                }
            }
        }
    });

    if (latestDate) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        document.getElementById('statsUpdated').textContent = latestDate.toLocaleDateString('en-US', options);
    } else {
        document.getElementById('statsUpdated').textContent = 'Unknown';
    }
}

// Setup mobile menu (copied from main script)
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}
