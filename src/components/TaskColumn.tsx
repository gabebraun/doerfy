import React, { useState } from 'react';
import { Button } from './ui/button';
import { MoreHorizontalIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Task } from '../types/task';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskColumnProps {
  title: string;
  count?: number;
  tasks: Task[];
  badgeCount?: number;
  defaultExpanded?: boolean;
  timeStage: Task['timeStage'];
  isActive?: boolean;
  editingTaskId?: string | null;
  isDraggingOver?: boolean;
  isValidDropTarget?: boolean;
  onTaskSelect?: (task: Task) => void;
  onNewTask?: (timeStage: Task['timeStage'], title: string) => void;
  onTaskTitleUpdate?: (taskId: string, title: string) => void;
}

interface DraggableTaskProps {
  task: Task;
  isEditing: boolean;
  onTaskSelect?: (task: Task) => void;
  onTaskTitleUpdate?: (taskId: string, title: string) => void;
  getTaskColor: (icon: string) => string;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  isEditing,
  onTaskSelect,
  onTaskTitleUpdate,
  getTaskColor,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: task,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleNewTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, taskId: string, value: string) => {
    if (e.key === 'Enter' && value.trim()) {
      onTaskTitleUpdate?.(taskId, value.trim());
    } else if (e.key === 'Escape') {
      onTaskTitleUpdate?.(taskId, value.trim() || 'New Task');
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-start mb-3 last:mb-0 cursor-grab active:cursor-grabbing p-1 rounded 
        group transition-colors duration-200
        ${isDragging ? 'opacity-50 bg-gray-50' : ''}
      `}
      onClick={(e) => {
        e.preventDefault();
        if (!isEditing) {
          onTaskSelect?.(task);
        }
      }}
    >
      <div className={`${getTaskColor(task.icon)} text-sm mr-2`}>●</div>
      {isEditing ? (
        <input
          type="text"
          defaultValue={task.title}
          onKeyDown={(e) => handleNewTaskKeyDown(e, task.id, e.currentTarget.value)}
          onBlur={(e) => onTaskTitleUpdate?.(task.id, e.target.value.trim() || 'New Task')}
          className="text-sm w-full border border-[#5036b0] rounded px-2 py-1 focus:outline-none"
          autoFocus
        />
      ) : (
        <span className={`text-sm ${task.status ? 'text-red-500' : 'text-black'}`}>
          {task.title} {task.status && `(${task.status})`}
        </span>
      )}
    </div>
  );
};

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  count,
  tasks,
  badgeCount,
  defaultExpanded = true,
  timeStage,
  isActive = false,
  editingTaskId,
  isDraggingOver = false,
  isValidDropTarget = true,
  onTaskSelect,
  onNewTask,
  onTaskTitleUpdate,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);
  
  const getTaskColor = (icon: string) => {
    switch (icon) {
      case 'purple':
        return 'text-[#aa8ab8]';
      case 'blue':
        return 'text-[#759ce7]';
      default:
        return 'text-[#759ce7]';
    }
  };

  const visibleTasks = showMore ? tasks : tasks.slice(0, 9);
  const taskColumns = [[], [], []];
  
  visibleTasks.forEach((task, index) => {
    const columnIndex = index % 3;
    taskColumns[columnIndex].push(task);
  });

  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <div
          className={`rounded-full p-1 transition-colors duration-200 cursor-pointer hover:bg-gray-100 w-8 h-8 flex items-center justify-center group`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDownIcon className="text-lg text-gray-500 group-hover:text-[#5036b0]" />
          ) : (
            <ChevronUpIcon className="text-lg text-gray-500 group-hover:text-[#5036b0]" />
          )}
        </div>
        <h3 className={`font-black text-sm ml-4 ${isActive ? 'text-[#5036b0]' : 'text-black'}`}>
          {title} {count && `(${count})`}
        </h3>
        {badgeCount && (
          <Badge className="ml-2 h-[18px] bg-[#d9d9d9] text-black rounded-sm">
            <span className="font-light text-sm">{badgeCount}</span>
          </Badge>
        )}
        <div className="flex-grow" />
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 mr-2 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center group"
          onClick={() => {
            onNewTask?.(timeStage, '');
          }}
        >
          <PlusIcon className="text-xl text-gray-500 group-hover:text-[#5036b0]" />
        </Button>
        <Button variant="ghost" size="sm" className="p-0 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center group">
          <MoreHorizontalIcon className="h-4 w-4 text-gray-500 group-hover:text-[#5036b0]" />
        </Button>
      </div>
      <Separator className="mb-4" />

      {isExpanded && (
        <div className="min-h-[50px]">
          <SortableContext 
            items={visibleTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-6">
              {taskColumns.map((columnTasks, columnIndex) => (
                <div key={columnIndex}>
                  {columnTasks.map((task) => (
                    <DraggableTask
                      key={task.id}
                      task={task}
                      isEditing={task.id === editingTaskId}
                      onTaskSelect={onTaskSelect}
                      onTaskTitleUpdate={onTaskTitleUpdate}
                      getTaskColor={getTaskColor}
                    />
                  ))}
                </div>
              ))}
            </div>
          </SortableContext>

          {tasks.length > 9 && (
            <Button
              variant="ghost"
              onClick={() => setShowMore(!showMore)}
              className="w-full mt-4 text-[#6f6f6f]"
            >
              {showMore ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};