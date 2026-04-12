import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearUnreadCount
} from '../../store/notificationSlice';
import { useSettings } from '../../context/SettingsContext';

const NotificationDropdown = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { items, unreadCount, loading } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchNotifications());
          
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            dispatch(markNotificationAsRead(notification.id));
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllRead = (e) => {
        e.stopPropagation();
        dispatch(markAllNotificationsAsRead());
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-[var(--text-main)]"
                title={t('Notifications')}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[var(--bg-navbar)]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface-soft)]">
                        <h3 className="font-bold text-[var(--text-main)]">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                        {loading && items.length === 0 ? (
                            <div className="p-4 text-center text-sm text-[var(--text-muted)]">Loading...</div>
                        ) : items.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-[var(--text-soft)]">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {items.slice(0, 5).map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-3 rounded-xl cursor-pointer transition-colors ${notification.is_read
                                                ? 'hover:bg-[var(--bg-surface-soft)] opacity-75'
                                                : 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20'
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5">
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm tracking-tight ${notification.is_read ? 'font-medium text-[var(--text-soft)]' : 'font-bold text-[var(--text-main)]'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
                                                    {formatTime(notification.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-[var(--border-main)] bg-[var(--bg-surface-soft)] text-center">
                        <button
                            onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
