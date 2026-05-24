import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Alert } from './components/Alert';
import { BudgetModal } from './components/BudgetModal';
import { useBudgetData } from './hooks/useBudgetData';
import type { BudgetItem, BudgetSection } from './types';
import { exportCSV, exportPDF } from './utils/export';
import { currency } from './utils/format';

export type ModalState = {
  section: BudgetSection;
  editItem?: BudgetItem | null;
} | null;

export interface BudgetOutletContext {
  budget: ReturnType<typeof useBudgetData>;
  openModal: (section: BudgetSection, editItem?: BudgetItem | null) => void;
}

export default function App() {
  const budget = useBudgetData();
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

  return (
    <AppLayout
      onExportCSV={() => exportCSV(data)}
      onExportPDF={() => exportPDF(data)}
      onReset={budget.resetData}
      remaining={totals.remaining}
    >
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
