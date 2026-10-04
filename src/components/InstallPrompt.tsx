import { Download, Info } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { Button } from './Button';

export function InstallPrompt() {
  const { canInstall, isInstalled, install } = useInstallPrompt();

  if (isInstalled || !canInstall) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Install Budgetly for offline access and a faster app-like launch.</span>
      </div>
      <Button className="bg-white" onClick={install} type="button">
        <Download className="h-4 w-4" aria-hidden="true" />
        Install
      </Button>
    </div>
  );
}
