import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ClassRequirementInput from './ClassRequirementInput';
import { ClassRequirement, FormData } from '../types';

interface ClassFormProps {
  onSubmit: (data: FormData) => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ onSubmit }) => {
  const [requirements, setRequirements] = useState<ClassRequirement[]>([
    { id: uuidv4(), name: '', oneHourSlots: 0, twoHourSlots: 0, notes: '' },
  ]);

  const handleAddRequirement = () => {
    setRequirements([
      ...requirements,
      { id: uuidv4(), name: '', oneHourSlots: 0, twoHourSlots: 0, notes: '' },
    ]);
  };

  const handleRemoveRequirement = (id: string) => {
    setRequirements(requirements.filter((req) => req.id !== id));
  };

  const handleRequirementChange = (id: string, field: string, value: string | number) => {
    setRequirements(
      requirements.map((req) =>
        req.id === id ? { ...req, [field]: value } : req
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const isValid = requirements.every(
      (req) => req.name.trim() !== '' && (req.oneHourSlots > 0 || req.twoHourSlots > 0)
    );
    
    if (isValid) {
      onSubmit({ requirements });
    } else {
      alert('Please fill in all class names and specify at least one slot per class.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Class Requirements</h3>
      
      <div className="space-y-1 mb-6">
        {requirements.map((requirement, index) => (
          <ClassRequirementInput
            key={requirement.id}
            requirement={requirement}
            onChange={handleRequirementChange}
            onRemove={handleRemoveRequirement}
            isRemovable={requirements.length > 1}
          />
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={handleAddRequirement}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusCircle size={18} />
          <span>Add Another Class</span>
        </button>
        
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Generate Time Table
        </button>
      </div>
    </form>
  );
};

export default ClassForm;