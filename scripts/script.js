// Global variables
let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;
let positionOptions = new Set();
let birthYearOptions = new Set();
let countryOptions = new Set();
let tierOptions = new Set();

// Sorting state
let currentSortColumn = null;
let currentSortDirection = 'asc'; // 'asc' or 'desc'

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

async function loadLastUpdateInfo() {
    try {
        const response = await fetch('data/lastUpdate.json');
        if (response.ok) {
            const data = await response.json();

            // Pick the per-database timestamp for THIS page
            const isWomenPage = document.body.dataset.gender === 'women';
            const pageTimestamp =
            isWomenPage
            ? (data.womenLastUpdate || data.lastUpdate)
            : (data.menLastUpdate   || data.lastUpdate);

            // Use the SAME per-page timestamp for the visible label
            if (pageTimestamp) {
                const date = new Date(pageTimestamp);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
                lastUpdate.textContent = formattedDate;
            } else {
                lastUpdate.textContent = 'Unknown';
            }

            // Store globals
            window.lastUpdateData   = data;
            window.recentUpdateDate = pageTimestamp || null;

            console.log('Last update info loaded:', data);
            console.log('Per-page update date:', pageTimestamp);
        } else {
            console.warn('lastUpdate.json not found, using fallback');
            lastUpdate.textContent = 'Unknown (JSON file not found)';
            window.recentUpdateDate = null;
        }
    } catch (error) {
        console.error('Error loading lastUpdate.json:', error);
        lastUpdate.textContent = 'Unknown (Error loading)';
        window.recentUpdateDate = null;
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

// Helper to extract numeric value from Market Value strings (e.g., "€1.2m")
function parseMarketValue(val) {
    if (!val || val === '-' || val === '—' || val === '€0') return 0;
    const cleanVal = val.replace(/[€,\s]/g, '').toLowerCase();
    if (cleanVal.endsWith('m')) return parseFloat(cleanVal) * 1000000;
    if (cleanVal.endsWith('k')) return parseFloat(cleanVal) * 1000;
    return parseFloat(cleanVal) || 0;
}

// Parse a socials URL string (may contain multiple URLs separated by ';')
// and return an HTML string of icon links
function renderSocialLinks(rawValue) {
    if (!rawValue || rawValue === '-' || rawValue === '??' || rawValue.trim() === '') {
        return '-';
    }

    const platformMap = [
        { match: /instagram\.com/i,         icon: 'fa-instagram', label: 'Instagram', color: '#E1306C' },
        { match: /(twitter|x)\.com/i,       icon: 'fa-x-twitter', label: 'X',         color: '#000000' },
        { match: /facebook\.com/i,          icon: 'fa-facebook',  label: 'Facebook',  color: '#1877F2' },
        { match: /tiktok\.com/i,            icon: 'fa-tiktok',    label: 'TikTok',    color: '#000000' },
        { match: /linkedin\.com/i,          icon: 'fa-linkedin',  label: 'LinkedIn',  color: '#0A66C2' },
        { match: /youtube\.com|youtu\.be/i, icon: 'fa-youtube',   label: 'YouTube',   color: '#FF0000' },
        { match: /snapchat\.com/i,          icon: 'fa-snapchat',  label: 'Snapchat',  color: '#FFFC00' },
        { match: /threads\.net/i,           icon: 'fa-threads',   label: 'Threads',   color: '#000000' },
        { match: /twitch\.tv/i,             icon: 'fa-twitch',    label: 'Twitch',    color: '#9146FF' }
    ];

    const urls = rawValue.split(';').map(u => u.trim()).filter(Boolean);

    const links = urls.map(url => {
        let href = url;
        if (!/^https?:\/\//i.test(href)) href = 'https://' + href;

            const platform = platformMap.find(p => p.match.test(href));
        const iconClass = platform ? platform.icon : 'fa-link';
        const label = platform ? platform.label : 'Link';
        const color = platform ? platform.color : '#274e13';

        const safeHref = href.replace(/"/g, '&quot;');
        const safeLabel = label.replace(/"/g, '&quot;');

        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"
        title="${safeLabel}" aria-label="${safeLabel}"
        style="color:${color}; text-decoration:none; margin-right:6px; font-size:16px;">
        <i class="fa-brands ${iconClass}"></i>
        </a>`;
    });

    return links.join('') || '-';
}

// Main sorting function
function sortData(columnIndex, type) {
    // Toggle direction if clicking the same column
    if (currentSortColumn === columnIndex) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = columnIndex;
        currentSortDirection = 'asc';
    }

    filteredData.sort((a, b) => {
        let valA = a[columnIndex] || '';
        let valB = b[columnIndex] || '';

        // Handle specific data types
        if (type === 'number') {
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
        } else if (type === 'value') {
            valA = parseMarketValue(valA);
            valB = parseMarketValue(valB);
        } else if (type === 'date') {
            valA = new Date(valA).getTime() || 0;
            valB = new Date(valB).getTime() || 0;
        } else {
            // String sorting
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    currentPage = 1; // Reset to page 1
    updateTable();
    updateSortIcons(columnIndex, currentSortDirection);
}

// Update the visual arrows in the table headers
function updateSortIcons(activeCol, direction) {
    document.querySelectorAll('th.sortable').forEach((th) => {
        const icon = th.querySelector('.sort-icon');
        const colIndex = parseInt(th.getAttribute('data-col'));

        if (icon) {
            if (colIndex === activeCol) {
                icon.className = direction === 'asc' ? 'fas fa-sort-up sort-icon' : 'fas fa-sort-down sort-icon';
                icon.style.opacity = '1';
                th.classList.add('active-sort');
            } else {
                icon.className = 'fas fa-sort sort-icon';
                icon.style.opacity = '0.3';
                th.classList.remove('active-sort');
            }
        }
    });
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
            const ntValue = player[13];
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
    if (tierFilter) tierFilter.addEventListener('change', applyFilters);
    if (ntFilter) ntFilter.addEventListener('change', applyFilters);

    resetFiltersBtn.addEventListener('click', () => {
        nameFilter.value = '';
        positionFilter.value = '';
        birthYearFilter.value = '';
        countryFilter.value = '';
        if (tierFilter) tierFilter.value = 'all';
        if (ntFilter) ntFilter.value = 'all';

        // Reset sorting state
        currentSortColumn = null;
        currentSortDirection = 'asc';

        // Reset header icons
        updateSortIcons(-1, 'asc');

        // Re-apply default CSV sorting
        playersData.sort((a, b) => {
            const sortA = a[a.length - 1] || '';
            const sortB = b[b.length - 1] || '';
            const isUnattachedA = sortA.startsWith('~~~');
            const isUnattachedB = sortB.startsWith('~~~');
            if (isUnattachedA === isUnattachedB) return sortA.localeCompare(sortB);
            return isUnattachedA ? 1 : -1;
        });

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

    // --- HEADER CLICK LOGIC ---
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const colIndex = parseInt(th.getAttribute('data-col'));
            const type = th.getAttribute('data-type');

            // Call the main sorting function
            sortData(colIndex, type);
        });
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

        // Render columns 0..18 (index 19 = Sorting String, hidden)
        // Index 17 = Socials (rendered as HTML links)
        // Index 18 = Last Update
        for (let i = 0; i < 19; i++) {
            const cell = document.createElement('td');
            let value = player[i] || '-';
            if (value === '??' || value === 'Unknown' || value === '') {
                value = '-';
            }

            if (i === 17) {
                // Socials column: render as icon links
                cell.innerHTML = renderSocialLinks(value);
                cell.classList.add('social-cell');
                cell.style.whiteSpace = 'nowrap';
            } else {
                cell.textContent = value;
            }

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
        tableBody.innerHTML = `<tr><td colspan="19" style="text-align: center; padding: 20px; color: #666;">No players found matching your filters</td></tr>`;
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
// Display recent updates — shows ALL players updated on (or closest to) the
// last DB update date for THIS page's dataset (men vs women).
function displayRecentUpdates() {
    const recentContainer = document.getElementById('recentUpdatesList');
    if (!recentContainer) return;

    recentContainer.innerHTML = '';

    // Use the per-page update date set by loadLastUpdateInfo()
    let lastUpdateDate = null;
    if (window.recentUpdateDate) {
        const parsed = new Date(window.recentUpdateDate);
        if (!isNaN(parsed.getTime())) {
            lastUpdateDate = parsed;
        }
    }

    // Map players to their parsed update dates (from column 18)
    const playersWithDates = playersData
    .map(player => ({
        data: player,
        parsedDate: parseDateFromCSV(player[18])
    }))
    .filter(item => item.parsedDate !== null);

    if (playersWithDates.length === 0) {
        recentContainer.innerHTML = '<li>No recent update history found.</li>';
        return;
    }

    // Helper: normalize a Date to local midnight (day-level comparison)
    const toDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    let recentPlayers = [];

    if (lastUpdateDate) {
        const targetDay = toDay(lastUpdateDate);

        // 1) Exact same-day match against the per-page update date
        recentPlayers = playersWithDates.filter(
            item => toDay(item.parsedDate) === targetDay
        );

        // 2) Fallback: closest date on or before that timestamp
        if (recentPlayers.length === 0) {
            const candidates = playersWithDates.filter(
                item => item.parsedDate.getTime() <= lastUpdateDate.getTime()
            );
            const pool = candidates.length > 0 ? candidates : playersWithDates;
            const maxDay = Math.max(...pool.map(i => toDay(i.parsedDate)));
            recentPlayers = pool.filter(item => toDay(item.parsedDate) === maxDay);
        }
    } else {
        // No per-page update date available → most recent single day in this CSV
        const maxDay = Math.max(...playersWithDates.map(i => toDay(i.parsedDate)));
        recentPlayers = playersWithDates.filter(item => toDay(item.parsedDate) === maxDay);
    }

    // Sort within the day: newest first, then alphabetical by name for stability
    recentPlayers.sort((a, b) => {
        const diff = b.parsedDate - a.parsedDate;
        if (diff !== 0) return diff;
        const nameA = `${a.data[0] || ''} ${a.data[1] || ''}`.toLowerCase();
        const nameB = `${b.data[0] || ''} ${b.data[1] || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    if (recentPlayers.length === 0) {
        recentContainer.innerHTML = '<li>No recent update history found.</li>';
        return;
    }

    recentPlayers.forEach(item => {
        const p = item.data;
        const firstName = p[0] || '';
        const lastName = p[1] || '';
        const position = p[2] || '-';
        const club = p[8] || 'Unattached';
        const country = p[9] || '-';
        const clubTier = p[10] || '-';
        const notes = p[11] || 'N/A';
        const marketValue = p[12] || '—';
        const rawDate = p[18];

        const li = document.createElement('li');
        li.innerHTML = `
        <strong>${firstName} ${lastName}</strong>
        <span class="update-details">${position} | Current Club: ${club} (${country}-${clubTier}) | Market Value: ${marketValue} | Notes: ${notes}</span>
        <span class="update-tag">Updated: ${rawDate}</span>
        `;
        recentContainer.appendChild(li);
    });
}
