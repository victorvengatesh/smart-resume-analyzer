
import React, { useState, useCallback, useEffect } from 'react';
import ResumeInput from './components/ResumeInput';
import AnalyzedDataDisplay from './components/AnalyzedDataDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { analyzeResume } from './services/geminiService';
import { AnalyzedResume } from './types';
import { extractTextFromPdf } from './utils/pdfUtils';

// Enhanced DocumentTextIcon with a little more flair
const DocumentTextIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-8 h-8"}>
    <path d="M5.938 2.813L2.813 5.938v12.124a3.001 3.001 0 003.001 3.001h12.124a3.001 3.001 0 003.001-3.001V5.937a3.001 3.001 0 00-3.001-3.001H5.938zM18.75 4.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75h13.5z"/>
    <path d="M6.75 6.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5zm0 3h10.5a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5zm0 3h6a.75.75 0 010 1.5h-6a.75.75 0 010-1.5z" fillOpacity="0.8"/>
  </svg>
);


const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzedData, setAnalyzedData] = useState<AnalyzedResume | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalyzedData, setShowAnalyzedData] = useState<boolean>(false);

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    setAnalyzedData(null);
    setShowAnalyzedData(false);
    setError(null);
    if (file && file.type !== 'application/pdf') {
        setError("⚠️ Invalid file type. Please upload a PDF file.");
        setSelectedFile(null);
    }
  }, []);

  const handleAnalyzeResume = useCallback(async () => {
    if (!selectedFile) {
      setError("☝️ Please select a PDF file to analyze.");
      return;
    }
    if (selectedFile.type !== 'application/pdf') {
        setError("⚠️ Invalid file type. Please upload a PDF file.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setAnalyzedData(null);
    setShowAnalyzedData(false);

    try {
      // Small delay for UX to show loading spinner properly
      await new Promise(resolve => setTimeout(resolve, 300));
      const resumeText = await extractTextFromPdf(selectedFile);
      if (!resumeText.trim()) {
        setError("📄❌ Could not extract text from the PDF, or the PDF is empty. Please try another file.");
        setIsLoading(false);
        return;
      }
      const data = await analyzeResume(resumeText);
      setAnalyzedData(data);
      setShowAnalyzedData(true); // Trigger animation for data display
    } catch (err) {
      if (err instanceof Error) {
        setError(`Analysis Error: ${err.message}`); // Corrected prefix
      } else {
        setError("❓ An unknown error occurred during analysis or PDF processing.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);
  
  // Add a key to AnalyzedDataDisplay to force re-mount and re-animate on new data
  const analyzedDataKey = selectedFile ? selectedFile.name + selectedFile.lastModified : 'no-data';

  return (
    <div className="min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="text-center mb-10 md:mb-16 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <div className="inline-flex items-center justify-center mb-4">
            <DocumentTextIcon className="w-12 h-12 md:w-16 md:h-16 text-sky-400 mr-3 transform transition-transform duration-500 hover:scale-110" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="gradient-text">✨ Smart Resume Analyzer</span>
            </h1>
        </div>
        <p className="mt-3 text-lg text-slate-400 max-w-3xl mx-auto font-light">
          🚀 Elevate your hiring process! Upload a PDF resume and let our AI extract key insights in seconds.
        </p>
      </header>

      <main className="max-w-5xl mx-auto w-full flex-grow">
        <div className="animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <ResumeInput
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            onAnalyzeClick={handleAnalyzeResume}
            isLoading={isLoading}
            disabled={!selectedFile || selectedFile.type !== 'application/pdf'}
          />
        </div>

        {isLoading && (
          <div className="animate-fadeIn mt-4">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {error && (
          <div className="animate-fadeInUp mt-4" style={{animationDelay: '0.1s'}}>
            <ErrorMessage message={error} />
          </div>
        )}
        
        {showAnalyzedData && analyzedData && !isLoading && !error && (
          <div className="mt-8 md:mt-12" key={analyzedDataKey}>
            <AnalyzedDataDisplay data={analyzedData} />
          </div>
        )}
      </main>

      <footer className="text-center mt-16 py-8 border-t border-slate-700/50 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
        <p className="text-sm text-slate-500">
          Created by Victor Vengatesh
        </p>
      </footer>
    </div>
  );
};

export default App;
