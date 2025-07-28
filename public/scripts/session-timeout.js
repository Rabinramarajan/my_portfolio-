(function () {
    let timeout;
    const logoutTime = 15 * 60 * 1000; // 15 minutes

    function resetTimer() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            alert("Session expired due to inactivity.");
            window.location.href = '/logout'; // or call logout API
        }, logoutTime);
    }

    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
})();
