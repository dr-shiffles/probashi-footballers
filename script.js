// Global variables
let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let positionOptions = new Set();
let birthYearOptions = new Set();
let countryOptions = new Set();

// DOM Elements
const tableBody = document.getElementById('tableBody');
const nameFilter = document.getElementById('nameFilter');
const positionFilter = document.getElementById('positionFilter');
const birthYearFilter = document.getElementById('birthYearFilter');
const countryFilter = document.getElementById('countryFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const rowCount = document.getElementById('rowCount');
const lastUpdate = document.getElementById('lastUpdate');

// Modified to accept CSV filename parameter
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
    playersData.sort((a, b) => {
        const sortA = a[a.length - 1] || '';
        const sortB = b[b.length - 1] || '';
        return sortA.localeCompare(sortB);
    });
    
    // Extract filter options
    extractFilterOptions();
    
    // Populate filter dropdowns
    populateFilterDropdowns();
    
    // Initialize filtered data
    filteredData = [...playersData];
    
    // Update the table
    updateTable();
    
    // Update last update date
    updateLastUpdateDate();
}

// Load and parse CSV data from the actual file
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
        
        // Show user-friendly error message
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
        // Handle commas within quoted fields and escaped quotes
        const values = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote inside quotes
                    currentValue += '"';
                    i++; // Skip next char
                } else {
                    // Start or end of quoted field
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add the last field
        values.push(currentValue);
        
        return values;
    }).filter(row => row.length > 1); // Filter out empty rows
}

// Extract unique values for filter dropdowns
function extractFilterOptions() {
    // Clear existing options
    positionOptions.clear();
    birthYearOptions.clear();
    countryOptions.clear();
    
    playersData.forEach(player => {
        // Positions
        if (player[2] && player[2] !== "??" && player[2] !== "Unknown") {
            const positions = player[2].split(',').map(p => p.trim());
            positions.forEach(p => {
                if (p && p !== "??") positionOptions.add(p);
            });
        }
        
        // Birth years (column D - YYYY)
        if (player[3] && player[3] !== "Unknown" && player[3] !== "??") {
            birthYearOptions.add(player[3]);
        }
        
        // Countries (column J - Country)
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
        
        // Skip the last column (Sorting String)
        for (let i = 0; i < player.length - 1; i++) {
            const cell = document.createElement('td');
            cell.textContent = player[i] || '-';
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

// Apply filters to the data
function applyFilters() {
    const nameFilterValue = nameFilter.value.toLowerCase();
    const positionFilterValue = positionFilter.value;
    const birthYearFilterValue = birthYearFilter.value;
    const countryFilterValue = countryFilter.value;
    
    filteredData = playersData.filter(player => {
        // Name filter (combine first and last name)
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
    
    // Reset filters button
    resetFiltersBtn.addEventListener('click', () => {
        nameFilter.value = '';
        positionFilter.value = '';
        birthYearFilter.value = '';
        countryFilter.value = '';
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

// Update the last update date in footer
function updateLastUpdateDate() {
    // Find the latest update date from the data
    let latestDate = null;
    
    playersData.forEach(player => {
        const updateDate = player[16]; // Last Update column
        if (updateDate && updateDate !== "Status Unknown") {
            // Try different date formats
            const dateStr = updateDate;
            
            // Check for MM/DD/YYYY format
            if (dateStr.includes('/')) {
                const dateParts = dateStr.split('/');
                if (dateParts.length === 3) {
                    // Handle two-digit years
                    const year = dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2];
                    const date = new Date(year, dateParts[0] - 1, dateParts[1]);
                    if (!isNaN(date) && (!latestDate || date > latestDate)) {
                        latestDate = date;
                    }
                }
            }
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
