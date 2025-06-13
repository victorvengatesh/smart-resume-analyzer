import React from 'react';
import { LoadingSpinnerProps } from '../types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  let spinnerSizeClass = 'h-10 w-10'; // Default to a slightly larger medium
  let borderSizeClass = 'border-4';
  if (size === 'sm') {
    spinnerSizeClass = 'h-6 w-6';
    borderSizeClass = 'border-2';
  } else if (size === 'lg') {
    spinnerSizeClass = 'h-16 w-16';
    borderSizeClass = 'border-[5px]';
  }

  return (
    <div className="flex flex-col justify-center items-center my-8 space-y-3">
      <div
        className={`${spinnerSizeClass} animate-spin rounded-full ${borderSizeClass} border-solid border-sky-500 border-t-transparent`}
        role="status"
        aria-label="Loading..."
      ></div>
      <p className="text-sky-400 text-sm">Processing your resume...</p>
    </div>
  );
};

export default LoadingSpinner;