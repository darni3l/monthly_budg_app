import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import { createHashRouter, RouterProvider } from 'react-router-dom'; 
import App from './App'; 
import './styles.css'; 
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage'; 
import { ExpensesPage } from './pages/ExpensesPage'; 
import { GoalsPage } from './pages/GoalsPage'; 
import { IncomePage } from './pages/IncomePage'; 
import { PlannerPage } from './pages/PlannerPage';
import { TrendsPage } from './pages/TrendsPage'; 
import { dispatchUpdateAvailable } from './utils/serviceWorkerEvents';
 
const router = createHashRouter([ 
  { 
    path: '/', 
    element: <App />, 
    children: [ 
      { index: true, element: <DashboardPage /> }, 
      { path: 'income', element: <IncomePage /> }, 
      { path: 'expenses', element: <ExpensesPage /> }, 
      { path: 'goals', element: <GoalsPage /> }, 
      { path: 'trends', element: <TrendsPage /> }, 
      { path: 'planner', element: <PlannerPage /> }, 
    ], 
  }, 
]); 
 
ReactDOM.createRoot(document.getElementById('root')!).render( 
  <React.StrictMode> 
    <ErrorBoundary>
      <RouterProvider router={router} /> 
    </ErrorBoundary>
  </React.StrictMode>, 
); 
 
// Only register the service worker in production builds. During
// `npm run dev`, a service worker sitting between the browser and Vite's
// dev server is a common source of stale-code and HMR WebSocket issues —
// this sidesteps that class of problem entirely. `npm run preview` (which
// serves the production build) is the right way to test PWA/offline/update
// behavior locally.
if ('serviceWorker' in navigator && import.meta.env.PROD) { 
  window.addEventListener('load', () => { 
    navigator.serviceWorker 
      .register(`${import.meta.env.BASE_URL}sw.js`) 
      .then((registration) => { 
        registration.update(); 
 
        if (registration.waiting && navigator.serviceWorker.controller) { 
          dispatchUpdateAvailable(registration);
        } 
 
        registration.addEventListener('updatefound', () => { 
          const worker = registration.installing; 
          if (!worker) return; 
 
          worker.addEventListener('statechange', () => { 
            if (registration.waiting && navigator.serviceWorker.controller) { 
              dispatchUpdateAvailable(registration);
            } 
          }); 
        }); 
      }) 
      .catch((error: unknown) => { 
        console.error('Service worker registration failed', error); 
      }); 
  }); 
 
  let refreshing = false; 
  navigator.serviceWorker.addEventListener('controllerchange', () => { 
    if (!refreshing) { 
      refreshing = true; 
      window.location.reload(); 
    } 
  }); 
}
