// Function to fetch Prayer Times Data from Al-Adhan API
async function fetchData(position) {
    try {
        const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        const { year, month } = getCurrentDateDetails();

        // Get the stored data from chrome.storage.local
        chrome.storage.local.get(['salahTimings'], async (result) => {
            let record;
            const storedData = result.salahTimings;

            if (storedData) {
                const storedMonth = storedData[0].date.gregorian.month.number;
                const storedYear = storedData[0].date.gregorian.year;

                if (storedMonth === month && storedYear === year) {
                    record = storedData;
                } else {
                    record = await fetchAndStoreData(coordinates, month, year);
                }
            } else {
                record = await fetchAndStoreData(coordinates, month, year);
            }

            const formattedDate = getCurrentDateDetails().formattedDate;

            const todayData = record.find(item => item.date.gregorian.date === formattedDate);
            const salahList = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

            if (todayData) {
                let prayersHtml = '';
                salahList.forEach(salah => {
                    prayersHtml += `
                        <span class="prayer-blocks">
                            <span class="prayer">${salah}</span>
                            <span id="${salah}">${todayData.timings[salah]}</span>
                        </span>
                        <hr />
                    `;
                });
                document.getElementById('prayers').innerHTML = prayersHtml;
            } else {
                console.error("Prayer times for today not found.");
            }
        });

    } catch (error) {
        console.error("Error fetching prayer times:", error);
    }
}

// Function to fetch and store new data
async function fetchAndStoreData(coordinates, month, year) {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/calendar?latitude=${coordinates.lat}&longitude=${coordinates.lng}&month=${month}&year=${year}`);
        const { data: record } = await response.json();
        chrome.storage.local.set({ salahTimings: record });
        return record;
    } catch (error) {
        console.error("Error fetching data from Al-Adhan API:", error);
        throw error;
    }
}

// Function to toggle button states
function toggleButtons(remindMeActive) {
    document.getElementById('button-reminder').style.display = remindMeActive ? 'none' : 'block';
    document.getElementById('button-stop-reminder').style.display = remindMeActive ? 'block' : 'none';
}

// Function to continuously check and set the next Salah alarm
function checkAndSetSalahAlarm(storedData) {
    const { formattedDate, time: formattedTime } = getCurrentDateDetails();
    const todayTimings = storedData.find(item => item.date.gregorian.date === formattedDate)?.timings;

    if (!todayTimings) {
        console.error('No Salah timings found in storage for today.');
        return;
    }

    const salahList = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const salah of salahList) {
        const salahTime = todayTimings[salah].replace(/\s*\(.*?\)\s*/g, '');

        if (salahTime > formattedTime) {
            const [nextHours, nextMinutes] = salahTime.split(':').map(Number);
            const now = new Date();
            const salahDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextHours, nextMinutes);
            const timeUntilSalah = salahDate.getTime() - now.getTime();

            chrome.alarms.create(salah, { when: Date.now() + timeUntilSalah });
            console.log(`Alarm for ${salah} created at ${salahTime}`);

            chrome.storage.local.get(['reminderActive'], (result) => {
                if (result.reminderActive) {
                    setTimeout(() => checkAndSetSalahAlarm(storedData), timeUntilSalah);
                }
            });
        }
    }

    // If no Salah left for today, move to the next day
    const nextDayIndex = (new Date().getDate() % storedData.length);
    checkAndSetSalahAlarm(storedData[nextDayIndex]);
}

// Event listener for the "Remind Me" button
document.getElementById('button-reminder').addEventListener('click', () => {
    chrome.storage.local.set({ reminderActive: true }, () => {
        toggleButtons(true);
        chrome.storage.local.get(['salahTimings'], (result) => {
            const storedData = result.salahTimings;
            if (storedData) {
                checkAndSetSalahAlarm(storedData);
            } else {
                console.error('No Salah timings found in storage.');
            }
        });
    });
});

// Event listener for the "Stop Reminders" button
document.getElementById('button-stop-reminder').addEventListener('click', () => {
    chrome.storage.local.set({ reminderActive: false }, () => {
        toggleButtons(false);
        chrome.alarms.clearAll(() => {
            console.log("All alarms cleared.");
        });
    });
});

// Initialize button states based on saved state
chrome.storage.local.get(['reminderActive'], (result) => {
    toggleButtons(result.reminderActive || false);
});

// Get current date details
function getCurrentDateDetails() {
    const date = new Date();

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // Month is 0-based, so add 1
        day: String(date.getDate()).padStart(2, '0'), // Pad day with leading zero
        formattedDate: `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`, // Format date as "DD-MM-YYYY"
        time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` // Format time as "HH:MM"
    };
}

// Check if geolocation is supported and initiate fetching
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(fetchData, (error) => {
        console.error("Geolocation error:", error);
    });
} else {
    console.error("Geolocation is not supported by this browser.");
}
