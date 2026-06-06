import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

function Toast({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setExiting(false);

    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icon = toast.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type} ${exiting ? 'exit' : ''}`}>
        <span className="toast-icon">{icon}</span>
        <span className="toast-message">{toast.message}</span>
        <button
          className="toast-close"
          onClick={() => {
            setExiting(true);
            setTimeout(onClose, 300);
          }}
        >
          <FiX />
        </button>
      </div>
    </div>
  );
}

export default Toast;
