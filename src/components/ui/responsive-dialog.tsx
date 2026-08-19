import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ResponsiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function ResponsiveDialog({ isOpen, onClose, title, children }: ResponsiveDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row items-end md:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Dialog Container */}
      <div 
        className={cn(
          "relative bg-white w-full md:w-auto md:min-w-[500px] md:max-w-2xl",
          "rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden",
          "animate-in fade-in slide-in-from-bottom-8 md:zoom-in-95 duration-200",
          "max-h-[90dvh] flex flex-col" // use dvh for mobile safari
        )}
      >
        {/* Header - Sticky */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/90 backdrop-blur z-10 sticky top-0 shrink-0">
          <h2 className="text-base md:text-lg font-bold text-slate-800">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="px-4 py-4 md:px-6 md:py-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
