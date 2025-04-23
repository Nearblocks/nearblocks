import React, { ChangeEvent } from 'react';
import CalenderIcon from '../Icons/CalenderIcon';

interface DateInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (date: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({ id, name, value, onChange }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = formatDate(value);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative w-[80%] max-w-md mx-auto">
      <div>
        <input
          type="date"
          id={id}
          name={name}
          value={value || ''}
          onChange={handleDateChange}
          className="absolute inset-0 h-full w-[92%] opacity-0 focus:outline-none"
        />
      </div>
      <div className="flex items-center border w-full border-gray-300 dark:border-gray-700 rounded-md focus:outline-none text-center px-4 py-2">
        <input
          type="text"
          className={`w-full focus:outline-none`}
          value={formattedDate}
          readOnly
          onClick={() => document.getElementById(id || '')?.click()}
        />
        <CalenderIcon className="w-4" />
      </div>
    </div>
  );
};

export default DateInput;
