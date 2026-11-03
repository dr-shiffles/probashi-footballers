/*
 * heatmap.js — geographic distribution heatmap
 * Consumes menData / womenData globals populated by stats.js.
 * Listens for the "stats-data-ready" event so it always runs
 * after the CSVs have been parsed exactly once.
 */

const countryNames = {
    BGD: "Bangladesh", GBR: "United Kingdom", USA: "United States",
    CAN: "Canada", AUS: "Australia", ITA: "Italy", SWE: "Sweden",
    DEU: "Germany", FRA: "France", ESP: "Spain", NLD: "Netherlands",
    NOR: "Norway", FIN: "Finland", DNK: "Denmark", IRL: "Ireland",
    BEL: "Belgium", CHE: "Switzerland", AUT: "Austria", PRT: "Portugal",
    JPN: "Japan", QAT: "Qatar", ARE: "United Arab Emirates",
    NZL: "New Zealand", SGP: "Singapore", MYS: "Malaysia",
    THA: "Thailand", HKG: "Hong Kong", CRO: "Croatia", SVK: "Slovakia",
    ROM: "Romania", EST: "Estonia", GIB: "Gibraltar", FIJ: "Fiji",
    BHU: "Bhutan", MYA: "Myanmar", TRI: "Trinidad and Tobago"
};

/* FIFA / non-ISO codes -> ISO-3 for Plotly */
const plotlyCountryMap = {
    BAN: "BGD",
    ENG: "GBR", SCO: "GBR", WAL: "GBR", NIR: "GBR",
    GER: "DEU", NED: "NLD", POR: "PRT", SUI: "CHE",
    MAS: "MYS", UAE: "ARE", TRI: "TTO"
};

const UK_CODES = ["ENG", "SCO", "WAL", "NIR"];

/* ---------- counting ---------- */

/*
 * Count players per ISO-3 country using ONLY column 9 ("Country" —
 * club-country, not nationality). Matches stats.js's getPlayerCountry.
 */
function countPlayers(rows) {
    const counts   = {};
    const ukCounts = { ENG: 0, SCO: 0, WAL: 0, NIR: 0 };

    rows.forEach(player => {
        let raw = (player[9] || "").trim();
        if (!raw || raw === "-" || raw === "~~~") return;

        raw = raw.toUpperCase();

        if (UK_CODES.includes(raw)) {
            ukCounts[raw]++;
            counts.GBR = (counts.GBR || 0) + 1;
        } else {
            const iso = plotlyCountryMap[raw] || raw;
            counts[iso] = (counts[iso] || 0) + 1;
        }
    });

    return { counts, ukCounts };
}

/* ---------- rendering ---------- */

function renderHeatmap() {
    if (typeof menData === "undefined" || typeof womenData === "undefined") {
        console.warn("heatmap.js: menData/womenData globals not found");
        return;
    }

    const mapDiv = document.getElementById("player-map");
    if (!mapDiv) return;

    const men   = countPlayers(menData);
    const women = countPlayers(womenData);

    const allCountries = new Set([
        ...Object.keys(men.counts),
                                 ...Object.keys(women.counts)
    ]);
    const locations = Array.from(allCountries);

    function buildView(menOn, womenOn) {
        const z = locations.map(code =>
        (menOn   ? (men.counts[code]   || 0) : 0) +
        (womenOn ? (women.counts[code] || 0) : 0)
        );

        const text = locations.map((code, i) => {
            const m = men.counts[code]   || 0;
            const w = women.counts[code] || 0;
            const total = z[i];

            if (code === "GBR") {
                const mu = men.ukCounts, wu = women.ukCounts;
                let body = `<b>United Kingdom</b><br>Total: ${total}<br>`;
                if (menOn) {
                    body += `<br><b>Men:</b><br>- England: ${mu.ENG}<br>- Scotland: ${mu.SCO}<br>- Wales: ${mu.WAL}<br>- Northern Ireland: ${mu.NIR}<br>`;
                }
                if (womenOn) {
                    body += `<br><b>Women:</b><br>- England: ${wu.ENG}<br>- Scotland: ${wu.SCO}<br>- Wales: ${wu.WAL}<br>- Northern Ireland: ${wu.NIR}`;
                }
                return body;
            }

            const name = countryNames[code] || code;
            let body = `<b>${name}</b><br>Total: ${total}`;
            if (menOn && womenOn) {
                body += `<br>Men: ${m}<br>Women: ${w}`;
            }
            return body;
        });

        return { z, text };
    }

    const views = {
        men:      buildView(true,  false),
        women:    buildView(false, true),
        combined: buildView(true,  true)
    };

    const colorscale = [
        [0.00, "#cfe3c6"],
        [0.15, "#9dcd7c"],
        [0.35, "#5fa73a"],
        [0.55, "#3f7f22"],
        [0.75, "#2a5c12"],
        [1.00, "#173d0a"]
    ];

    const layout = {
        geo: {
            projection: { type: "equirectangular" },
            showframe: false,
            showcoastlines: true,
            coastlinecolor: "#999999",
            showcountries: true,
            countrycolor: "#cccccc",
            bgcolor: "rgba(0,0,0,0)",
            lataxis: { range: [-58, 90] }
        },
        margin: { l: 0, r: 0, t: 0, b: 0 }
    };

    function makeTrace(view) {
        return [{
            type: "choropleth",
            locationmode: "ISO-3",
            locations: locations,
            z: view.z,
            text: view.text,
            showscale: false,
            colorscale,
            marker: { line: { color: "white", width: 0.5 } },
            hovertemplate: "%{text}<extra></extra>"
        }];
    }

    Plotly.newPlot(mapDiv, makeTrace(views.combined), layout, {
        responsive: true,
        displayModeBar: false,
        scrollZoom: false
    });

    const tabs = document.querySelectorAll("[data-heatmap-view]");
    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.heatmapView;
            if (!views[key]) return;

            tabs.forEach(b => b.classList.toggle("active", b === btn));

            Plotly.react(mapDiv, makeTrace(views[key]), layout, {
                responsive: true,
                displayModeBar: false,
                scrollZoom: false
            });
        });
    });
}

/* ---------- bootstrap ---------- */

document.addEventListener("stats-data-ready", renderHeatmap);

/* Fallback: if stats.js already fired before this script loaded
 *  (e.g. cached CSVs resolved synchronously), render immediately. */
if (typeof menData !== "undefined" && menData.length > 0) {
    renderHeatmap();
}
