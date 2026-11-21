
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../services/api';

// Show notifications while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register admin device for push notifications.
export async function registerAdminPushNotifications(loginToken) {
  try {
    if (!Device.isDevice) {
      console.log('Physical device required.');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Candy Admin Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const permission = await Notifications.getPermissionsAsync();

    let status = permission.status;

    if (status !== 'granted') {
      const result = await Notifications.requestPermissionsAsync();
      status = result.status;
    }

    if (status !== 'granted') {
      console.log('Notification permission denied.');
      return false;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log('EAS project ID missing.');
      return false;
    }

    const response = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const expoPushToken = response.data;

    await api.post(
      '/auth/notifications/token',
      { expoPushToken },
      {
        headers: {
          Authorization: `Bearer ${loginToken}`,
        },
      }
    );

    console.log('Admin push notification registered.');

    return true;

  } catch (error) {
    console.log(
      'Admin notification error:',
      error.response?.data?.message || error.message
    );

    return false;
  }
}
