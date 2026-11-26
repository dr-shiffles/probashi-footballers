// script.js - player table pages (index.html, women.html). Requires common.js.

// Global variables
let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

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

// Every filter control: its "show all" value and the event that re-filters
const FILTERS = [
    { el: nameFilter,      allValue: '',    event: 'input' },
    { el: positionFilter,  allValue: '',    event: 'change' },
    { el: birthYearFilter, allValue: '',    event: 'change' },
    { el: countryFilter,   allValue: '',    event: 'change' },
    { el: tierFilter,      allValue: 'all', event: 'change' },
    { el: ntFilter,        allValue: 'all', event: 'change' }
];

// Display names for non-numeric club tiers
const TIER_NAMES = {
    'AM': 'Amateur',
    'CL': 'College',
    'FS': 'Futsal',
    'YA': 'Youth Academy',
    '-': 'Unattached'
};

// Social platforms recognised in the Socials column
const SOCIAL_PLATFORMS = [
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

// Load the page's CSV and build the table
async function loadCSVData(csvFilename = 'data/mens.csv') {
    // Load last update info FIRST (displayRecentUpdates needs it)
    await loadLastUpdateInfo();

    try {
        playersData = await loadCSV(csvFilename);
    } catch (error) {
        console.error('Error loading CSV:', error);
        alert(`Data file (${csvFilename}) not found. Please ensure the file exists.`);
        playersData = [];
    }

    defaultSort(playersData);
    populateFilterDropdowns();

    filteredData = [...playersData];
    updateTable();
    displayRecentUpdates();
}

// Show this page's (men's or women's) database update time
async function loadLastUpdateInfo() {
    const data = await loadLastUpdate();
    const isWomenPage = document.body.dataset.gender === 'women';
    const pageTimestamp = data
        ? (isWomenPage ? data.womenLastUpdate : data.menLastUpdate) || data.lastUpdate
        : null;

    window.recentUpdateDate = pageTimestamp || null;

    lastUpdate.textContent = pageTimestamp
        ? new Date(pageTimestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        })
        : 'Unknown';
}

// Default order: by the CSV's Sorting String column, unattached (~~~) players last
function defaultSort(rows) {
    rows.sort((a, b) => {
        const sortA = a[COL.SORT_KEY] || '';
        const sortB = b[COL.SORT_KEY] || '';
        const isUnattachedA = sortA.startsWith('~~~');
        const isUnattachedB = sortB.startsWith('~~~');

        if (isUnattachedA === isUnattachedB) return sortA.localeCompare(sortB);
        return isUnattachedA ? 1 : -1;
    });
}

// Replace a <select>'s options with an "All ..." option followed by the given values
function fillSelect(select, allLabel, allValue, values, labelFor = value => value) {
    select.innerHTML = '';
    select.add(new Option(allLabel, allValue));
    values.forEach(value => select.add(new Option(labelFor(value), value)));
}

// Numeric tiers first (1, 2, 3...), then lettered tiers alphabetically
function compareTiers(a, b) {
    const aIsNum = !isNaN(a) && a !== '';
    const bIsNum = !isNaN(b) && b !== '';

    if (aIsNum && bIsNum) return parseInt(a, 10) - parseInt(b, 10);
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return a.localeCompare(b);
}

// Fill the filter dropdowns with the values found in the data
function populateFilterDropdowns() {
    const positions = new Set();
    const birthYears = new Set();
    const countries = new Set();
    const tiers = new Set();

    playersData.forEach(player => {
        const position = player[COL.POSITIONS];
        if (position && position !== '??' && position !== 'Unknown') {
            position.split(',').map(p => p.trim()).forEach(p => {
                if (p && p !== '??') positions.add(p);
            });
        }

        const year = player[COL.BIRTH_YEAR];
        if (year && year !== 'Unknown' && year !== '??') birthYears.add(year);

        if (player[COL.COUNTRY]) countries.add(player[COL.COUNTRY]);

        const tier = player[COL.TIER];
        if (tier && tier !== '???') tiers.add(tier);
    });

    fillSelect(positionFilter, 'All Positions', '', [...positions].sort());
    fillSelect(birthYearFilter, 'All Years', '', [...birthYears].sort((a, b) => b - a));
    fillSelect(countryFilter, 'All Countries', '', [...countries].sort());
    fillSelect(tierFilter, 'All Tiers', 'all', [...tiers].sort(compareTiers),
        tier => TIER_NAMES[tier] || `Tier ${tier}`);
}

