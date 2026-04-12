import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRoles: []
  });
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('unread');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await SuperAdminService.getNotifications();
      let filtered = data || [];
      if (filter === 'unread') filtered = filtered.filter(n => !n.read);
      else if (filter === 'read') filtered = filtered.filter(n => n.read);
      setNotifications(filtered);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    try {
      setSending(true);
      const count = await SuperAdminService.broadcastNotification(
        formData.title,
        formData.message,
        formData.targetRoles.length > 0 ? formData.targetRoles : ['buyer', 'seller', 'rider']
      );
      
      await SuperAdminService.logAction(currentUser?.id, 'broadcast_notification', 'notifications', null, { 
        title: formData.title, 
        recipients: count 
      });
      
      alert(`Notification sent to ${count} users!`);
      setShowModal(false);
      setFormData({ title: '', message: '', targetRoles: [] });
      loadNotifications();
    } catch (err) {
      alert('Failed to send: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await SuperAdminService.markNotificationRead(notificationId);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      error: '❌',
      announcement: '📢'
    };
    return icons[type] || 'ℹ️';
  };

  return (
    <div className="notifications-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Notifications & Announcements</h1>
          <p>Send broadcasts and manage notifications</p>
        </div>
        <button className="add-btn primary" onClick={() => setShowModal(true)}>
          📢 Send Announcement
        </button>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>
          Unread ({notifications.filter(n => !n.read).length})
        </button>
        <button className={filter === 'read' ? 'active' : ''} onClick={() => setFilter('read')}>Read</button>
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
              >
                <div className="notification-icon">{getTypeIcon(notification.type)}</div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">{formatDate(notification.created_at)}</span>
                </div>
                {!notification.read && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Announcement</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                  placeholder="Announcement title" 
                />
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  required 
                  rows="5" 
                  placeholder="Write your announcement..." 
                />
              </div>
              
              <div className="form-group">
                <label>Target Audience</label>
                <div className="checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.targetRoles.includes('buyer')}
                      onChange={e => {
                        const roles = e.target.checked 
                          ? [...formData.targetRoles, 'buyer']
                          : formData.targetRoles.filter(r => r !== 'buyer');
                        setFormData({...formData, targetRoles: roles});
                      }}
                    />
                    Buyers
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.targetRoles.includes('seller')}
                      onChange={e => {
                        const roles = e.target.checked 
                          ? [...formData.targetRoles, 'seller']
                          : formData.targetRoles.filter(r => r !== 'seller');
                        setFormData({...formData, targetRoles: roles});
                      }}
                    />
                    Sellers
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.targetRoles.includes('rider')}
                      onChange={e => {
                        const roles = e.target.checked 
                          ? [...formData.targetRoles, 'rider']
                          : formData.targetRoles.filter(r => r !== 'rider');
                        setFormData({...formData, targetRoles: roles});
                      }}
                    />
                    Riders
                  </label>
                </div>
                <p className="form-help">Leave all unchecked to send to everyone</p>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminNotifications;