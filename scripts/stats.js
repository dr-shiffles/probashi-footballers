// stats.js - statistics page. Analyzes mens.csv and women.csv.
// Requires countries.js and common.js.

// Global variables (heatmap.js also reads these)
let menData = [];
let womenData = [];

// Position categories mapping
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
});

// Load both CSV files and the last update date
async function loadAllData() {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'block';

    const loadOrWarn = (path, label) => loadCSV(path)
        .then(rows => {
            console.log(`Loaded ${rows.length} ${label} players`);
            return rows;
        })
        .catch(error => {
            console.warn(`Error loading ${label} data:`, error);
            return [];
        });

    const [men, women, updateData] = await Promise.all([
        loadOrWarn('data/mens.csv', "men's"),
        loadOrWarn('data/women.csv', "women's"),
        loadLastUpdate()
    ]);
    menData = men;
    womenData = women;
    showStatsUpdated(updateData);

    loadingMessage.style.display = 'none';

    // Notify any listeners (e.g. heatmap.js) that data is ready
    document.dispatchEvent(new Event('stats-data-ready'));
}

// "Last updated: <date>" in the page header
function showStatsUpdated(updateData) {
    const dateEl = document.getElementById('statsUpdated');
    if (!dateEl) return;

    if (!updateData || !updateData.lastUpdate) {
        dateEl.textContent = 'Unknown';
        return;
    }

    const date = new Date(updateData.lastUpdate);
    dateEl.textContent = isNaN(date)
        ? updateData.lastUpdate
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Positions listed for a player (column can hold several, comma-separated)
function getPlayerPositions(player) {
    const positionField = player[COL.POSITIONS] || '';
    return positionField.split(',').map(pos => pos.trim()).filter(pos => pos && pos !== '??' && pos !== 'Unknown');
}

// Which category a single position code belongs to
function categorizePosition(position) {
    if (!position) return 'Unknown';

    const positionUpper = position.toUpperCase().trim();

    for (const [category, positions] of Object.entries(positionCategories)) {
        for (const pos of positions) {
            if (positionUpper === pos || positionUpper.includes(pos)) {
                return category;
            }
        }
    }

    return 'Other';
}

// Calculate statistics for one dataset
function calculateStats(data) {
    const stats = {
        total: data.length,
        countryCounts: {}, // players per club country
        positions: {
            'Forwards': 0,
            'Midfielders': 0,
            'Wingers': 0,
            'Defenders': 0,
            'Goalkeepers': 0,
            'Other': 0,
            'Unknown': 0
        },
        ntCallups: { bangladesh: 0, others: 0, none: 0 }
    };

    data.forEach(player => {
        // Club country - one code per country, so "SUI" and "CHE" count together
        const countryRaw = player[COL.COUNTRY];
        if (!isBlankCode(countryRaw)) {
            const country = canonicalCountryCode(countryRaw);
            stats.countryCounts[country] = (stats.countryCounts[country] || 0) + 1;
        }

        stats.ntCallups[getNTCategory(player)]++;

        // Positions - a player counts once in each category they play in
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
                    stats.positions[category]++;
                });
            } else {
                stats.positions['Other']++;
            }
        }
    });

    stats.countryTotal = Object.keys(stats.countryCounts).length;
    return stats;
}

// Display statistics
function displayStats() {
    const menStats = calculateStats(menData);
    const womenStats = calculateStats(womenData);

    console.log('Men stats:', menStats);
    console.log('Women stats:', womenStats);

    // Set text only if the element exists in the HTML
    const safeSetText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val.toLocaleString();
    };

    [['men', menStats], ['women', womenStats]].forEach(([prefix, stats]) => {
        safeSetText(prefix === 'men' ? 'totalMen' : 'totalWomen', stats.total);
        safeSetText(`${prefix}Countries`, stats.countryTotal);

        safeSetText(`${prefix}NTBangladesh`, stats.ntCallups.bangladesh);
        safeSetText(`${prefix}NTOther`, stats.ntCallups.others);
        safeSetText(`${prefix}NTNone`, stats.ntCallups.none);

        renderTopCountriesTable(`${prefix}TopCountriesBody`, stats.countryCounts);
    });

    // Position table: row id prefix for each category
    const positionRows = {
        'Forwards': 'forwardsRow',
        'Wingers': 'wingersRow',
        'Midfielders': 'midfieldersRow',
        'Defenders': 'defendersRow',
        'Goalkeepers': 'goalkeepersRow',
        'Other': 'otherRow'
    };

    for (const [position, rowId] of Object.entries(positionRows)) {
        safeSetText(`${rowId}Men`, menStats.positions[position] || 0);
        safeSetText(`${rowId}Women`, womenStats.positions[position] || 0);
    }

    renderAllLeaderboards();
}

