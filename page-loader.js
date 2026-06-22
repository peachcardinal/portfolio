(function() {
    'use strict';

    const CRITICAL_TIMEOUT_MS = 4000;
    const LOADER_TEXT = 'Loading';

    function getLoader() {
        return document.getElementById('page-loader');
    }

    function splitLoaderTextIntoChars() {
        var textEl = document.querySelector('.page-loader__text');
        if (!textEl || textEl.querySelector('.page-loader__char')) return;
        var text = textEl.textContent || LOADER_TEXT;
        textEl.textContent = '';
        for (var i = 0; i < text.length; i++) {
            var span = document.createElement('span');
            span.className = 'page-loader__char';
            span.style.setProperty('--i', i);
            span.textContent = text.charAt(i) === ' ' ? '\u00A0' : text.charAt(i);
            textEl.appendChild(span);
        }
    }

    function showPageLoader() {
        var el = getLoader();
        if (el) {
            el.classList.remove('is-hidden');
            el.setAttribute('aria-busy', 'true');
        }
    }

    function hidePageLoader() {
        var el = getLoader();
        if (el) {
            el.classList.add('is-hidden');
            el.setAttribute('aria-busy', 'false');
        }
    }

    function waitCriticalMedia(done) {
        var critical = document.querySelectorAll('img[data-preload="critical"], video[data-preload="critical"]');
        if (!critical.length) {
            done();
            return;
        }
        var promises = [];
        critical.forEach(function(el) {
            var p;
            if (el.tagName === 'IMG') {
                if (el.decode) {
                    p = el.decode().catch(function() {});
                } else {
                    p = new Promise(function(resolve) {
                        if (el.complete) resolve();
                        else el.addEventListener('load', resolve, { once: true });
                        el.addEventListener('error', resolve, { once: true });
                    });
                }
            } else {
                if (el.readyState >= 2) {
                    p = Promise.resolve();
                } else {
                    p = new Promise(function(resolve) {
                        el.addEventListener('loadeddata', resolve, { once: true });
                        el.addEventListener('error', resolve, { once: true });
                    });
                }
            }
            promises.push(p);
        });
        Promise.allSettled(promises).then(function() {
            done();
        }).catch(function() {
            done();
        });
    }

    function hidePageLoaderWhenReady() {
        var loader = getLoader();
        if (!loader) return;
        var done = false;
        function finish() {
            if (done) return;
            done = true;
            hidePageLoader();
        }
        setTimeout(finish, CRITICAL_TIMEOUT_MS);
        waitCriticalMedia(function() {
            setTimeout(finish, 0);
        });
        window.addEventListener('page-loader-content-ready', function onReady() {
            window.removeEventListener('page-loader-content-ready', onReady);
            setTimeout(finish, 0);
        }, { once: true });
    }

    function shouldBootstrapRoute() {
        const path = window.location.pathname;
        if (path.includes('/work/index.html')) return false;
        return path !== '/' && path !== '/index.html';
    }

    function runOnDOMReady() {
        if (shouldBootstrapRoute()) return;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(hidePageLoaderWhenReady, 0);
            });
        } else {
            setTimeout(hidePageLoaderWhenReady, 0);
        }
    }

    window.showPageLoader = showPageLoader;
    window.hidePageLoader = hidePageLoader;
    window.hidePageLoaderWhenReady = hidePageLoaderWhenReady;

    splitLoaderTextIntoChars();
    runOnDOMReady();
})();
