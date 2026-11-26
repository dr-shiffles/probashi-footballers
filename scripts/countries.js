// countries.js - every country and territory in the world, keyed by 3-letter code.
//
// The database uses two kinds of 3-letter codes:
//   - ISO 3166-1 alpha-3 (e.g. DEU, CHE, PRT) - used for Citizenship, and by the map
//   - FIFA codes         (e.g. GER, SUI, POR) - used for club Country and NT
// Each row lists both, so a lookup works with either one.
//
// Row format: [ISO-3, FIFA code (null if not a FIFA member), Name]

const COUNTRIES = [
    ['AFG', 'AFG', 'Afghanistan'],
    ['ALA', null,  'Åland Islands'],
    ['ALB', 'ALB', 'Albania'],
    ['DZA', 'ALG', 'Algeria'],
    ['ASM', 'ASA', 'American Samoa'],
    ['AND', 'AND', 'Andorra'],
    ['AGO', 'ANG', 'Angola'],
    ['AIA', 'AIA', 'Anguilla'],
    ['ATA', null,  'Antarctica'],
    ['ATG', 'ATG', 'Antigua and Barbuda'],
    ['ARG', 'ARG', 'Argentina'],
    ['ARM', 'ARM', 'Armenia'],
    ['ABW', 'ARU', 'Aruba'],
    ['AUS', 'AUS', 'Australia'],
    ['AUT', 'AUT', 'Austria'],
    ['AZE', 'AZE', 'Azerbaijan'],
    ['BHS', 'BAH', 'Bahamas'],
    ['BHR', 'BHR', 'Bahrain'],
    ['BGD', 'BAN', 'Bangladesh'],
    ['BRB', 'BRB', 'Barbados'],
    ['BLR', 'BLR', 'Belarus'],
    ['BEL', 'BEL', 'Belgium'],
    ['BLZ', 'BLZ', 'Belize'],
    ['BEN', 'BEN', 'Benin'],
    ['BMU', 'BER', 'Bermuda'],
    ['BTN', 'BHU', 'Bhutan'],
    ['BOL', 'BOL', 'Bolivia'],
    ['BES', null,  'Bonaire, Sint Eustatius and Saba'],
    ['BIH', 'BIH', 'Bosnia and Herzegovina'],
    ['BWA', 'BOT', 'Botswana'],
    ['BVT', null,  'Bouvet Island'],
    ['BRA', 'BRA', 'Brazil'],
    ['IOT', null,  'British Indian Ocean Territory'],
    ['VGB', 'VGB', 'British Virgin Islands'],
    ['BRN', 'BRU', 'Brunei'],
    ['BGR', 'BUL', 'Bulgaria'],
    ['BFA', 'BFA', 'Burkina Faso'],
    ['BDI', 'BDI', 'Burundi'],
    ['CPV', 'CPV', 'Cabo Verde'],
    ['KHM', 'CAM', 'Cambodia'],
    ['CMR', 'CMR', 'Cameroon'],
    ['CAN', 'CAN', 'Canada'],
    ['CYM', 'CAY', 'Cayman Islands'],
    ['CAF', 'CTA', 'Central African Republic'],
    ['TCD', 'CHA', 'Chad'],
    ['CHL', 'CHI', 'Chile'],
    ['CHN', 'CHN', 'China'],
    ['CXR', null,  'Christmas Island'],
    ['CCK', null,  'Cocos (Keeling) Islands'],
    ['COL', 'COL', 'Colombia'],
    ['COM', 'COM', 'Comoros'],
    ['COG', 'CGO', 'Congo'],
    ['COD', 'COD', 'DR Congo'],
    ['COK', 'COK', 'Cook Islands'],
    ['CRI', 'CRC', 'Costa Rica'],
    ['CIV', 'CIV', "Côte d'Ivoire"],
    ['HRV', 'CRO', 'Croatia'],
    ['CUB', 'CUB', 'Cuba'],
    ['CUW', 'CUW', 'Curaçao'],
    ['CYP', 'CYP', 'Cyprus'],
    ['CZE', 'CZE', 'Czechia'],
    ['DNK', 'DEN', 'Denmark'],
    ['DJI', 'DJI', 'Djibouti'],
    ['DMA', 'DMA', 'Dominica'],
    ['DOM', 'DOM', 'Dominican Republic'],
    ['ECU', 'ECU', 'Ecuador'],
    ['EGY', 'EGY', 'Egypt'],
    ['SLV', 'SLV', 'El Salvador'],
    ['GNQ', 'EQG', 'Equatorial Guinea'],
    ['ERI', 'ERI', 'Eritrea'],
    ['EST', 'EST', 'Estonia'],
    ['SWZ', 'SWZ', 'Eswatini'],
    ['ETH', 'ETH', 'Ethiopia'],
    ['FLK', null,  'Falkland Islands'],
    ['FRO', 'FRO', 'Faroe Islands'],
    ['FJI', 'FIJ', 'Fiji'],
    ['FIN', 'FIN', 'Finland'],
    ['FRA', 'FRA', 'France'],
    ['GUF', null,  'French Guiana'],
    ['PYF', 'TAH', 'French Polynesia (Tahiti)'],
    ['ATF', null,  'French Southern Territories'],
    ['GAB', 'GAB', 'Gabon'],
    ['GMB', 'GAM', 'Gambia'],
    ['GEO', 'GEO', 'Georgia'],
    ['DEU', 'GER', 'Germany'],
    ['GHA', 'GHA', 'Ghana'],
    ['GIB', 'GIB', 'Gibraltar'],
    ['GRC', 'GRE', 'Greece'],
    ['GRL', null,  'Greenland'],
    ['GRD', 'GRN', 'Grenada'],
    ['GLP', null,  'Guadeloupe'],
    ['GUM', 'GUM', 'Guam'],
    ['GTM', 'GUA', 'Guatemala'],
    ['GGY', null,  'Guernsey'],
    ['GIN', 'GUI', 'Guinea'],
    ['GNB', 'GNB', 'Guinea-Bissau'],
    ['GUY', 'GUY', 'Guyana'],
    ['HTI', 'HAI', 'Haiti'],
    ['HMD', null,  'Heard Island and McDonald Islands'],
    ['VAT', null,  'Holy See (Vatican City)'],
    ['HND', 'HON', 'Honduras'],
    ['HKG', 'HKG', 'Hong Kong'],
    ['HUN', 'HUN', 'Hungary'],
    ['ISL', 'ISL', 'Iceland'],
    ['IND', 'IND', 'India'],
    ['IDN', 'IDN', 'Indonesia'],
    ['IRN', 'IRN', 'Iran'],
    ['IRQ', 'IRQ', 'Iraq'],
    ['IRL', 'IRL', 'Ireland'],
    ['IMN', null,  'Isle of Man'],
    ['ISR', 'ISR', 'Israel'],
    ['ITA', 'ITA', 'Italy'],
    ['JAM', 'JAM', 'Jamaica'],
    ['JPN', 'JPN', 'Japan'],
    ['JEY', null,  'Jersey'],
    ['JOR', 'JOR', 'Jordan'],
    ['KAZ', 'KAZ', 'Kazakhstan'],
    ['KEN', 'KEN', 'Kenya'],
    ['KIR', null,  'Kiribati'],
    ['XKX', 'KVX', 'Kosovo'],          // XKX is a widely used code; Kosovo has no official ISO code
    ['KWT', 'KUW', 'Kuwait'],
    ['KGZ', 'KGZ', 'Kyrgyzstan'],
    ['LAO', 'LAO', 'Laos'],
    ['LVA', 'LVA', 'Latvia'],
    ['LBN', 'LBN', 'Lebanon'],
    ['LSO', 'LES', 'Lesotho'],
    ['LBR', 'LBR', 'Liberia'],
    ['LBY', 'LBY', 'Libya'],
    ['LIE', 'LIE', 'Liechtenstein'],
    ['LTU', 'LTU', 'Lithuania'],
    ['LUX', 'LUX', 'Luxembourg'],
    ['MAC', 'MAC', 'Macau'],
    ['MDG', 'MAD', 'Madagascar'],
    ['MWI', 'MWI', 'Malawi'],
    ['MYS', 'MAS', 'Malaysia'],
    ['MDV', 'MDV', 'Maldives'],
    ['MLI', 'MLI', 'Mali'],
    ['MLT', 'MLT', 'Malta'],
    ['MHL', null,  'Marshall Islands'],
    ['MTQ', null,  'Martinique'],
    ['MRT', 'MTN', 'Mauritania'],
    ['MUS', 'MRI', 'Mauritius'],
    ['MYT', null,  'Mayotte'],
    ['MEX', 'MEX', 'Mexico'],
    ['FSM', null,  'Micronesia'],
    ['MDA', 'MDA', 'Moldova'],
    ['MCO', null,  'Monaco'],
    ['MNG', 'MNG', 'Mongolia'],
    ['MNE', 'MNE', 'Montenegro'],
    ['MSR', 'MSR', 'Montserrat'],
    ['MAR', 'MAR', 'Morocco'],
    ['MOZ', 'MOZ', 'Mozambique'],
    ['MMR', 'MYA', 'Myanmar'],
    ['NAM', 'NAM', 'Namibia'],
    ['NRU', null,  'Nauru'],
    ['NPL', 'NEP', 'Nepal'],
    ['NLD', 'NED', 'Netherlands'],
    ['NCL', 'NCL', 'New Caledonia'],
    ['NZL', 'NZL', 'New Zealand'],
    ['NIC', 'NCA', 'Nicaragua'],
    ['NER', 'NIG', 'Niger'],
    ['NGA', 'NGA', 'Nigeria'],
    ['NIU', null,  'Niue'],
    ['NFK', null,  'Norfolk Island'],
    ['PRK', 'PRK', 'North Korea'],
    ['MKD', 'MKD', 'North Macedonia'],
    ['MNP', null,  'Northern Mariana Islands'],
    ['NOR', 'NOR', 'Norway'],
    ['OMN', 'OMA', 'Oman'],
    ['PAK', 'PAK', 'Pakistan'],
    ['PLW', null,  'Palau'],
    ['PSE', 'PLE', 'Palestine'],
    ['PAN', 'PAN', 'Panama'],
    ['PNG', 'PNG', 'Papua New Guinea'],
    ['PRY', 'PAR', 'Paraguay'],
    ['PER', 'PER', 'Peru'],
    ['PHL', 'PHI', 'Philippines'],
    ['PCN', null,  'Pitcairn Islands'],
    ['POL', 'POL', 'Poland'],
    ['PRT', 'POR', 'Portugal'],
    ['PRI', 'PUR', 'Puerto Rico'],
    ['QAT', 'QAT', 'Qatar'],
    ['REU', null,  'Réunion'],
    ['ROU', 'ROU', 'Romania'],
    ['RUS', 'RUS', 'Russia'],
    ['RWA', 'RWA', 'Rwanda'],
    ['BLM', null,  'Saint Barthélemy'],
    ['SHN', null,  'Saint Helena, Ascension and Tristan da Cunha'],
    ['KNA', 'SKN', 'Saint Kitts and Nevis'],
    ['LCA', 'LCA', 'Saint Lucia'],
    ['MAF', null,  'Saint Martin'],
    ['SPM', null,  'Saint Pierre and Miquelon'],
    ['VCT', 'VIN', 'Saint Vincent and the Grenadines'],
    ['WSM', 'SAM', 'Samoa'],
    ['SMR', 'SMR', 'San Marino'],
    ['STP', 'STP', 'São Tomé and Príncipe'],
    ['SAU', 'KSA', 'Saudi Arabia'],
    ['SEN', 'SEN', 'Senegal'],
    ['SRB', 'SRB', 'Serbia'],
    ['SYC', 'SEY', 'Seychelles'],
    ['SLE', 'SLE', 'Sierra Leone'],
    ['SGP', 'SIN', 'Singapore'],
    ['SXM', null,  'Sint Maarten'],
    ['SVK', 'SVK', 'Slovakia'],
    ['SVN', 'SVN', 'Slovenia'],
    ['SLB', 'SOL', 'Solomon Islands'],
    ['SOM', 'SOM', 'Somalia'],
    ['ZAF', 'RSA', 'South Africa'],
    ['SGS', null,  'South Georgia and the South Sandwich Islands'],
    ['KOR', 'KOR', 'South Korea'],
    ['SSD', 'SSD', 'South Sudan'],
    ['ESP', 'ESP', 'Spain'],
    ['LKA', 'SRI', 'Sri Lanka'],
    ['SDN', 'SDN', 'Sudan'],
    ['SUR', 'SUR', 'Suriname'],
    ['SJM', null,  'Svalbard and Jan Mayen'],
    ['SWE', 'SWE', 'Sweden'],
    ['CHE', 'SUI', 'Switzerland'],
    ['SYR', 'SYR', 'Syria'],
    ['TWN', 'TPE', 'Taiwan (Chinese Taipei)'],
    ['TJK', 'TJK', 'Tajikistan'],
    ['TZA', 'TAN', 'Tanzania'],
    ['THA', 'THA', 'Thailand'],
    ['TLS', 'TLS', 'Timor-Leste'],
    ['TGO', 'TOG', 'Togo'],
    ['TKL', null,  'Tokelau'],
    ['TON', 'TGA', 'Tonga'],
    ['TTO', 'TRI', 'Trinidad and Tobago'],
    ['TUN', 'TUN', 'Tunisia'],
    ['TUR', 'TUR', 'Türkiye'],
    ['TKM', 'TKM', 'Turkmenistan'],
    ['TCA', 'TCA', 'Turks and Caicos Islands'],
    ['TUV', null,  'Tuvalu'],
    ['UGA', 'UGA', 'Uganda'],
    ['UKR', 'UKR', 'Ukraine'],
    ['ARE', 'UAE', 'United Arab Emirates'],
    ['GBR', null,  'United Kingdom'],
    ['USA', 'USA', 'United States'],
    ['UMI', null,  'United States Minor Outlying Islands'],
    ['VIR', 'VIR', 'US Virgin Islands'],
    ['URY', 'URU', 'Uruguay'],
    ['UZB', 'UZB', 'Uzbekistan'],
    ['VUT', 'VAN', 'Vanuatu'],
    ['VEN', 'VEN', 'Venezuela'],
    ['VNM', 'VIE', 'Vietnam'],
    ['WLF', null,  'Wallis and Futuna'],
    ['ESH', null,  'Western Sahara'],
    ['YEM', 'YEM', 'Yemen'],
    ['ZMB', 'ZAM', 'Zambia'],
    ['ZWE', 'ZIM', 'Zimbabwe']
];

