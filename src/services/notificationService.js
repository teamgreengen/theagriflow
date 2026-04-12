import { messaging } from '../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';

export const NotificationService = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return true;
      } else if (permission === 'denied') {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
    return null;
  },

  async getFcmToken() {
    try {
      if (messaging) {
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY'
        });
        return token;
      }
    } catch (error) {
      console.error('FCM token error:', error);
    }
    return null;
  },

  onMessageListener() {
    if (messaging) {
      return onMessage(messaging, (payload) => {
        console.log('Foreground message:', payload);
        
        const notificationTitle = payload.notification?.title || 'New Notification';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/logo.png',
          badge: '/logo.png',
          data: payload.data
        };

        if (Notification.permission === 'granted') {
          new Notification(notificationTitle, notificationOptions);
        }
      });
    }
    return () => {};
  },

  showLocalNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo.png',
        ...options
      });
    }
  },

  notifyOrderPlaced(orderId, total) {
    this.showLocalNotification('Order Placed Successfully!', {
      body: `Your order #${orderId} of GH₵${total} has been confirmed.`,
      tag: 'order-placed'
    });
  },

  notifyOrderStatusUpdate(orderId, status) {
    const statusMessages = {
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered'
    };

    this.showLocalNotification('Order Update', {
      body: statusMessages[status] || `Order #${orderId} status: ${status}`,
      tag: 'order-update'
    });
  },

  notifyNewMessage(senderName) {
    this.showLocalNotification('New Message', {
      body: `You have a new message from ${senderName}`,
      tag: 'new-message'
    });
  }
};

export default NotificationService;