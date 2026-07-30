// Global variables
let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;
let positionOptions = new Set();
let birthYearOptions = new Set();
let countryOptions = new Set();
let tierOptions = new Set();

// DOM Elements
const tableBody = document.getElementById('tableBody');
const nameFilter = document.getElementById('nameFilter');
const positionFilter = document.getElementById('positionFilter');
const birthYearFilter = document.getElementById('birthYearFilter');
const countryFilter = document.getElementById('countryFilter');
const tierFilter = document.getElementById('tierFilter');
const ntFilter = document.getElementById('ntFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const rowCount = document.getElementById('rowCount');
const lastUpdate = document.getElementById('lastUpdate');

// Load and parse CSV data
async function loadCSVData(csvFilename = 'data/mens.csv') {
    // Load last update info FIRST
    await loadLastUpdateInfo();

    playersData = await parseCSVData(csvFilename);

    if (playersData.length > 0) {
        const firstRow = playersData[0];
        if (firstRow[0] === "Given Names(s)" || firstRow[0].includes("Given Names")) {
            playersData = playersData.slice(1);
        }
    }

    // Sort by sorting string column
    playersData.sort((a, b) => {
        const sortA = a[a.length - 1] || '';
        const sortB = b[b.length - 1] || '';

        const isUnattachedA = sortA.startsWith('~~~');
        const isUnattachedB = sortB.startsWith('~~~');

        if (isUnattachedA === isUnattachedB) {
            return sortA.localeCompare(sortB);
        }

        return isUnattachedA ? 1 : -1;
    });

    extractFilterOptions();
    populateFilterDropdowns();

    filteredData = [...playersData];
    updateTable();
    displayRecentUpdates();
}

// NEW: Load last update info from JSON
async function loadLastUpdateInfo() {
    try {
        const response = await fetch('data/lastUpdate.json');
        if (response.ok) {
            const data = await response.json();

            // Update the last update date
            if (data.lastUpdate) {
                const date = new Date(data.lastUpdate);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
                lastUpdate.textContent = formattedDate;
            }

            // Also store in a global for use elsewhere if needed
            window.lastUpdateData = data;

            console.log('Last update info loaded:', data);
        } else {
            console.warn('lastUpdate.json not found, using fallback');
            lastUpdate.textContent = 'Unknown (JSON file not found)';
        }
    } catch (error) {
        console.error('Error loading lastUpdate.json:', error);
        lastUpdate.textContent = 'Unknown (Error loading)';
    }
}

// Parse CSV data
async function parseCSVData(csvFilename) {
    try {
        const response = await fetch(csvFilename);
        if (!response.ok) {
            throw new Error(`Failed to load ${csvFilename}: ${response.status}`);
        }
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading CSV:', error);
        alert(`Data file (${csvFilename}) not found. Please ensure the file exists.`);
        return [];
    }
}

// Proper CSV parsing function
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

// Extract unique values for filter dropdowns
function extractFilterOptions() {
    positionOptions.clear();
    birthYearOptions.clear();
    countryOptions.clear();
    tierOptions.clear();

    playersData.forEach(player => {
        // Positions (index 2)
        if (player[2] && player[2] !== "??" && player[2] !== "Unknown") {
            const positions = player[2].split(',').map(p => p.trim());
            positions.forEach(p => {
                if (p && p !== "??") positionOptions.add(p);
            });
        }

        // Birth years (index 3)
        if (player[3] && player[3] !== "Unknown" && player[3] !== "??") {
            birthYearOptions.add(player[3]);
        }

        // Countries (index 9)
        if (player[9]) {
            countryOptions.add(player[9]);
        }

        // Tiers (index 10)
        if (player[10] && player[10] !== '' && player[10] !== '???') {
            tierOptions.add(player[10]);
        }
    });
}

// Populate filter dropdowns with options
function populateFilterDropdowns() {
    // Position
    positionFilter.innerHTML = '<option value="">All Positions</option>';
    const sortedPositions = Array.from(positionOptions).sort();
    sortedPositions.forEach(position => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        positionFilter.appendChild(option);
    });

    // Birth Year
    birthYearFilter.innerHTML = '<option value="">All Years</option>';
    const sortedYears = Array.from(birthYearOptions).sort((a, b) => b - a);
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        birthYearFilter.appendChild(option);
    });

    // Country
    countryFilter.innerHTML = '<option value="">All Countries</option>';
    const sortedCountries = Array.from(countryOptions).sort();
    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });

    // Tier - Dynamically populated
    tierFilter.innerHTML = '<option value="all">All Tiers</option>';

    const tierDisplayNames = {
        'AM': 'Amateur',
        'CL': 'College',
        'FS': 'Futsal',
        'YA': 'Youth Academy',
        '-': 'Unattached'
    };

    const sortedTiers = Array.from(tierOptions).sort((a, b) => {
        const aIsNum = !isNaN(a) && a !== '';
        const bIsNum = !isNaN(b) && b !== '';

        if (aIsNum && bIsNum) {
            return parseInt(a, 10) - parseInt(b, 10);
        }
        if (aIsNum) return -1;
        if (bIsNum) return 1;
        return a.localeCompare(b);
    });

    sortedTiers.forEach(tier => {
        const option = document.createElement('option');
        option.value = tier;
        option.textContent = tierDisplayNames[tier] || `Tier ${tier}`;
        tierFilter.appendChild(option);
    });
}