// The UK's four football nations each have their own FIFA code but share
// the ISO code GBR (the map draws them as one country).
const UK_HOME_NATIONS = [
    ['ENG', 'England'],
    ['SCO', 'Scotland'],
    ['WAL', 'Wales'],
    ['NIR', 'Northern Ireland']
];

// Old codes that still appear in the data
const COUNTRY_CODE_ALIASES = {
    ROM: 'ROU'   // Romania (pre-2007 FIFA code)
};

// Lookup table: any code (ISO, FIFA or alias) -> { iso, fifa, name }
const COUNTRY_LOOKUP = (() => {
    const lookup = {};
    COUNTRIES.forEach(([iso, fifa, name]) => {
        const entry = { iso, fifa, name };
        lookup[iso] = entry;
        if (fifa) lookup[fifa] = entry;
    });
    UK_HOME_NATIONS.forEach(([fifa, name]) => {
        lookup[fifa] = { iso: 'GBR', fifa, name };
    });
    Object.entries(COUNTRY_CODE_ALIASES).forEach(([alias, code]) => {
        lookup[alias] = lookup[code];
    });
    return lookup;
})();

// Returns { iso, fifa, name } for a code, or null if unknown
function findCountry(code) {
    if (!code) return null;
    return COUNTRY_LOOKUP[code.trim().toUpperCase()] || null;
}

// Full name for a code, or the code itself if unknown
function countryName(code) {
    const country = findCountry(code);
    return country ? country.name : code;
}

// ISO-3 code for any code (used by the map), or the code itself if unknown
function toISO3(code) {
    const country = findCountry(code);
    return country ? country.iso : code;
}

// One code per country, so "SUI" and "CHE" count as the same country.
// Prefers the FIFA code; the UK home nations stay separate.
function canonicalCountryCode(code) {
    const country = findCountry(code);
    if (!country) return code.trim().toUpperCase();
    return country.fifa || country.iso;
}
