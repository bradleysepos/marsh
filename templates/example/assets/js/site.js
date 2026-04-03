(function () {
    var nav = document.querySelector('[data-site-nav]');
    var fallbackLink = document.querySelector('[data-site-nav-fallback-link]');
    var toggle = document.querySelector('[data-site-nav-toggle-button]');

    function hasNavigationContent() {
        if (!nav) {
            return false;
        }

        return nav.textContent.replace(/\s+/g, '').length > 0;
    }

    function setExpanded(expanded) {
        if (!nav || !toggle) {
            return;
        }

        if (expanded) {
            nav.classList.add('is-expanded');
            toggle.classList.add('is-active');
        } else {
            nav.classList.remove('is-expanded');
            toggle.classList.remove('is-active');
        }

        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        nav.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }

    if (!nav || !toggle || !fallbackLink) {
        return;
    }

    if (!hasNavigationContent()) {
        nav.classList.add('is-hidden');
        nav.classList.remove('is-expanded');
        nav.setAttribute('hidden', 'hidden');
        nav.setAttribute('aria-hidden', 'true');
        toggle.classList.add('is-hidden');
        toggle.setAttribute('hidden', 'hidden');
        fallbackLink.classList.remove('is-hidden');
        fallbackLink.removeAttribute('hidden');
        return;
    }

    nav.classList.remove('is-hidden');
    nav.removeAttribute('hidden');
    fallbackLink.classList.add('is-hidden');
    fallbackLink.setAttribute('hidden', 'hidden');
    toggle.classList.remove('is-hidden');
    toggle.removeAttribute('hidden');
    setExpanded(false);

    toggle.addEventListener('click', function (event) {
        event.preventDefault();
        setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
    });
}());