import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminActivity = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      let data = await SuperAdminService.getAllLoginHistory(100);
      
      if (filter) {
        data = data.slice(0, parseInt(filter));
      }
      
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      login: 'Logged in',
      logout: 'Logged out',
      create_admin: 'Created admin',
      delete_admin: 'Deleted admin',
      update_settings: 'Updated settings',
      update_order_status: 'Updated order status',
      verify_seller: 'Verified seller',
      create_banner: 'Created banner',
      delete_banner: 'Deleted banner',
      create_category: 'Created category',
      broadcast_notification: 'Sent announcement'
    };
    return labels[action] || action;
  };

  return (
    <div className="activity-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Activity & Security Logs</h1>
          <p>Monitor user logins and admin actions</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>All</button>
        <button className={filter === '20' ? 'active' : ''} onClick={() => setFilter('20')}>Last 20</button>
        <button className={filter === '50' ? 'active' : ''} onClick={() => setFilter('50')}>Last 50</button>
        <button className={filter === '100' ? 'active' : ''} onClick={() => setFilter('100')}>Last 100</button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading activity logs...</div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <p>No activity logs yet</p>
          </div>
        ) : (
          <div className="activity-timeline">
            {activities.map((log, index) => (
              <div key={index} className="activity-entry">
                <div className="activity-time">{formatDate(log.created_at)}</div>
                <div className="activity-icon">📝</div>
                <div className="activity-details">
                  <span className="activity-user">{log.user?.name || log.user?.email || 'Unknown User'}</span>
                  <span className="activity-action">{getActionLabel(log.action)}</span>
                  {log.details && (
                    <span className="activity-meta">{JSON.stringify(log.details).slice(0, 50)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminActivity;