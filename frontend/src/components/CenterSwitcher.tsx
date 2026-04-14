import React, { useState } from 'react';
import { useStore } from '../store';
import { Building2, ChevronDown, Check } from 'lucide-react';

export const CenterSwitcher: React.FC = () => {
  const { currentUser, currentCenter, allCenters, switchCenter } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser || currentUser.role?.toUpperCase() !== 'SUPER_ADMIN' || allCenters.length <= 1) {
    return null;
  }

  const handleCenterChange = async (center: any) => {
    setIsOpen(false);
    if (center.id !== currentCenter?.id) {
      try {
        localStorage.setItem('currentCenter', JSON.stringify(center));
      } catch {
        // ignore storage errors
      }
      await switchCenter(center);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Building2 className="w-4 h-4 text-teal-600" />
        <span className="text-sm font-medium text-slate-700">
          {currentCenter?.name || 'Centre non sélectionné'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Postes de santé
              </div>
              {allCenters.map((center) => (
                <button
                  key={center.id}
                  onClick={() => handleCenterChange(center)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    center.id === currentCenter?.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">{center.name}</div>
                    <div className="text-xs opacity-75">{center.location}</div>
                  </div>
                  {center.id === currentCenter?.id && (
                    <Check className="w-4 h-4 text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