// Top 5 Countries table
function renderTopCountriesTable(targetElementId, countryCounts) {
    const tableBody = document.getElementById(targetElementId);
    if (!tableBody) return;

    const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    tableBody.innerHTML = '';

    if (sortedCountries.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 15px; color: #777;">No data available</td></tr>`;
        return;
    }

    sortedCountries.forEach(([code, count], index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td style="text-align: center; font-weight: bold; width: 60px; color: #115c32;">#${index + 1}</td>
        <td class="category-name" style="font-weight: 500;">
        ${countryName(code)}
        </td>
        <td class="number-cell" style="font-weight: bold; text-align: right;">${count.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}


// ==========================================================================
// LEADERBOARD: Top Appearances & Top Scorers (Bangladesh NT only)
// ==========================================================================

function parseNumberCell(value) {
    if (!value) return 0;
    const cleaned = String(value).replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function isBangladeshNTCappedPlayer(player) {
    if (getNTCategory(player) !== 'bangladesh') return false;
    return parseNumberCell(player[COL.CAPS]) > 0 || parseNumberCell(player[COL.GOALS]) > 0;
}

function buildLeaderboard(data, sortBy, limit = 10) {
    return data
        .filter(isBangladeshNTCappedPlayer)
        .map(player => ({
            name: getPlayerName(player),
            clubInfo: formatClub(player),
            appearances: parseNumberCell(player[COL.CAPS]),
            goals: parseNumberCell(player[COL.GOALS])
        }))
        .sort((a, b) => {
            if (sortBy === 'goals') {
                return b.goals - a.goals || b.appearances - a.appearances;
            }
            return b.appearances - a.appearances || b.goals - a.goals;
        })
        .slice(0, limit);
}

function renderLeaderboard(tbodyId, data, sortBy, limit = 10) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const board = buildLeaderboard(data, sortBy, limit);
    tbody.innerHTML = '';

    if (board.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:15px;color:#777;">No Bangladesh NT data available</td></tr>`;
        return;
    }

    board.forEach((player, index) => {
        const appClass  = sortBy === 'appearances' ? 'leaderboard-highlight' : '';
        const goalClass = sortBy === 'goals'       ? 'leaderboard-highlight' : '';

        const row = document.createElement('tr');
        row.innerHTML = `
        <td class="leaderboard-rank">#${index + 1}</td>
        <td class="leaderboard-player">
        ${player.name}
        <small>${player.clubInfo}</small>
        </td>
        <td class="number-cell ${appClass}">${player.appearances.toLocaleString()}</td>
        <td class="number-cell ${goalClass}">${player.goals.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

function setupLeaderboardTabs(tabsContainerId, tbodyId, data) {
    const container = document.getElementById(tabsContainerId);
    if (!container) return;

    if (container.dataset.bound === 'true') return;
    container.dataset.bound = 'true';

    const buttons = container.querySelectorAll('.leaderboard-tab');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLeaderboard(tbodyId, data, btn.dataset.tab);
        });
    });
}

function renderAllLeaderboards() {
    renderLeaderboard('menLeaderboardBody', menData, 'appearances');
    setupLeaderboardTabs('menLeaderboardTabs', 'menLeaderboardBody', menData);

    renderLeaderboard('womenLeaderboardBody', womenData, 'appearances');
    setupLeaderboardTabs('womenLeaderboardTabs', 'womenLeaderboardBody', womenData);
}
