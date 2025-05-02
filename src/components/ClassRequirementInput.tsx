import React from 'react';
import { X } from 'lucide-react';
import { ClassRequirement } from '../types';

interface ClassRequirementInputProps {
  requirement: ClassRequirement;
  onChange: (id: string, field: string, value: string | number) => void;
  onRemove: (id: string) => void;
  isRemovable: boolean;
}

const ClassRequirementInput: React.FC<ClassRequirementInputProps> = ({
  requirement,
  onChange,
  onRemove,
  isRemovable,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
        <div>
          <label htmlFor={`name-${requirement.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Class Name
          </label>
          <input
            type="text"
            id={`name-${requirement.id}`}
            value={requirement.name}
            onChange={(e) => onChange(requirement.id, 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., Math, Science, etc."
            required
          />
        </div>
        <div>
          <label htmlFor={`oneHourSlots-${requirement.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            1-Hour Slots
          </label>
          <input
            type="number"
            id={`oneHourSlots-${requirement.id}`}
            value={requirement.oneHourSlots}
            onChange={(e) => onChange(requirement.id, 'oneHourSlots', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor={`twoHourSlots-${requirement.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            2-Hour Slots
          </label>
          <input
            type="number"
            id={`twoHourSlots-${requirement.id}`}
            value={requirement.twoHourSlots}
            onChange={(e) => onChange(requirement.id, 'twoHourSlots', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div className="relative">
        <label htmlFor={`notes-${requirement.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id={`notes-${requirement.id}`}
          value={requirement.notes}
          onChange={(e) => onChange(requirement.id, 'notes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          placeholder="Add any special requirements or preferences for this class (e.g., 'Prefer morning slots', 'Need lab access', etc.)"
        />
        {isRemovable && (
          <button
            type="button"
            onClick={() => onRemove(requirement.id)}
            className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 focus:outline-none bg-white rounded-full p-1"
            aria-label="Remove class"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassRequirementInput