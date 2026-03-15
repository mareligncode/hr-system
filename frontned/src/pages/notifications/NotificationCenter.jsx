import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '../../store/notificationSlice';
import { useSettings } from '../../context/SettingsContext';

const NotificationCenter = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useSettings();
    const { items, loading } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleRead = (id) => {
        dispatch(markNotificationAsRead(id));
    };

    const handleDelete = (id) => {
        dispatch(deleteNotification(id));
    };

    const handleClick = (notification) => {
        if (!notification.is_read) {
            handleRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Notification Center</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">View and manage your alerts</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/settings/notifications')}
                        className="px-4 py-2 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] rounded-lg hover:bg-[var(--bg-surface-soft)] transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Preferences
                    </button>
                    <button
                        onClick={() => dispatch(markAllNotificationsAsRead())}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-500/30 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark all as read
                    </button>
                </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl shadow-sm overflow-hidden">
                {loading && items.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-muted)] animate-pulse">Loading notifications...</div>
                ) : items.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">Your inbox is empty</h3>
                        <p className="text-sm text-[var(--text-muted)]">You don't have any notifications at the moment.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-[var(--border-main)]">
                        {items.map(notification => (
                            <li
                                key={notification.id}
                                className={`flex flex-col sm:flex-row sm:items-center p-4 hover:bg-[var(--bg-surface-soft)] transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                onClick={() => handleClick(notification)}
                            >
                                <div className="flex-1 flex gap-4 min-w-0">
                                    <div className="mt-1">
                                        {!notification.is_read ? (
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50" />
                                        ) : (
                                            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className={`text-base truncate ${!notification.is_read ? 'font-bold text-[var(--text-main)]' : 'font-medium text-[var(--text-soft)]'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-[var(--text-muted)] mt-0.5 line-clamp-2 sm:line-clamp-1">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 sm:mt-1">
                                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                {formatTime(notification.created_at)}
                                            </span>
                                            {notification.type === 'alert' && (
                                                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded uppercase">Alert</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-0 flex items-center justify-end gap-2 shrink-0">
                                    {!notification.is_read && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRead(notification.id); }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
