import * as OneSignal from '@onesignal/node-onesignal';
import dotenv from 'dotenv';
import process from 'process';
dotenv.config({ path: '.env.local' });

class PushNotificationService {
  constructor() {
    const configuration = OneSignal.createConfiguration({
      userAuthKey: '<YOUR_USER_KEY_TOKEN>', //Not needed for sending notifications
      restApiKey: process.env.ONESIGNAL_REST_API_KEY,
    });
    this.client = new OneSignal.DefaultApi(configuration);
    this.appId = 'd2967904-48be-494d-943f-4161974e5051';

    this.filters = {
      userFilter: [{ field: 'tag', key: 'role', relation: '=', value: 'user' }],
      lawEnforcementFilter: [{ field: 'tag', key: 'role', relation: '=', value: 'law-enforcement' }],
    };
  }

  async pushNotification({ heading, content, userIds = [], filters = [] }) {
    try {
      const notification = new OneSignal.Notification();
      notification.app_id = this.appId;

      notification.contents = { en: content };
      notification.headings = { en: heading };
      notification.included_segments = ['All'];
      if (userIds.length > 0) {
        notification.include_aliases = {
          external_id: userIds,
        };
        notification.target_channel = 'push';
      }

      if (filters.length > 0) {
        notification.filters = filters;
      }

      const response = await this.client.createNotification(notification);
      return response;
    } catch (error) {
      console.log('Error sending notification:', error.message);
    }
  }
}

export default PushNotificationService;
