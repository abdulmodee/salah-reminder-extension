chrome.alarms.onAlarm.addListener(alarm => {
    console.log(`Alarm "${alarm.name}" triggered.`);
    chrome.notifications.create({
        type: 'basic',
        title: 'Salah Reminder',
        message: `It's time for ${alarm.name} prayer!`,
        iconUrl: 'Assets/mosque512.png'
    });
});
