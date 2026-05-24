import { Pencil, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button className="h-8 px-2" onClick={onEdit} type="button" aria-label="Edit item">
        <Pencil className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
      <Button
        className="h-8 px-2"
        onClick={onDelete}
        type="button"
        variant="danger"
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Delete</span>
      </Button>
    </div>
  );
}
