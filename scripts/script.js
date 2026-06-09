// Global variables
let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 8;
let positionOptions = new Set();
let birthYearOptions = new Set();
let countryOptions = new Set();

// DOM Elements
const tableBody = document.getElementById('tableBody');
const nameFilter = document.getElementById('nameFilter');
const positionFilter = document.getElementById('positionFilter');
const birthYearFilter = document.getElementById('birthYearFilter');
const countryFilter = document.getElementById('countryFilter');
const ntFilter = document.getElementById('ntFilter'); // NEW
const resetFiltersBtn = document.getElementById('resetFilters');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const rowCount = document.getElementById('rowCount');
const lastUpdate = document.getElementById('lastUpdate');

// Helper function to robustly parse date strings from the CSV (Index 16: Last Update)
function parseUpdateDate(dateStr) {
    if (!dateStr || dateStr === "Status Unknown" || dateStr === "-") return null;
    
    // Handle MM/DD/YYYY or M/D/YY formats
    if (dateStr.includes('/')) {
        const dateParts = dateStr.split('/');
        if (dateParts.length === 3) {
            let year = dateParts[2].trim();
            if (year.length === 2) year = '20' + year; // Convert 26 to 2026
            const month = parseInt(dateParts[0], 10) - 1;
            const day = parseInt(dateParts[1], 10);
            const date = new Date(year, month, day);
            return isNaN(date.getTime()) ? null : date;
        }
    }
    
    // Fallback standard JS date parse (e.g. YYYY-MM-DD)
    const fallbackDate = new Date(dateStr);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

// Load and parse CSV data
async function loadCSVData(csvFilename = 'data/mens.csv') {
    playersData = await parseCSVData(csvFilename);

    // Remove header row if present
    if (playersData.length > 0) {
        const firstRow = playersData[0];
        if (firstRow[0] === "Given Names(s)" || firstRow[0].includes("Given Names")) {
            playersData = playersData.slice(1);
        }
    }

    // Sort by sorting string column (last column in data)
    // Unattached players (starting with ~~~) go to the bottom
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

    // Extract filter options
    extractFilterOptions();

    // Populate filter dropdowns
    populateFilterDropdowns();

    // Initialize filtered data
    filteredData = [...playersData];

    // Update the table
    updateTable();

    // Update last update date in footer
    updateLastUpdateDate();

    // NEW: Display the most recently updated players list
    displayRecentUpdates();
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

        if (csvFilename === 'data/women.csv') {
            alert('Women\'s data file (women.csv) not found. Please ensure the file exists in the same directory. For now, showing empty table.');
        } else {
            alert('Men\'s data file (mens.csv) not found. Please ensure the file exists in the same directory. For now, showing empty table.');
        }

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
    // Clear existing options
    positionOptions.clear();
    birthYearOptions.clear();
    countryOptions.clear();

    playersData.forEach(player => {
        // Positions (index 2)
        if (player[2] && player[2] !== "??" && player[2] !== "Unknown") {
            const positions = player[2].split(',').map(p => p.trim());
            positions.forEach(p => {
                if (p && p !== "??") positionOptions.add(p);
            });
        }

        // Birth years (index 3 - YYYY)
        if (player[3] && player[3] !== "Unknown" && player[3] !== "??") {
            birthYearOptions.add(player[3]);
        }

        // Countries (index 9 - Country)
        if (player[9]) {
            countryOptions.add(player[9]);
        }
    });
}

// Populate filter dropdowns with options
function populateFilterDropdowns() {
    // Clear existing options except "All"
    positionFilter.innerHTML = '<option value="">All Positions</option>';
    birthYearFilter.innerHTML = '<option value="">All Years</option>';
    countryFilter.innerHTML = '<option value="">All Countries</option>';

    // Populate positions
    const sortedPositions = Array.from(positionOptions).sort();
    sortedPositions.forEach(position => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        positionFilter.appendChild(option);
    });

    // Populate birth years
    const sortedYears = Array.from(birthYearOptions).sort((a, b) => b - a);
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        birthYearFilter.appendChild(option);
    });

    // Populate countries
    const sortedCountries = Array.from(countryOptions).sort();
    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// NEW: Helper function to determine NT category
