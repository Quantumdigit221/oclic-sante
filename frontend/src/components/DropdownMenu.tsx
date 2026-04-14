import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DropdownMenuProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-400">{icon}</span>
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="pl-8 py-1 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
};
