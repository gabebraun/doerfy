import React from 'react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { Bell, ListIcon } from 'lucide-react';

interface FilterHeaderProps {
  theme?: Theme;
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({ theme = 'light' }) => {
  return (
    <div className={cn(
      "h-14 min-h-[56px] px-6 flex items-center space-x-4",
      theme === 'dark' && "bg-[#1E293B]"
    )}>
      <img
        className="w-6 h-6 rounded-full object-cover"
        alt="User"
        src="/ellipse-927.png"
      />
      <Badge className={cn(
        "h-[34px] px-4 rounded flex items-center gap-2",
        theme === 'dark' 
          ? "bg-[#334155] text-gray-200" 
          : "bg-[#efefef] text-black"
      )}>
        <ListIcon className="w-4 h-4" />
        <span className="font-normal text-sm">Do • Doing • Do Today</span>
      </Badge>
      <Badge className={cn(
        "h-[34px] px-4 rounded flex items-center gap-2",
        theme === 'dark' 
          ? "bg-[#334155] text-gray-200" 
          : "bg-[#efefef] text-black"
      )}>
        <Bell className="w-4 h-4" />
        <span className="font-normal text-sm">Priority</span>
      </Badge>
    </div>
  );
};