function getNTCategory(ntValue) {
    if (!ntValue || ntValue === '-' || ntValue === '') {
        return 'none';
    }
    // Check if it contains BAN (Bangladesh)
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
    const ntFilterValue = ntFilter ? ntFilter.value : 'all'; // NEW

    filteredData = playersData.filter(player => {
        // Name filter (combine first and last name - indices 0 and 1)
        const fullName = (player[0] + ' ' + player[1]).toLowerCase();
        if (nameFilterValue && !fullName.includes(nameFilterValue)) {
            return false;
        }

        // Position filter (index 2)
        if (positionFilterValue && player[2]) {
            const positions = player[2].split(',').map(p => p.trim());
            if (!positions.includes(positionFilterValue)) {
                return false;
            }
        }

        // Birth year filter (index 3)
        if (birthYearFilterValue && player[3] !== birthYearFilterValue) {
            return false;
        }

        // Country filter (index 9)
        if (countryFilterValue && player[9] !== countryFilterValue) {
            return false;
        }

        // NEW: National Team filter (index 12)
        if (ntFilterValue && ntFilterValue !== 'all') {
            const ntValue = player[12];
            const ntCategory = getNTCategory(ntValue);
            if (ntCategory !== ntFilterValue) {
                return false;
            }
        }

        return true;
    });

    // Reset to first page
    currentPage = 1;

    // Update table
    updateTable();
}

// Set up event listeners
function setupEventListeners() {
    // Filter inputs
    nameFilter.addEventListener('input', applyFilters);
    positionFilter.addEventListener('change', applyFilters);
    birthYearFilter.addEventListener('change', applyFilters);
    countryFilter.addEventListener('change', applyFilters);
    if (ntFilter) {
        ntFilter.addEventListener('change', applyFilters); // NEW
    }

    // Reset filters button
    resetFiltersBtn.addEventListener('click', () => {
        nameFilter.value = '';
        positionFilter.value = '';
        birthYearFilter.value = '';
        countryFilter.value = '';
        if (ntFilter) {
            ntFilter.value = 'all'; // NEW
        }
        applyFilters();
    });

    // Pagination buttons
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

// Update the table with current filtered data
function updateTable() {
    // Clear current table
    tableBody.innerHTML = '';

    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);

    // Populate table rows
    pageData.forEach(player => {
        const row = document.createElement('tr');

        // Skip the last column (Sorting String at index 17)
        for (let i = 0; i < player.length - 1; i++) {
            const cell = document.createElement('td');
            let value = player[i] || '-';
            // Clean up empty values
            if (value === '??' || value === 'Unknown' || value === '') {
                value = '-';
            }
            cell.textContent = value;
            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    });

    // Update pagination controls
    updatePagination();

    // Update row count
    if (filteredData.length > 0) {
        rowCount.textContent = `Showing ${startIndex + 1}-${endIndex} of ${filteredData.length} players`;
    } else {
        rowCount.textContent = 'No players found';
    }
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

    // Update page info
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Enable/disable buttons
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    // If no data, show message
    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="17" style="text-align: center; padding: 20px; color: #666;">No players found matching your filters</td></tr>`;
        rowCount.textContent = `Showing 0 of 0 players`;
    }
}

// Update the last update date in footer
function updateLastUpdateDate() {
    let latestDate = null;

    playersData.forEach(player => {
        const date = parseUpdateDate(player[16]); // Last Update column (index 16)
        if (date && (!latestDate || date > latestDate)) {
            latestDate = date;
        }
    });

    if (latestDate) {
        const formattedDate = latestDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        lastUpdate.textContent = formattedDate;
    } else {
        lastUpdate.textContent = "December 2025";
    }
}

// NEW: Compiles, sorts, and lists the 5 most recently updated entries
function displayRecentUpdates() {
    const recentContainer = document.getElementById('recentUpdatesList');
    if (!recentContainer) return; // Guard clause if element doesn't exist

    // Clear previous elements
    recentContainer.innerHTML = '';

    // Filter out rows without valid dates, map to objects containing parsed dates
    const playersWithDates = playersData
        .map(player => ({
            data: player,
            parsedDate: parseUpdateDate(player[16])
        }))
        .filter(item => item.parsedDate !== null);

    // Sort by date descending (Newest first)
    playersWithDates.sort((a, b) => b.parsedDate - a.parsedDate);

    // Pick top 5 newest items
    const topRecent = playersWithDates.slice(0, 5);

    if (topRecent.length === 0) {
        recentContainer.innerHTML = '<li>No recent update history found.</li>';
        return;
    }

    // Build the list elements
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
