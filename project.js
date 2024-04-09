function errorCallBack(error) {
    console.error(error)
}

// Request user's location when they click the button
document.getElementById("getLocationButton").addEventListener("click", function () {
    // Check if geolocation is available in the browser
    if ("geolocation" in navigator) {
        // Request the user's location
        const watchID = navigator.geolocation.watchPosition(fetchData, errorCallBack);
    }
});

async function fetchData(position) {
    const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    const res = await fetch(`http://api.aladhan.com/v1/timings?latitude=${coordinates.lat}&longitude=${coordinates.lng}`);
    const record = await res.json();
    document.getElementById("Fajr").innerHTML = record.data.timings.Fajr
    document.getElementById("Sunrise").innerHTML = record.data.timings.Sunrise
    document.getElementById("Dhuhr").innerHTML = record.data.timings.Dhuhr
    document.getElementById("Asr").innerHTML = record.data.timings.Asr
    document.getElementById("Maghrib").innerHTML = record.data.timings.Maghrib
    document.getElementById("Isha").innerHTML = record.data.timings.Isha
}
fetchData();
