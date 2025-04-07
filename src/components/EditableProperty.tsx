import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronDownIcon } from 'lucide-react';

interface EditablePropertyProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  options?: string[];
  onChange: (value: string) => void;
}

export const EditableProperty: React.FC<EditablePropertyProps> = ({
  label,
  value,
  icon,
  options = [],
  onChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <h4 className="font-medium text-base mb-2">{label}</h4>
      <div className="inline-block">
        <div
          className={`flex items-center rounded p-2 transition-colors duration-200 cursor-pointer ${
            isHovered ? 'bg-[#f5f5f5]' : ''
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => !isOpen && setIsHovered(false)}
          onClick={() => setIsOpen(!isOpen)}
        >
          {icon && <div className="mr-2">{icon}</div>}
          <span className="text-[#514f4f] text-base">{value}</span>
          {(isHovered || isOpen) && (
            <ChevronDownIcon className="text-[#6f6f6f] text-lg ml-2 mr-1" />
          )}
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-[#f5f5f5] cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};