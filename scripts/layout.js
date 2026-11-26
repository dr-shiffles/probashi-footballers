// layout.js - the site's navigation bar, footer and mobile menu, shared by every page.
//
// Usage: put <script src="scripts/layout.js"></script> where the nav bar should go
// (first thing inside <body>) and an empty <footer></footer> where the footer goes.
// The nav is written in place as the page loads, so there is no flash without it.

(function () {
    const NAV_ITEMS = [
        { href: 'index.html',   label: 'Men' },
        { href: 'women.html',   label: 'Women' },
        { href: 'stats.html',   label: 'Statistics' },
        { href: 'guide.html',   label: 'Guide' },
        { href: 'about.html',   label: 'About' },
        { href: 'contact.html', label: 'Contact' }
    ];

    const FOOTER_HTML = `
        <p>
            © 2025-2026 Probashi-Footballers.com<br />
            Made with ♥ in Canada & USA<br />
            For the best experience, please open the website on a large screen.
        </p>`;

    // Current page's file name. Cloudflare serves "stats.html" as "/stats",
    // and the home page as "/", so both forms are handled.
    function currentPage() {
        let file = decodeURIComponent(location.pathname.split('/').pop());
        if (!file) return 'index.html';
        if (!file.includes('.')) file += '.html';
        return file;
    }

    function navHTML() {
        const page = currentPage();
        const items = NAV_ITEMS.map(item => `
                <li class="nav-item${item.href === page ? ' active' : ''}">
                    <a href="${item.href}" class="nav-link">${item.label}</a>
                </li>`).join('');

        return `
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <img src="img/logo_512x512.png" alt="Logo" class="nav-logo">
                Probashi Footballers
            </div>
            <ul class="nav-menu">${items}
                <li class="nav-item">
                    <a href="https://www.buymeacoffee.com/probashifol" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" class="bmc-button"></a>
                </li>
            </ul>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>`;
    }

    function setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (!hamburger || !navMenu) return;

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close the menu after picking a page
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Nav: written right where this script tag is
    document.currentScript.insertAdjacentHTML('beforebegin', navHTML());
    setupMobileMenu();

    // Footer: filled into any empty <footer> once the page has loaded
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('footer').forEach(footer => {
            if (!footer.innerHTML.trim()) footer.innerHTML = FOOTER_HTML;
        });
    });
})();
