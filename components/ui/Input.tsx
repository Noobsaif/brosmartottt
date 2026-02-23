import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{label}</label>
      <input
        className={`px-5 py-3.5 rounded-xl border-2 ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500/20'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"><i className="fa-solid fa-circle-exclamation"></i> {error}</span>}
    </div>
  );
};