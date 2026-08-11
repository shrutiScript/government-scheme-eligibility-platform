import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((messagePayload, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    
    if (typeof messagePayload === 'object' && messagePayload !== null) {
      setToasts((prev) => [
        ...prev,
        { id, title: messagePayload.title, message: messagePayload.message, type }
      ]);
    } else {
      setToasts((prev) => [...prev, { id, message: messagePayload, type }]);
    }

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notifySuccess = useCallback((msg) => addToast(msg, 'success', 3500), [addToast]);
  const notifyError = useCallback((msg) => addToast(msg, 'error', 3500), [addToast]);
  const notifyWarning = useCallback((msg) => addToast(msg, 'warning', 3500), [addToast]);
  const notifyInfo = useCallback((msg) => addToast(msg, 'info', 3500), [addToast]);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
