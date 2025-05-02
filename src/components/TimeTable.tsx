import React from 'react';
import TimeSlot from './TimeSlot';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../constants';
import { TimeSlot as TimeSlotType } from '../types';

interface TimeTableProps {
  timeSlots: TimeSlotType[];
  onTimeSlotToggle: (day: string, time: string) => void;
}

const TimeTable: React.FC<TimeTableProps> = ({ timeSlots, onTimeSlotToggle }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[120px_repeat(8,1fr)] border-t border-l border-gray-300">
          {/* Header Row */}
          <div className="border-b border-r border-gray-300 bg-gray-100 p-2 font-semibold">Day / Time</div>
          {TIME_SLOTS.map((time) => (
            <div 
              key={time} 
              className={`border-b border-r border-gray-300 p-2 font-semibold text-center text-sm
                ${time === '12:00 PM - 1:00 PM' ? 'bg-gray-200' : 'bg-gray-100'}`}
            >
              {time}
            </div>
          ))}

          {/* Day Rows */}
          {DAYS_OF_WEEK.map((day) => (
            <React.Fragment key={day}>
              <div className="border-b border-r border-gray-300 bg-gray-50 p-2 flex items-center font-medium">
                {day}
              </div>
              {TIME_SLOTS.map((time) => {
                const isLunchHour = time === '12:00 PM - 1:00 PM';
                const slot = timeSlots.find((s) => s.day === day && s.time === time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className={`border-b border-r border-gray-300 h-12 md:h-16 flex items-center justify-center
                      ${isLunchHour ? 'bg-gray-200' : ''}`}
                  >
                    {!isLunchHour && (
                      <TimeSlot
                        isAvailable={slot?.isAvailable ?? true}
                        onClick={() => onTimeSlotToggle(day, time)}
                      />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-4 text-gray-600 text-sm">
        <p>Click on a time slot to mark it as unavailable (indicated with a red X).</p>
        <p>The grey column (12:00 PM - 1:00 PM) is reserved for lunch and cannot be modified.</p>
      </div>
    </div>
  );
};

export default TimeTable;