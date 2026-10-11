// GPS Web Consent Interface Logic
document.addEventListener("DOMContentLoaded", () => {
    const requestBtn = document.getElementById("requestBtn");
    const statusText = document.getElementById("statusText");
    const resultsCard = document.getElementById("resultsCard");
    const latVal = document.getElementById("latVal");
    const lngVal = document.getElementById("lngVal");
    const accVal = document.getElementById("accVal");
    const mapsLink = document.getElementById("mapsLink");
    const errorBox = document.getElementById("errorBox");
    const errorDetails = document.getElementById("errorDetails");

    function showError(message) {
        statusText.textContent = "Location retrieval failed.";
        errorDetails.textContent = message;
        errorBox.classList.remove("hidden");
        resultsCard.classList.add("hidden");
        requestBtn.disabled = false;
        requestBtn.textContent = "Try Again";

        // Notify local server of error
        fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: message })
        }).catch(() => {
            // Local CLI might already be closed or running in standalone mode
        });
    }

    requestBtn.addEventListener("click", () => {
        errorBox.classList.add("hidden");
        resultsCard.classList.add("hidden");

        if (!navigator.geolocation) {
            showError("Browser Geolocation API is not supported on this browser or platform.");
            return;
        }

        requestBtn.disabled = true;
        requestBtn.textContent = "Requesting permission...";
        statusText.textContent = "Please grant location access in the browser prompt...";

        const geoOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const acc = position.coords.accuracy;

                latVal.textContent = lat.toFixed(6);
                lngVal.textContent = lng.toFixed(6);
                accVal.textContent = `±${acc.toFixed(1)} metres`;

                const coordQuery = encodeURIComponent(`${lat},${lng}`);
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordQuery}`;
                mapsLink.href = mapsUrl;

                resultsCard.classList.remove("hidden");
                statusText.textContent = "Location verified locally with user consent.";
                requestBtn.disabled = false;
                requestBtn.textContent = "Refresh Location";

                // Transmit back to local CLI process on localhost
                fetch("/api/location", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        latitude: lat,
                        longitude: lng,
                        accuracy: acc,
                        timestamp: position.timestamp
                    })
                }).then(() => {
                    statusText.textContent = "Location verified and synchronized to terminal.";
                }).catch(() => {
                    // Normal if running outside of CLI listener
                });
            },
            (error) => {
                let errorMsg = "An unknown error occurred while retrieving location.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = "Permission denied: Location access was rejected by the user.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = "Position unavailable: Device location sensor is unreachable or inactive.";
                        break;
                    case error.TIMEOUT:
                        errorMsg = "Timeout: Geolocation request timed out before acquiring a fix.";
                        break;
                }
                showError(errorMsg);
            },
            geoOptions
        );
    });
});
