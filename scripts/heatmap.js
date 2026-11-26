/*
 * heatmap.js — geographic distribution heatmap
 * Requires countries.js and common.js. Uses the menData / womenData globals
 * populated by stats.js, and waits for its "stats-data-ready" event so it
 * always runs after the CSVs have been parsed exactly once.
 */

const PLOTLY_CONFIG = {
    responsive: true,
    displayModeBar: false,
    scrollZoom: false
};

/* ---------- counting ---------- */

/*
 * Count players per ISO-3 country using ONLY the club Country column
 * (not nationality). England, Scotland, Wales and Northern Ireland are
 * added together as the United Kingdom, and also counted separately
 * for the hover breakdown.
 */
function countPlayers(rows) {
    const counts   = {};
    const ukCounts = {};
    UK_HOME_NATIONS.forEach(([code]) => { ukCounts[code] = 0; });

    rows.forEach(player => {
        const raw = player[COL.COUNTRY];
        if (isBlankCode(raw)) return;

        const code = raw.trim().toUpperCase();
        if (code in ukCounts) ukCounts[code]++;

        const iso = toISO3(code);
        counts[iso] = (counts[iso] || 0) + 1;
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

    const locations = Array.from(new Set([
        ...Object.keys(men.counts),
        ...Object.keys(women.counts)
    ]));

    const ukBreakdown = (label, ukCounts) =>
        `<br><b>${label}:</b><br>` +
        UK_HOME_NATIONS.map(([code, name]) => `- ${name}: ${ukCounts[code]}`).join('<br>') +
        '<br>';

    function buildView(menOn, womenOn) {
        const z = locations.map(code =>
            (menOn   ? (men.counts[code]   || 0) : 0) +
            (womenOn ? (women.counts[code] || 0) : 0)
        );

        const text = locations.map((code, i) => {
            const total = z[i];
            let body = `<b>${countryName(code)}</b><br>Total: ${total}`;

            if (code === "GBR") {
                body += "<br>";
                if (menOn)   body += ukBreakdown("Men",   men.ukCounts);
                if (womenOn) body += ukBreakdown("Women", women.ukCounts);
                return body;
            }

            if (menOn && womenOn) {
                body += `<br>Men: ${men.counts[code] || 0}<br>Women: ${women.counts[code] || 0}`;
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

    Plotly.newPlot(mapDiv, makeTrace(views.combined), layout, PLOTLY_CONFIG);

    const tabs = document.querySelectorAll("[data-heatmap-view]");
    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.heatmapView;
            if (!views[key]) return;

            tabs.forEach(b => b.classList.toggle("active", b === btn));
            Plotly.react(mapDiv, makeTrace(views[key]), layout, PLOTLY_CONFIG);
        });
    });
}

/* ---------- bootstrap ---------- */

document.addEventListener("stats-data-ready", renderHeatmap);

/* Fallback: if stats.js already fired before this script loaded, render now. */
if (typeof menData !== "undefined" && menData.length > 0) {
    renderHeatmap();
}
