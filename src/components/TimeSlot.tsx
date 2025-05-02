import React from 'react';
import { X } from 'lucide-react';

interface TimeSlotProps {
  isAvailable: boolean;
  onClick: () => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ isAvailable, onClick }) => {
  return (
    <div 
      className={`
        w-full h-full flex items-center justify-center cursor-pointer 
        transition-all duration-300 ease-in-out
        ${isAvailable ? 'bg-white hover:bg-gray-100' : 'bg-red-100 hover:bg-red-200'}
      `}
      onClick={onClick}
      aria-label={isAvailable ? "Available time slot" : "Unavailable time slot"}
    >
      {!isAvailable && (
        <X className="text-red-500 h-6 w-6 animate-in fade-in duration-300" />
      )}
    </div>
  );
};

export default TimeSlot;