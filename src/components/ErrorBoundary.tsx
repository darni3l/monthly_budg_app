import { Component, type ErrorInfo, type ReactNode } from 'react';
import { STORAGE_KEY } from '../constants';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function downloadRawBackup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.alert('No saved budget data was found in this browser.');
      return;
    }
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export raw budget data', err);
    window.alert(
      "Export failed. Your data should still be saved in this browser's storage — " +
        'try again, or check your browser\'s developer tools (Application > Local Storage).',
    );
  }
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Surface full details in the console for debugging; nothing sensitive
    // beyond what's already local to this device.
    console.error('Unhandled application error', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="max-w-md text-slate-600">
            The app hit an unexpected error and couldn&apos;t continue. Your budget data is still
            saved in this browser — export a backup below before reloading, just in case.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
              onClick={downloadRawBackup}
              type="button"
            >
              Export your data
            </button>
            <button
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
              onClick={this.handleReload}
              type="button"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