// Helper to extract numeric value from Market Value strings (e.g., "€1.2m")
function parseMarketValue(val) {
    if (!val || val === '-' || val === '—' || val === '€0') return 0;
    const cleanVal = val.replace(/[€,\s]/g, '').toLowerCase();
    if (cleanVal.endsWith('m')) return parseFloat(cleanVal) * 1000000;
    if (cleanVal.endsWith('k')) return parseFloat(cleanVal) * 1000;
    return parseFloat(cleanVal) || 0;
}

// Turn the Socials value (URLs separated by ';') into icon links
function renderSocialLinks(rawValue) {
    if (!rawValue || rawValue === '-' || rawValue === '??' || rawValue.trim() === '') {
        return '-';
    }

    const urls = rawValue.split(';').map(u => u.trim()).filter(Boolean);

    const links = urls.map(url => {
        let href = url;
        if (!/^https?:\/\//i.test(href)) href = 'https://' + href;

        const platform = SOCIAL_PLATFORMS.find(p => p.match.test(href));
        const iconClass = platform ? platform.icon : 'fa-link';
        const label = platform ? platform.label : 'Link';
        const color = platform ? platform.color : '#274e13';

        const safeHref = href.replace(/"/g, '&quot;');
        const safeLabel = label.replace(/"/g, '&quot;');

        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"
        title="${safeLabel}" aria-label="${safeLabel}"
        style="color:${color};">
        <i class="fa-brands ${iconClass}"></i>
        </a>`;
    });

    return links.join('') || '-';
}

// Sort by a clicked column; clicking the same column again reverses the order
function sortData(columnIndex, type) {
    if (currentSortColumn === columnIndex) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = columnIndex;
        currentSortDirection = 'asc';
    }

    filteredData.sort((a, b) => {
        let valA = a[columnIndex] || '';
        let valB = b[columnIndex] || '';

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
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    currentPage = 1;
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
    const tierFilterValue = tierFilter.value;
    const ntFilterValue = ntFilter.value;

    filteredData = playersData.filter(player => {
        if (nameFilterValue && !getPlayerName(player).toLowerCase().includes(nameFilterValue)) {
            return false;
        }

        if (positionFilterValue && player[COL.POSITIONS]) {
            const positions = player[COL.POSITIONS].split(',').map(p => p.trim());
            if (!positions.includes(positionFilterValue)) return false;
        }

        if (birthYearFilterValue && player[COL.BIRTH_YEAR] !== birthYearFilterValue) {
            return false;
        }

        if (countryFilterValue && player[COL.COUNTRY] !== countryFilterValue) {
            return false;
        }

        if (tierFilterValue !== 'all') {
            const tierValue = player[COL.TIER] || '';
            if (tierValue.toUpperCase() !== tierFilterValue.toUpperCase()) return false;
        }

        if (ntFilterValue !== 'all' && getNTCategory(player) !== ntFilterValue) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    updateTable();
}

// Set up event listeners
function setupEventListeners() {
    FILTERS.forEach(({ el, event }) => el.addEventListener(event, applyFilters));

    resetFiltersBtn.addEventListener('click', () => {
        FILTERS.forEach(({ el, allValue }) => { el.value = allValue; });

        // Reset sorting state and header icons
        currentSortColumn = null;
        currentSortDirection = 'asc';
        updateSortIcons(-1, 'asc');

        defaultSort(playersData);
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

    // Recent updates arrows: left = newer, right = older
    const recentPrev = document.getElementById('recentPrev');
    const recentNext = document.getElementById('recentNext');
    if (recentPrev && recentNext) {
        recentPrev.addEventListener('click', () => { recentPage--; renderRecentUpdatesPage(); });
        recentNext.addEventListener('click', () => { recentPage++; renderRecentUpdatesPage(); });
    }

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            sortData(parseInt(th.getAttribute('data-col')), th.getAttribute('data-type'));
        });
    });
}

// Render the current page of the table
function updateTable() {
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);

    filteredData.slice(startIndex, endIndex).forEach(player => {
        const row = document.createElement('tr');

        // Every column except the hidden Sorting String
        for (let i = 0; i < COL.SORT_KEY; i++) {
            const cell = document.createElement('td');
            let value = player[i] || '-';
            if (value === '??' || value === 'Unknown') value = '-';

            if (i === COL.SOCIALS) {
                cell.innerHTML = renderSocialLinks(value);
                cell.classList.add('social-cell');
            } else {
                cell.textContent = value;
            }

            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    });

    if (filteredData.length > 0) {
        rowCount.textContent = `Showing ${startIndex + 1}-${endIndex} of ${filteredData.length} players`;
    } else {
        tableBody.innerHTML = `<tr><td colspan="${COL.SORT_KEY}" class="no-results">No players found matching your filters</td></tr>`;
        rowCount.textContent = 'No players found';
    }

    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Parse a Last Update value (MM/DD/YYYY, MM/DD/YY or YYYY-MM-DD) into a Date
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

    // YYYY-MM-DD: build a local date. (new Date('2026-11-22') would be midnight UTC,
    // which is still 11/21 in the Americas.)
    const isoMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const date = new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]);
        return isNaN(date.getTime()) ? null : date;
    }

    const fallbackDate = new Date(dateStr);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

// "Most Recently Added/Updated Players" list size
const RECENT_UPDATES_MIN = 10;   // aim to list at least this many
const RECENT_UPDATES_MAX = 20;   // never list more than this
const RECENT_PAGE_SIZE = 5;      // players per page (arrow buttons move between pages)

let recentUpdates = [];          // the selected players, newest first
let recentPage = 1;

// Pick the players for the "Most Recently Added/Updated Players" list:
//  - every player updated on the most recent update day (on or before this
//    page's last database update);
//  - if that's fewer than RECENT_UPDATES_MIN, earlier updates are added,
//    newest first, until the list has RECENT_UPDATES_MIN players;
//  - if the most recent day alone has more, all of them are listed and
//    nothing older is added;
//  - never more than RECENT_UPDATES_MAX in total.
function displayRecentUpdates() {
    let lastUpdateDate = null;
    if (window.recentUpdateDate) {
        const parsed = new Date(window.recentUpdateDate);
        if (!isNaN(parsed.getTime())) lastUpdateDate = parsed;
    }

    let pool = playersData
        .map(player => ({ data: player, parsedDate: parseDateFromCSV(player[COL.LAST_UPDATE]) }))
        .filter(item => item.parsedDate !== null);

    recentUpdates = [];
    recentPage = 1;

    if (pool.length > 0) {
        // Normalize a Date to local midnight (day-level comparison)
        const toDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

        // Ignore rows dated after this page's database update (if any remain)
        if (lastUpdateDate) {
            const onOrBefore = pool.filter(item => toDay(item.parsedDate) <= toDay(lastUpdateDate));
            if (onOrBefore.length > 0) pool = onOrBefore;
        }

        // Newest first, then alphabetical by name
        pool.sort((a, b) =>
            (b.parsedDate - a.parsedDate) ||
            getPlayerName(a.data).toLowerCase().localeCompare(getPlayerName(b.data).toLowerCase())
        );

        // Everyone from the most recent update day, topped up to the minimum, capped at the maximum
        const latestDay = toDay(pool[0].parsedDate);
        const latestDayCount = pool.filter(item => toDay(item.parsedDate) === latestDay).length;
        const count = Math.min(Math.max(latestDayCount, RECENT_UPDATES_MIN), RECENT_UPDATES_MAX);

        recentUpdates = pool.slice(0, count).map(item => item.data);
    }

    renderRecentUpdatesPage();
}

// Show the current page of the recent updates list and update the arrow buttons
function renderRecentUpdatesPage() {
    const recentContainer = document.getElementById('recentUpdatesList');
    if (!recentContainer) return;

    const pager = document.getElementById('recentPager');
    const totalPages = Math.max(1, Math.ceil(recentUpdates.length / RECENT_PAGE_SIZE));
    recentPage = Math.min(Math.max(recentPage, 1), totalPages);

    recentContainer.innerHTML = '';

    if (recentUpdates.length === 0) {
        recentContainer.innerHTML = '<li>No recent update history found.</li>';
    }

    const start = (recentPage - 1) * RECENT_PAGE_SIZE;
    recentUpdates.slice(start, start + RECENT_PAGE_SIZE).forEach(p => {
        const position = p[COL.POSITIONS] || '-';
        const notes = p[COL.NOTES] || 'N/A';
        const marketValue = p[COL.MARKET_VALUE] || '—';

        const li = document.createElement('li');
        li.innerHTML = `
        <strong>${getPlayerName(p)}</strong>
        <span class="update-details">${position} | Current Club: ${formatClub(p)} | Market Value: ${marketValue} | Notes: ${notes}</span>
        <span class="update-tag">Updated: ${p[COL.LAST_UPDATE]}</span>
        `;
        recentContainer.appendChild(li);
    });

    // Arrows only appear when there is more than one page
    if (pager) {
        pager.hidden = totalPages <= 1;
        document.getElementById('recentPageInfo').textContent = `Page ${recentPage} of ${totalPages}`;
        document.getElementById('recentPrev').disabled = recentPage <= 1;
        document.getElementById('recentNext').disabled = recentPage >= totalPages;
    }
}
