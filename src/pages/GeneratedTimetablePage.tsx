import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TestTube2, X, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

interface GeneratedTimeSlot {
  day: string;
  time: string;
  className: string;
}

// Define the days and time slots for the timetable
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
];

// Update the webhook URL to point to our proxy server
const N8N_WEBHOOK_URL = 'http://localhost:3000/api/timetable';

function GeneratedTimetablePage() {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<GeneratedTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingN8N, setIsUsingN8N] = useState(false);

  const parseCsvData = (csvData: any[]) => {
    const newTimetable: GeneratedTimeSlot[] = [];
    
    // Skip the header row and process each day's row
    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      const day = row.Day;
      
      // Process each time slot column
      TIME_SLOTS.forEach(time => {
        const className = row[time]?.trim();
        if (className) {
          newTimetable.push({
            day,
            time,
            className
          });
        }
      });
    }
    
    return newTimetable;
  };

  const fetchFromN8N = async () => {
    setLoading(true);
    setError(null);
    setIsUsingN8N(true);
    
    try {
      console.log('Fetching from n8n via proxy...');
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'get_timetable'
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `HTTP error! status: ${response.status}\n` +
          (errorData ? `Details: ${JSON.stringify(errorData, null, 2)}` : '')
        );
      }
      
      const responseText = await response.text();
      console.log('Received response:', responseText);
      
      if (!responseText) {
        throw new Error('Empty response received from n8n');
      }

      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(responseText);
        console.log('Parsed JSON response:', jsonData);
        
        // If it's JSON with a CSV field, use that
        const csvText = jsonData.csv || responseText;
        
        // Clean up the CSV text by removing any extra characters
        const cleanCsvText = csvText.replace(/\\n/g, '\n').replace(/^```csv\n/, '').replace(/```$/, '').trim();
        console.log('Cleaned CSV text:', cleanCsvText);
        
        Papa.parse(cleanCsvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Parsed CSV data:', results.data);
            if (!results.data || results.data.length === 0) {
              throw new Error('No data found in CSV');
            }
            const parsedData = parseCsvData(results.data);
            console.log('Converted timetable data:', parsedData);
            setTimetable(parsedData);
            setLoading(false);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            setError('Failed to parse timetable data: ' + error.message);
            setLoading(false);
          },
        });
      } catch (e) {
        // If not JSON, treat as CSV directly
        const cleanCsvText = responseText.replace(/\\n/g, '\n').replace(/^```csv\n/, '').replace(/```$/, '').trim();
        console.log('Treating response as CSV:', cleanCsvText);
        
        Papa.parse(cleanCsvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Parsed CSV data:', results.data);
            if (!results.data || results.data.length === 0) {
              throw new Error('No data found in CSV');
            }
            const parsedData = parseCsvData(results.data);
            console.log('Converted timetable data:', parsedData);
            setTimetable(parsedData);
            setLoading(false);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            setError('Failed to parse timetable data: ' + error.message);
            setLoading(false);
          },
        });
      }
    } catch (error) {
      console.error('Error fetching from n8n:', error);
      setError('Failed to fetch timetable from n8n: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLoading(false);
    }
  };

  const testN8NConnection = async () => {
    try {
      console.log('Testing n8n connection via proxy...');
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'test_connection'
        })
      });
      console.log('Test Response status:', response.status);
      console.log('Test Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      // Try to parse the response
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Test Parsed data:', results.data);
        },
        error: (error: Error) => {
          console.error('Test Parse error:', error);
        }
      });
    } catch (error) {
      console.error('Test Error:', error);
    }
  };

  useEffect(() => {
    fetchFromN8N();
  }, []);

  const handleDownload = () => {
    try {
      // Convert timetable back to the original CSV format
      const header = ['Day', ...TIME_SLOTS];
      const rows = DAYS.map(day => {
        const row: any = { Day: day };
        TIME_SLOTS.forEach(time => {
          const slot = timetable.find(s => s.day === day && s.time === time);
          row[time] = slot?.className || '';
        });
        return row;
      });

      const csv = Papa.unparse({
        fields: header,
        data: rows
      });

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

  if (loading) {
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
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timetable...</p>
        </div>
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
            Retry
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
            onClick={testN8NConnection}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <TestTube2 className="h-5 w-5 mr-2" />
            Test Connection
          </button>
          <button
            onClick={fetchFromN8N}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
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
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[120px_repeat(7,1fr)] border-t border-l border-gray-300">
            {/* Header Row */}
            <div className="border-b border-r border-gray-300 bg-gray-100 p-2 font-semibold">Day / Time</div>
            {TIME_SLOTS.map((time) => (
              <div 
                key={time} 
                className="border-b border-r border-gray-300 p-2 font-semibold text-center text-sm bg-gray-100"
              >
                {time}
              </div>
            ))}

            {/* Day Rows */}
            {DAYS.map((day) => (
              <React.Fragment key={day}>
                <div className="border-b border-r border-gray-300 bg-gray-50 p-2 flex items-center font-medium">
                  {day}
                </div>
                {TIME_SLOTS.map((time) => {
                  const slot = timetable.find((s) => s.day === day && s.time === time);
                  return (
                    <div
                      key={`${day}-${time}`}
                      className="border-b border-r border-gray-300 h-12 md:h-16 flex items-center justify-center"
                    >
                      {slot?.className && (
                        <div className="text-center p-2">
                          <div className="font-medium">{slot.className}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratedTimetablePage;