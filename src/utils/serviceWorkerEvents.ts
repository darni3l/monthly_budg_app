export const SW_UPDATE_EVENT = 'sw-update-available';

export function dispatchUpdateAvailable(registration: ServiceWorkerRegistration) {
  window.dispatchEvent(new CustomEvent<ServiceWorkerRegistration>(SW_UPDATE_EVENT, { detail: registration }));
}

export function onUpdateAvailable(callback: (registration: ServiceWorkerRegistration) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ServiceWorkerRegistration>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener(SW_UPDATE_EVENT, handler);
  return () => window.removeEventListener(SW_UPDATE_EVENT, handler);
}
