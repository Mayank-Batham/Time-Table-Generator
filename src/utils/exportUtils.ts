import { TimeSlot, FormData } from '../types';

export const generateExportData = (
  timeSlots: TimeSlot[],
  formData: FormData
): string => {
  // Filter to only get unavailable slots
  const unavailableSlots = timeSlots.filter(slot => !slot.isAvailable);
  
  // Create a JSON structure that would be suitable for n8n
  const exportData = {
    unavailableSlots: unavailableSlots.map(slot => ({
      day: slot.day,
      time: slot.time
    })),
    classRequirements: formData.requirements.map(req => ({
      className: req.name,
      oneHourSlots: req.oneHourSlots,
      twoHourSlots: req.twoHourSlots,
      notes: req.notes
    }))
  };
  
  // Return formatted JSON string
  return JSON.stringify(exportData, null, 2);
};

export const downloadAsJson = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};