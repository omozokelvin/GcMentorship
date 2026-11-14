import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  dueDate: Date
): Promise<string | null> {
  if (dueDate.getTime() <= Date.now()) return null;

  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: title,
      data: { taskId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dueDate,
    },
  });

  return notificationId;
}

export async function cancelTaskReminder(reminderId: string | null | undefined): Promise<void> {
  if (!reminderId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
  } catch {
    // Notification may have already fired or been cleared
  }
}