// Helper function to determine NT category
function getNTCategory(ntValue) {
    if (!ntValue || ntValue === '-' || ntValue === '') {
        return 'none';
    }
    if (ntValue.toUpperCase().includes('BAN')) {
        return 'bangladesh';
    }
    return 'others';
}

// Apply filters to the data
function applyFilters() {
    const nameFilterValue = nameFilter.value.toLowerCase();
    const positionFilterValue = positionFilter.value;
    const birthYearFilterValue = birthYearFilter.value;
    const countryFilterValue = countryFilter.value;
    const tierFilterValue = tierFilter ? tierFilter.value : 'all';
    const ntFilterValue = ntFilter ? ntFilter.value : 'all';

    filteredData = playersData.filter(player => {
        // Name filter
        const fullName = (player[0] + ' ' + player[1]).toLowerCase();
        if (nameFilterValue && !fullName.includes(nameFilterValue)) {
            return false;
        }

        // Position filter
        if (positionFilterValue && player[2]) {
            const positions = player[2].split(',').map(p => p.trim());
            if (!positions.includes(positionFilterValue)) {
                return false;
            }
        }

        // Birth year filter
        if (birthYearFilterValue && player[3] !== birthYearFilterValue) {
            return false;
        }

        // Country filter
        if (countryFilterValue && player[9] !== countryFilterValue) {
            return false;
        }

        // Tier filter
        if (tierFilterValue && tierFilterValue !== 'all') {
            const tierValue = player[10] || '';
            if (tierValue.toUpperCase() !== tierFilterValue.toUpperCase()) {
                return false;
            }
        }

        // NT filter
        if (ntFilterValue && ntFilterValue !== 'all') {
            const ntValue = player[12];
            const ntCategory = getNTCategory(ntValue);
            if (ntCategory !== ntFilterValue) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    updateTable();
}

// Set up event listeners
function setupEventListeners() {
    nameFilter.addEventListener('input', applyFilters);
    positionFilter.addEventListener('change', applyFilters);
    birthYearFilter.addEventListener('change', applyFilters);
    countryFilter.addEventListener('change', applyFilters);
    if (tierFilter) {
        tierFilter.addEventListener('change', applyFilters);
    }
    if (ntFilter) {
        ntFilter.addEventListener('change', applyFilters);
    }

    resetFiltersBtn.addEventListener('click', () => {
        nameFilter.value = '';
        positionFilter.value = '';
        birthYearFilter.value = '';
        countryFilter.value = '';
        if (tierFilter) tierFilter.value = 'all';
        if (ntFilter) ntFilter.value = 'all';
        applyFilters();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    });
}

// Update the table
function updateTable() {
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);

    pageData.forEach(player => {
        const row = document.createElement('tr');
        for (let i = 0; i < player.length - 1; i++) {
            const cell = document.createElement('td');
            let value = player[i] || '-';
            if (value === '??' || value === 'Unknown' || value === '') {
                value = '-';
            }
            cell.textContent = value;
            row.appendChild(cell);
        }
        tableBody.appendChild(row);
    });

    updatePagination();

    if (filteredData.length > 0) {
        rowCount.textContent = `Showing ${startIndex + 1}-${endIndex} of ${filteredData.length} players`;
    } else {
        rowCount.textContent = 'No players found';
    }
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="17" style="text-align: center; padding: 20px; color: #666;">No players found matching your filters</td></tr>`;
        rowCount.textContent = 'Showing 0 of 0 players';
    }
}

// Helper function to parse update dates from the recent updates list
// This is only used for the "Most Recently Added/Updated" section
function parseDateFromCSV(dateStr) {
    if (!dateStr || dateStr === "Status Unknown" || dateStr === "-") return null;

    if (dateStr.includes('/')) {
        const dateParts = dateStr.split('/');
        if (dateParts.length === 3) {
            let year = dateParts[2].trim();
            if (year.length === 2) year = '20' + year;
            const month = parseInt(dateParts[0], 10) - 1;
            const day = parseInt(dateParts[1], 10);
            const date = new Date(year, month, day);
            return isNaN(date.getTime()) ? null : date;
        }
    }

    const fallbackDate = new Date(dateStr);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

// Display recent updates
function displayRecentUpdates() {
    const recentContainer = document.getElementById('recentUpdatesList');
    if (!recentContainer) return;

    recentContainer.innerHTML = '';

    // Filter players with valid update dates
    const playersWithDates = playersData
    .map(player => ({
        data: player,
        parsedDate: parseDateFromCSV(player[16]) // Last Update column
    }))
    .filter(item => item.parsedDate !== null);

    // Sort by date descending (newest first)
    playersWithDates.sort((a, b) => b.parsedDate - a.parsedDate);

    // Take top 5
    const topRecent = playersWithDates.slice(0, 5);

    if (topRecent.length === 0) {
        recentContainer.innerHTML = '<li>No recent update history found.</li>';
        return;
    }

    topRecent.forEach(item => {
        const p = item.data;
        const firstName = p[0] || '';
        const lastName = p[1] || '';
        const position = p[2] || '-';
        const club = p[8] || 'Unattached';
        const country = p[9] || '-';
        const rawDate = p[16];
        const clubTier = p[10] || '-';
        const notes = p[11] || 'N/A';

        const li = document.createElement('li');
        li.innerHTML = `
        <strong>${firstName} ${lastName}</strong>
        <span class="update-details">${position} | Current Club: ${club} (${country}-${clubTier}) | Notes: ${notes}</span>
        <span class="update-tag">Updated: ${rawDate}</span>
        `;
        recentContainer.appendChild(li);
    });
}
