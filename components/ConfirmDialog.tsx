import React from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string | null;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gradient-to-r from-primary to-accent p-0.5 rounded-xl shadow-2xl w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
          <div className="bg-secondary rounded-[11px] p-6">
            <h2 className="text-xl font-bold text-text mb-4" id="dialog-title">{title}</h2>
            <div className="text-subtle-text mb-6" id="dialog-description">{message}</div>
            <div className="flex justify-end gap-4">
              {cancelText !== null && (
                <Button variant="secondary" onClick={onClose}>
                    {cancelText}
                </Button>
              )}
              <Button variant={confirmVariant} onClick={onConfirm}>
                {confirmText}
              </Button>
            </div>
          </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
