// Service Worker for Medicine Reminders
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { medicine, time } = event.data;
    
    // Schedule notification for the specified time
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }
    
    const delay = notificationTime.getTime() - now.getTime();
    
    setTimeout(() => {
      self.registration.showNotification(`Time to take ${medicine.name}!`, {
        body: `It's time for your ${medicine.dosage} dose of ${medicine.name}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `medicine-${medicine._id}-${time}`,
        requireInteraction: true,
        actions: [
          {
            action: 'taken',
            title: 'I Took It',
            icon: '/favicon.ico'
          },
          {
            action: 'snooze',
            title: 'Remind Later',
            icon: '/favicon.ico'
          }
        ]
      });
    }, delay);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'taken') {
    // Send message to main thread that medicine was taken
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'MEDICINE_TAKEN',
          medicineId: event.notification.tag
        });
      });
    });
  } else if (event.action === 'snooze') {
    // Schedule another notification in 5 minutes
    setTimeout(() => {
      self.registration.showNotification(event.notification.title, {
        body: event.notification.body,
        icon: event.notification.icon,
        tag: event.notification.tag,
        requireInteraction: true
      });
    }, 5 * 60 * 1000);
  }
});

