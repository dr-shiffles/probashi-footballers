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

// Calculate statistics - UPDATED TO HANDLE MULTIPLE POSITIONS PER PLAYER
function calculateStats(data) {
    const stats = {
        total: data.length,
        countries: new Set(),
        positions: {
            'Forwards': 0,
            'Midfielders': 0,
            'Wingers': 0,
            'Defenders': 0,
            'Goalkeepers': 0,
            'Other': 0,
            'Unknown': 0
        }
    };

    data.forEach(player => {
        // Count countries
        const country = getPlayerCountry(player);
        if (country && country !== '-') {
            stats.countries.add(country);
        }

        // Get all positions for this player
        const positions = getPlayerPositions(player);

        if (positions.length === 0) {
            // No position listed
            stats.positions['Unknown']++;
        } else {
            // Track which categories this player has been counted in
            const countedCategories = new Set();

            // Check each position
            positions.forEach(position => {
                const category = categorizePosition(position);
                if (category !== 'Unknown' && category !== 'Other') {
                    countedCategories.add(category);
                }
            });

            // If we found specific categories, count them
            if (countedCategories.size > 0) {
                countedCategories.forEach(category => {
                    stats.positions[category] = (stats.positions[category] || 0) + 1;
                });
            } else {
                // No matching categories found
                stats.positions['Other']++;
            }
        }
    });

    return stats;
}

// Display statistics in the table
function displayStats() {
    const menStats = calculateStats(menData);
    const womenStats = calculateStats(womenData);

    console.log('Men stats:', menStats);
    console.log('Women stats:', womenStats);

    // Update summary cards
    document.getElementById('totalMen').textContent = menStats.total.toLocaleString();
    document.getElementById('totalWomen').textContent = womenStats.total.toLocaleString();

    // Update countries count
    document.getElementById('menCountries').textContent = menStats.countries.size.toLocaleString();
    document.getElementById('womenCountries').textContent = womenStats.countries.size.toLocaleString();


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

        document.getElementById(`${rowId}Men`).textContent = menCount.toLocaleString();
        document.getElementById(`${rowId}Women`).textContent = womenCount.toLocaleString();
    }

    // Update last updated timestamp - DATE ONLY (no time)
    const today = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    document.getElementById('statsUpdated').textContent = today.toLocaleDateString('en-US', options);
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
