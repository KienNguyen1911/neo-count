import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CustomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const CustomSheet: React.FC<CustomSheetProps> = ({ isOpen, onClose, children, title }) => {
  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Sheet Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 mx-auto",
              "flex flex-col bg-neo-white border-t-4 border-l-4 border-r-4 border-neo-black",
              "shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.2)]", // Slight visual lift
              "w-full md:w-[600px] h-[80vh] max-h-[1000px]", // Constraint: 80vh height, max width on desktop
              "rounded-t-3xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neo-black bg-neo-yellow rounded-t-[20px]">
              <h2 className="text-xl font-bold uppercase tracking-tight">{title || 'Details'}</h2>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 hover:bg-black/10 rounded-full transition-colors active:scale-95"
              >
                <X className="w-6 h-6 stroke-[3px]" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
               {children}
            </div>

            {/* Decorative Drag Handle (Visual only) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-neo-white border-2 border-neo-black rounded-full" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};