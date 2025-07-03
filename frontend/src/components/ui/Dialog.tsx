import React, { ReactNode, createContext, useContext } from 'react';
import { cn } from '@/utils/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogDescriptionProps {
  children: ReactNode;
}

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const DialogContext = createContext<{ size: DialogSize }>({ size: 'md' });

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, size = 'md', children }) => {
  if (!open) return null;

  return (
    <DialogContext.Provider value={{ size }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => onOpenChange(false)}
        />
        {/* Dialog content */}
        <div className="relative z-50">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => {
  const { size } = useContext(DialogContext);
  
  const sizeStyles = {
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-xl w-full',
    full: 'max-w-full w-full'
  };

  console.log('Dialog size:', size, 'Applied classes:', sizeStyles[size]);

  return (
    <div 
      className={cn(
        "bg-background border border-border rounded-lg shadow-lg p-6",
        sizeStyles[size],
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h3 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h3>
  );
};

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };