import notifee, { TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';

const CHANNEL_ID = 'motolog-reminders';

export async function setupNotificationChannel(): Promise<void> {
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'MotoLog Reminders',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to setup notification channel:', error);
    }
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to request permission:', error);
    }
    return false;
  }
}

export async function scheduleTimeReminder(
  monthsInterval: number,
  lastServiceDate: Date | string,
  motorcycleName?: string
): Promise<void> {
  try {
    await notifee.cancelNotification('time-reminder');

    if (!monthsInterval || !lastServiceDate) {return;}

    const triggerDate = new Date(lastServiceDate);
    triggerDate.setMonth(triggerDate.getMonth() + monthsInterval);

    if (triggerDate.getTime() <= Date.now()) {return;}

    await notifee.createTriggerNotification(
      {
        id: 'time-reminder',
        title: '🔧 Waktunya Servis!',
        body: `Berdasarkan jadwal, sudah waktunya kamu ngecek dan servis ${motorcycleName || 'motor kamu'}.`,
        android: {
          channelId: CHANNEL_ID,
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
      }
    );
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to schedule time reminder:', error);
    }
  }
}

export async function scheduleWeeklyOdoReminder(): Promise<void> {
  try {
    await notifee.cancelNotification('weekly-odo');

    const now = new Date();
    const nextTrigger = new Date(now);
    nextTrigger.setHours(9, 0, 0, 0);
    nextTrigger.setDate(now.getDate() + 1);

    if (nextTrigger.getTime() <= Date.now()) {
      nextTrigger.setDate(nextTrigger.getDate() + 1);
    }

    await notifee.createTriggerNotification(
      {
        id: 'weekly-odo',
        title: 'Yuk Pemanasan Odometer ✏️',
        body: 'Jangan lupa catat Odometer minggu ini biar estimasi Parts Health akurat!',
        android: {
          channelId: CHANNEL_ID,
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: nextTrigger.getTime(),
        repeatFrequency: RepeatFrequency.WEEKLY,
      }
    );
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to schedule weekly reminder:', error);
    }
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await notifee.cancelAllNotifications();
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to cancel reminders:', error);
    }
  }
}

export async function sendTestNotification(): Promise<void> {
  try {
    const triggerDate = new Date(Date.now() + 5000); // 5 seconds
    await notifee.createTriggerNotification(
      {
        id: 'test-reminder',
        title: 'Test Notifikasi MotoLog 🏍️',
        body: 'Kalau kamu liat pesan ini, berarti Native Notification-nya BERHASIL jalan!',
        android: {
          channelId: CHANNEL_ID,
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
      }
    );
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to send test notification:', error);
    }
  }
}
