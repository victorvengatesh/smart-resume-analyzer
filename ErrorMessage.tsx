import React from 'react';
import { ErrorMessageProps } from '../types';

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 my-6 rounded-md shadow-lg glassmorphic-card"
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          {/* Using a more modern error icon */}
          <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-red-300">Oops! An Error Occurred</p>
          <p className="text-sm text-red-400">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;