
// Function to fetch Prayer Times Data from Al- Adhaan API
async function fetchData(position) {
    const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    const reponse = await fetch(`https://api.aladhan.com/v1/timings?latitude=${coordinates.lat}&longitude=${coordinates.lng}`);
    const record = await reponse.json();
    document.getElementById("Fajr").innerHTML = record.data.timings.Fajr;
    document.getElementById("Sunrise").innerHTML = record.data.timings.Sunrise;
    document.getElementById("Dhuhr").innerHTML = record.data.timings.Dhuhr;
    document.getElementById("Asr").innerHTML = record.data.timings.Asr;
    document.getElementById("Maghrib").innerHTML = record.data.timings.Maghrib;
    document.getElementById("Isha").innerHTML = record.data.timings.Isha;

    const btnReminder = document.getElementById("button-inner");
    btnReminder.addEventListener("click", () => {
        chrome.runtime.sendMessage({ "timings": record.data.timings }, function (response) {
            console.log(response)
        })
        btnReminder.style.display = "none";
    })

}


if ("geolocation" in navigator) {
    // Request the user's location
    navigator.geolocation.getCurrentPosition(fetchData,
        function (error) {
            console.error(error);
        }
    );
}