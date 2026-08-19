import React from 'react';
import { ResponsiveDialog } from './responsive-dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <ResponsiveDialog isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="bg-red-50 p-3 rounded-full">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        
        <div className="flex justify-end gap-3 w-full pt-4 mt-4 border-t border-slate-100">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
