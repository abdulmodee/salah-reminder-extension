// Assuming calculateNotificationTime and createAlarm functions are defined correctly

chrome.runtime.onMessage.addListener(function (Request, sender, sendResponse) {
    console.log("Received!");

    if (Request.timings) {
        for (const [prayerName, time] of Object.entries(Request.timings)) {
            const notificationTime = calculateNotificationTime(time);
            createAlarm(prayerName, notificationTime);
        }
        console.log('You will be notified!');
    }
    sendResponse(() => {
        return "false"
    });
});



chrome.alarms.onAlarm.addListener(alarm => {
    // Alarm fired, create notification
    createNotification(alarm.name);
});

function createAlarm(prayerName, notificationTime) {
    chrome.alarms.create(prayerName, { when: notificationTime });
}

function createNotification(prayerName) {
    // Create notification for the specified prayer
    chrome.notifications.create({
        type: 'basic',
        title: 'Salah Reminder',
        message: `It's time for ${prayerName} prayer!`,
        iconUrl: 'Assets\\mosque16.png'
    }, () => {
        const audio = new Audio("Assets\\adhaan.mp3")
        audio.play();
    }
    );
}
// Ensuring it runs at the required time
function calculateNotificationTime(prayerTime) {
    // Calculate notification time
    const timeParts = prayerTime.split(':').map(part => parseInt(part, 10));
    const prayerDate = new Date();
    prayerDate.setHours(timeParts[0], timeParts[1], 0); // Set prayer time
    return prayerDate.getTime();
}
