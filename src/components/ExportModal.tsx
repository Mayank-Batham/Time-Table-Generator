import React, { useRef, useEffect } from 'react';
import { Copy, Download, X } from 'lucide-react';
import { downloadAsJson } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportData: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, exportData }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopyToClipboard = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      navigator.clipboard.writeText(exportData);
      alert('Copied to clipboard!');
    }
  };

  const handleDownload = () => {
    downloadAsJson(exportData, 'timetable-data.json');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl animate-in fade-in zoom-in duration-300"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Export Data for n8n</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="mb-4 text-gray-600">
            Copy this JSON data to use with n8n for generating your AI-powered timetable:
          </p>
          
          <textarea
            ref={textareaRef}
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
            value={exportData}
            readOnly
          />
          
          <div className="flex gap-3 mt-4 justify-end">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <Copy size={16} />
              <span>Copy to Clipboard</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download size={16} />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;