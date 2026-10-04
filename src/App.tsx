import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Alert } from './components/Alert';
import { BudgetModal } from './components/BudgetModal';
import { UpdateToast } from './components/UpdateToast';
import { useBudgetData } from './hooks/useBudgetData';
import type { BudgetData, BudgetItem, BudgetSection, Metadata } from './types';
import { exportBackup, exportCSV, exportPDF } from './utils/export';
import { currency } from './utils/format';
import { loadBudgetData, saveBudgetData } from './utils/storage';
import { parseAndValidateBackup } from './utils/validateBudgetData';

export type ModalState = {
  section: BudgetSection;
  editItem?: BudgetItem | null;
} | null;

export interface BudgetOutletContext {
  budget: ReturnType<typeof useBudgetData>;
  openModal: (section: BudgetSection, editItem?: BudgetItem | null) => void;
}

function formatMonthLabel(metadata: Metadata) {
  return new Date(metadata.year, metadata.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function checkAndRollover(data: BudgetData): BudgetData {
  const now = new Date();
  const currentMetadata = { month: now.getMonth(), year: now.getFullYear() };
  const normalizedData = data.metadata ? data : { ...data, metadata: currentMetadata };

  if (
    normalizedData.metadata.month === currentMetadata.month &&
    normalizedData.metadata.year === currentMetadata.year
  ) {
    return normalizedData;
  }

  const snapshot = {
    month: normalizedData.metadata.month,
    year: normalizedData.metadata.year,
    totalIncome: normalizedData.income.reduce((sum, item) => sum + item.amount, 0),
    totalExpenses: normalizedData.expenses.reduce((sum, item) => sum + item.amount, 0),
    totalSavings: normalizedData.savings.reduce((sum, item) => sum + item.amount, 0),
    remaining:
      normalizedData.income.reduce((sum, item) => sum + item.amount, 0) -
      normalizedData.expenses.reduce((sum, item) => sum + item.amount, 0) -
      normalizedData.savings.reduce((sum, item) => sum + item.amount, 0),
    expenseBreakdown: normalizedData.expenses.map((item) => ({
      name: item.name,
      category: item.category,
      amount: item.amount,
      limit: item.limit,
    })),
  };

  const rolledData: BudgetData = {
    ...normalizedData,
    expenses: normalizedData.expenses.map((expense) =>
      expense.category === 'variable' ? { ...expense, amount: 0 } : expense,
    ),
    metadata: currentMetadata,
    history: [snapshot, ...(normalizedData.history ?? []).slice(0, 11)],
  };

  saveBudgetData(rolledData);
  return rolledData;
}

export default function App() {
  const [appState] = useState(() => {
    const loadedData = loadBudgetData();
    const rolledData = checkAndRollover(loadedData);
    return {
      data: rolledData,
      showNotice:
        loadedData.metadata.month !== rolledData.metadata.month ||
        loadedData.metadata.year !== rolledData.metadata.year,
    };
  });
  const [showRolloverNotice, setShowRolloverNotice] = useState(appState.showNotice);
  const budget = useBudgetData(appState.data);
  const [modal, setModal] = useState<ModalState>(null);
  const { data, totals, overBudget } = budget;

  const saveModal = (section: BudgetSection, item: Record<string, string | number>) => {
    if (modal?.editItem) {
      budget.updateItem(section, { ...modal.editItem, ...item } as BudgetItem);
    } else {
      budget.addItem(section as never, item as never);
    }
    setModal(null);
  };

  const handleImportRaw = (raw: string) => {
    const result = parseAndValidateBackup(raw);

    if (!result.success) {
      window.alert(`Import failed:\n\n${result.errors.join('\n')}`);
      return;
    }

    const confirmMessage =
      result.warnings.length > 0
        ? `This backup had some issues:\n\n${result.warnings.join(
            '\n',
          )}\n\nImport anyway? This will replace all current data.`
        : 'Import this backup? This will replace all current data.';

    if (!window.confirm(confirmMessage)) return;

    budget.importData(result.data);
    setShowRolloverNotice(false);
  };

  return (
    <AppLayout
      metadata={data.metadata}
      onExportBackup={() => exportBackup(data)}
      onExportCSV={() => exportCSV(data)}
      onExportPDF={() => exportPDF(data)}
      onImportRaw={handleImportRaw}
      onReset={budget.resetData}
      remaining={totals.remaining}
    >
      <UpdateToast />
      {showRolloverNotice ? (
        <Alert type="success">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              🗓 New month detected — {formatMonthLabel(data.metadata)} data has been archived and
              variable expenses have been reset.
            </span>
            <button
              className="text-sm font-semibold underline underline-offset-2"
              onClick={() => setShowRolloverNotice(false)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        </Alert>
      ) : null}
      {overBudget.length > 0 ? (
        <Alert type="danger">
          <strong>
            {overBudget.length} item{overBudget.length > 1 ? 's' : ''} over budget:
          </strong>{' '}
          {overBudget.map((item) => item.name).join(', ')}
        </Alert>
      ) : null}
      {totals.remaining < 0 ? (
        <Alert type="danger">
          <strong>{currency(Math.abs(totals.remaining))}</strong> over total budget this month.
        </Alert>
      ) : null}
      {totals.remaining >= 0 && totals.remaining < 200 ? (
        <Alert type="warning">
          Only <strong>{currency(totals.remaining)}</strong> remaining. Budget is tight.
        </Alert>
      ) : null}
      {totals.remaining >= 200 && overBudget.length === 0 ? (
        <Alert type="success">
          On track with <strong>{currency(totals.remaining)}</strong> remaining after expenses and
          savings.
        </Alert>
      ) : null}

      <Outlet
        context={{
          budget,
          openModal: (section: BudgetSection, editItem: BudgetItem | null = null) =>
            setModal({ section, editItem }),
        }}
      />

      <BudgetModal
        editItem={modal?.editItem}
        onClose={() => setModal(null)}
        onSave={saveModal}
        section={modal?.section ?? null}
      />
    </AppLayout>
  );
}
