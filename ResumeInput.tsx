import React, { useRef } from 'react';

interface ResumeInputProps {
  onFileChange: (file: File | null) => void;
  onAnalyzeClick: () => void;
  isLoading: boolean;
  selectedFile: File | null;
  disabled: boolean;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ 
  onFileChange, 
  onAnalyzeClick, 
  isLoading, 
  selectedFile,
  disabled 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  const handleLabelClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-8 p-6 md:p-8 glassmorphic-card">
      <h2 className="text-2xl md:text-3xl font-semibold text-sky-300 mb-6 text-center">
        📄 Upload Your Resume
      </h2>
      
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={isLoading}
          aria-labelledby="file-upload-label"
        />
        <label
          id="file-upload-label"
          onClick={handleLabelClick}
          className={`file-input-label ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          tabIndex={isLoading ? -1 : 0}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isLoading) handleLabelClick(); }}
          role="button"
          aria-disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {selectedFile ? 'Change PDF' : 'Select PDF File'}
        </label>

        {selectedFile && (
          <p className="text-slate-300 text-sm animate-fadeIn">
            Selected: <span className="font-medium text-sky-400">{selectedFile.name}</span>
          </p>
        )}
        {!selectedFile && (
           <p className="text-slate-400 text-sm">No file selected. Please choose a PDF document.</p>
        )}

        <button
          onClick={onAnalyzeClick}
          disabled={isLoading || disabled || !selectedFile}
          className="mt-4 px-10 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none"
          aria-label="Analyze selected resume PDF"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            '🚀 Analyze Resume'
          )}
        </button>
      </div>
    </div>
  );
};

export default ResumeInput;