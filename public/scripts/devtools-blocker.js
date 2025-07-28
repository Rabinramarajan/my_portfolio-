(function () {
    const isProduction = window.location.hostname !== 'localhost';

    if (isProduction) {
        window.addEventListener('keydown', function (e) {
            const tag = (e.target.tagName || '').toLowerCase();

            if (tag === 'input' || tag === 'textarea') return;

            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                (e.ctrlKey && e.shiftKey && e.keyCode === 67) // Ctrl+Shift+C
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });

        // Disable right-click
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
    }
})();
