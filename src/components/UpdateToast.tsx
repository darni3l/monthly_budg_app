import { useEffect, useState } from 'react';
import { Alert } from './Alert';
import { onUpdateAvailable } from '../utils/serviceWorkerEvents';

export function UpdateToast() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => onUpdateAvailable(setRegistration), []);

  if (!registration?.waiting) return null;

  const applyUpdate = () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  };

  return (
    <Alert type="warning">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>🔄 A new version of Budgetly is available.</span>
        <button
          className="text-sm font-semibold underline underline-offset-2"
          onClick={applyUpdate}
          type="button"
        >
          Refresh now
        </button>
      </div>
    </Alert>
  );
}
