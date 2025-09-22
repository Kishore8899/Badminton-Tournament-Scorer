import React, { useState, useContext, createContext, ReactNode, useRef } from 'react';
import ConfirmDialog, { ConfirmDialogProps } from '../components/ConfirmDialog';

type ConfirmOptions = Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>;

const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(() => 
  Promise.reject("Confirm provider not initialized")
);

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const promiseResolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      promiseResolver.current = resolve;
    });
  };

  const handleClose = () => {
    if (promiseResolver.current) {
      promiseResolver.current(false);
    }
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (promiseResolver.current) {
      promiseResolver.current(true);
    }
    setIsOpen(false);
  };

  // FIX: Replaced JSX with React.createElement to be compatible with a .ts file extension.
  // This resolves errors related to parsing JSX syntax in a non-TSX file.
  return React.createElement(
    ConfirmContext.Provider,
    { value: confirm },
    children,
    options &&
      React.createElement(ConfirmDialog, {
        ...options,
        isOpen: isOpen,
        onClose: handleClose,
        onConfirm: handleConfirm,
      })
  );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if(context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmDialogProvider');
    }
    return context;
};
