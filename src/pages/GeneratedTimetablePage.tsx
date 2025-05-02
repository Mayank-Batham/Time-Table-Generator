import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TestTube2, X, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

interface GeneratedTimeSlot {
  day: string;
  time: string;
  className: string;
}

interface CsvRow {
  Day?: string;
  day?: string;
  Time?: string;
  time?: string;
  Class?: string;
  class?: string;
  className?: string;
}

// Mock CSV data for testing
const MOCK_CSV_DATA = `Day,Time,Class
Monday,9:00 AM - 10:00 AM,Mathematics
Monday,11:00 AM - 12:00 PM,Physics
Monday,2:00 PM - 3:00 PM,Chemistry
Tuesday,9:00 AM - 10:00 AM,Biology
Tuesday,1:00 PM - 2:00 PM,English
Wednesday,10:00 AM - 11:00 AM,History
Wednesday,3:00 PM - 4:00 PM,Geography
Thursday,9:00 AM - 10:00 AM,Computer Science
Thursday,12:00 PM - 1:00 PM,Art
Friday,10:00 AM - 11:00 AM,Music
Friday,2:00 PM - 3:00 PM,Physical Education`;

// Define the days and time slots for the timetable
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM'
];

// n8n webhook configuration
const N8N_WEBHOOK_URL = 'https://jellomello.app.n8n.cloud/webhook-test/8f1e1932-7c63-4c1b-8936-d3aa13c5395d'; // Replace with your actual n8n webhook URL

function GeneratedTimetablePage() {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<GeneratedTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [isUsingN8N, setIsUsingN8N] = useState(false);

  const fetchFromN8N = async () => {
    setLoading(true);
    setError(null);
    setIsUsingN8N(true);
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch from n8n');
      }
      
      const data = await response.json();
      // Assuming n8n returns data in the format: { timetable: [{ day, time, className }] }
      if (data.timetable) {
        setTimetable(data.timetable);
      } else {
        throw new Error('Invalid data format from n8n');
      }
    } catch (error) {
      console.error('Error fetching from n8n:', error);
      setError('Failed to fetch timetable from n8n');
      // Fallback to mock data if n8n fails
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setLoading(true);
    setError(null);
    setIsUsingN8N(false);
    
    try {
      Papa.parse<CsvRow>(MOCK_CSV_DATA, {
        header: true,
        complete: (results: Papa.ParseResult<CsvRow>) => {
          const parsedData = results.data.map((row) => ({
            day: row.Day || row.day || '',
            time: row.Time || row.time || '',
            className: row.Class || row.class || row.className || '',
          }));
          setTimetable(parsedData);
          setLoading(false);
        },
        error: (error: Error) => {
          console.error('Error parsing CSV:', error);
          setError('Failed to parse timetable data');
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error loading mock data:', error);
      setError('Failed to load mock data');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to fetch from n8n first, fallback to mock data if it fails
    fetchFromN8N();
  }, []);

  const handleDownload = () => {
    try {
      const csv = Papa.unparse(timetable);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'timetable.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading timetable:', error);
      setError('Failed to download timetable');
    }
  };

  const toggleBlockedSlot = (day: string, time: string) => {
    if (time === '12:00 PM - 1:00 PM') {
      return;
    }
    const slotKey = `${day}-${time}`;
    const newBlockedSlots = new Set(blockedSlots);
    if (newBlockedSlots.has(slotKey)) {
      newBlockedSlots.delete(slotKey);
    } else {
      newBlockedSlots.add(slotKey);
    }
    setBlockedSlots(newBlockedSlots);
  };

  const getClassForSlot = (day: string, time: string): string => {
    if (time === '12:00 PM - 1:00 PM') {
      return '';
    }
    const slot = timetable.find(
      (item) => item.day.toLowerCase() === day.toLowerCase() && item.time === time
    );
    return slot?.className || '';
  };

  const isSlotBlocked = (day: string, time: string): boolean => {
    if (time === '12:00 PM - 1:00 PM') {
      return false;
    }
    return blockedSlots.has(`${day}-${time}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Input
          </button>
          <button
            onClick={fetchFromN8N}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            {isUsingN8N ? 'Refresh from n8n' : 'Load from n8n'}
          </button>
          <button
            onClick={loadMockData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <TestTube2 className="h-5 w-5 mr-2" />
            Test Data
          </button>
        </div>
        <div className="text-red-600 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Input
        </button>
        <div className="flex gap-2">
          <button
            onClick={fetchFromN8N}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            {isUsingN8N ? 'Refresh from n8n' : 'Load from n8n'}
          </button>
          <button
            onClick={loadMockData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <TestTube2 className="h-5 w-5 mr-2" />
            Test Data
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Timetable
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Generated Timetable</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              {TIME_SLOTS.map((time) => (
                <th
                  key={time}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {DAYS.map((day) => (
              <tr key={day} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {day}
                </td>
                {TIME_SLOTS.map((time) => {
                  const className = getClassForSlot(day, time);
                  const isBlocked = isSlotBlocked(day, time);
                  return (
                    <td
                      key={`${day}-${time}`}
                      className={`px-4 py-3 whitespace-nowrap text-sm ${
                        className ? 'text-gray-900 bg-blue-50' : 'text-gray-400'
                      } ${isBlocked ? 'bg-red-50' : ''}`}
                      onClick={() => !className && toggleBlockedSlot(day, time)}
                    >
                      {className ? (
                        className
                      ) : isBlocked ? (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        'Free'
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GeneratedTimetablePage;