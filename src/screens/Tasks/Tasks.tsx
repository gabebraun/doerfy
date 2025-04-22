import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Sidebar } from '../../components/Sidebar';
import { TasksHeader } from '../../components/TasksHeader';
import { FilterHeader } from '../../components/FilterHeader';
import { PtbTimeBox } from '../PtbTimeBox/PtbTimeBox';
import { TaskList } from '../TaskList/TaskList';
import { Calendar } from '../Calendar/Calendar';
import { AddListDialog } from '../../components/AddListDialog';
import { Theme, getInitialTheme, setTheme as setThemeUtil } from '../../utils/theme';
import { cn } from '../../lib/utils';
import { Filter, ListIcon, CalendarIcon } from 'lucide-react';

export const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTaskTab') || 'timebox';
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isAddListOpen, setIsAddListOpen] = useState(false);

  useEffect(() => {
    setThemeUtil(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('activeTaskTab', activeTab);
  }, [activeTab]);

  const getHeaderProps = () => {
    switch (activeTab) {
      case 'timebox':
        return {
          title: 'Time Box',
          icon: <Filter />,
          addItemLabel: 'Add Time Box'
        };
      case 'lists':
        return {
          title: 'Lists',
          icon: <ListIcon />,
          addItemLabel: 'Add List',
          isAddListOpen,
          setIsAddListOpen
        };
      case 'calendar':
        return {
          title: 'Calendar',
          icon: <CalendarIcon />,
          addItemLabel: 'Add Event'
        };
      default:
        return {
          title: 'Tasks',
          icon: <Filter />,
          addItemLabel: 'Add Task'
        };
    }
  };

  const tabs = (
    <TabsList className="bg-transparent border-b-0">
      <TabsTrigger 
        value="timebox"
        className="flex items-center gap-2 data-[state=active]:bg-transparent"
      >
        <Filter className="w-4 h-4" />
        Time Box
      </TabsTrigger>
      <TabsTrigger 
        value="lists"
        className="flex items-center gap-2 data-[state=active]:bg-transparent"
      >
        <ListIcon className="w-4 h-4" />
        Lists
      </TabsTrigger>
      <TabsTrigger 
        value="calendar"
        className="flex items-center gap-2 data-[state=active]:bg-transparent"
      >
        <CalendarIcon className="w-4 h-4" />
        Calendar
      </TabsTrigger>
    </TabsList>
  );

  return (
    <div className={cn(
      "flex h-screen",
      theme === 'dark' ? 'dark bg-[#0F172A]' : 'bg-white'
    )}>
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
      />
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col h-full"
      >
        <TasksHeader {...getHeaderProps()} theme={theme} tabs={tabs} />
        <FilterHeader theme={theme} />
        <TabsContent value="timebox" className="flex-1 m-0">
          <PtbTimeBox theme={theme} />
        </TabsContent>
        <TabsContent value="lists" className="flex-1 m-0">
          <TaskList theme={theme} isAddListOpen={isAddListOpen} setIsAddListOpen={setIsAddListOpen} />
        </TabsContent>
        <TabsContent value="calendar" className="flex-1 m-0">
          <Calendar theme={theme} />
        </TabsContent>
      </Tabs>

      <AddListDialog
        isOpen={isAddListOpen}
        onClose={() => setIsAddListOpen(false)}
        onSave={(config) => {
          // Handle list creation
          setIsAddListOpen(false);
        }}
      />
    </div>
  );
};