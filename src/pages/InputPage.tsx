import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimeTable from '../components/TimeTable';
import ClassForm from '../components/ClassForm';
import { TimeSlot, FormData } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../constants';

const N8N_WEBHOOK_URL = 'https://jellomello.app.n8n.cloud/webhook-test/8f1e1932-7c63-4c1b-8936-d3aa13c5395d';

function InputPage() {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    DAYS_OF_WEEK.flatMap(day =>
      TIME_SLOTS.map(time => ({
        day,
        time,
        isAvailable: true
      }))
    )
  );

  const handleTimeSlotToggle = (day: string, time: string) => {
    setTimeSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.day === day && slot.time === time
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  const handleFormSubmit = async (formData: FormData) => {
    console.log('Form submitted with data:', {
      timeSlots,
      requirements: formData.requirements
    });

    // First store the data in localStorage
    localStorage.setItem('timetableData', JSON.stringify({
      timeSlots,
      requirements: formData.requirements
    }));
    console.log('Data stored in localStorage');
    
    // Navigate to the generated timetable page
    navigate('/generated-timetable');
    console.log('Navigated to generated timetable page');

    // Then make the POST request to n8n
    try {
      console.log('Sending data to n8n webhook...');
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeSlots,
          requirements: formData.requirements
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('n8n response:', responseData);
      console.log('Data successfully sent to n8n');
    } catch (error) {
      console.error('Error sending data to n8n:', error);
      // Don't show error to user since we've already navigated away
    }
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>
        <TimeTable timeSlots={timeSlots} onTimeSlotToggle={handleTimeSlotToggle} />
      </div>

      <ClassForm onSubmit={handleFormSubmit} />
    </>
  );
}

export default InputPage;