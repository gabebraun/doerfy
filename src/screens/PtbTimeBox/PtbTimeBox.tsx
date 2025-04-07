import React, { useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { TaskColumn } from "../../components/TaskColumn";
import { PropertySheet } from "../../components/PropertySheet";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  FlameIcon,
  InfoIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { Task } from "../../types/task";
import { queueTasks, doTasks, doingTasks, todayTasks } from "../../data/sampleTasks";

const validDropTargets = {
  queue: ['do', 'doing', 'today', 'done'],
  do: ['queue', 'doing', 'today', 'done'],
  doing: ['queue', 'do', 'today', 'done'],
  today: ['queue', 'do', 'doing', 'done'],
  done: ['queue', 'do', 'doing', 'today'],
};

export const PtbTimeBox = (): JSX.Element => {
  const [tasks, setTasks] = useState<Task[]>([
    ...queueTasks,
    ...doTasks,
    ...doingTasks,
    ...todayTasks,
  ]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTimeStage, setActiveTimeStage] = useState<Task['timeStage']>('queue');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Task['timeStage'] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useHotkeys('ctrl+shift+a', (e) => {
    e.preventDefault();
    const newTask = handleNewTask(activeTimeStage, '');
    setEditingTaskId(newTask.id);
  });

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setActiveTimeStage(task.timeStage);
    setEditingTaskId(null);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setSelectedTask(updatedTask);
    setActiveTimeStage(updatedTask.timeStage);
  };

  const handleNewTask = (timeStage: Task['timeStage'], title: string): Task => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: '',
      timeStage,
      stageEntryDate: new Date().toISOString(),
      assignee: 'user-456',
      list: 'personal',
      priority: 'medium',
      energy: 'medium',
      location: null,
      story: null,
      isReoccurring: false,
      reoccurringPattern: null,
      dueDate: null,
      labels: [],
      alarm: false,
      icon: 'blue',
      checklistItems: [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-789',
    };

    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setSelectedTask(newTask);
    setActiveTimeStage(timeStage);
    return newTask;
  };

  const handleTaskTitleUpdate = (taskId: string, newTitle: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, title: newTitle } : task
      )
    );
    setEditingTaskId(null);
  };

  const getTasksByStage = (stage: Task['timeStage']) => {
    return tasks.filter(task => task.timeStage === stage);
  };

  const isValidDropTarget = (sourceStage: Task['timeStage'], targetStage: Task['timeStage']) => {
    return validDropTargets[sourceStage]?.includes(targetStage) ?? false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setDraggedTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (!activeTask || !overTask) return;

    if (activeTask.timeStage !== overTask.timeStage) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === active.id
            ? { 
                ...task, 
                timeStage: overTask.timeStage,
                stageEntryDate: new Date().toISOString(),
                status: '0' // Reset aging on move
              }
            : task
        )
      );
    } else if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      setTasks(prevTasks => arrayMove(prevTasks, oldIndex, newIndex));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedTask(null);
    setDragOverStage(null);
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-x-hidden w-[1921px] h-[1074px]">
        <div className="relative w-[1922px] h-[1074px] -left-px">
          <img
            className="absolute w-[1920px] h-[969px] top-0 left-0"
            alt="Background"
            src="/image-454.png"
          />

          <div className="absolute w-[1179px] h-[827px] top-[130px] left-[55px] bg-white" />
          <div className="absolute w-[259px] h-[43px] top-[74px] left-[55px] bg-white" />
          <div className="absolute w-[377px] h-12 top-[72px] left-[53px] bg-white" />

          <div className="absolute w-[466px] h-[42px] top-[11px] left-px bg-white flex items-center">
            <div className="absolute w-12 h-12 top-0 left-3.5 bg-[url(/ellipse-925.svg)] bg-[100%_100%]">
              <div className="relative w-[41px] h-[42px] top-1.5 left-[7px]">
                <img
                  className="absolute w-[39px] h-[39px] top-[3px] left-0.5"
                  alt="Intersect"
                  src="/intersect.svg"
                />
                <div className="absolute w-[31px] h-[31px] top-0 left-0 bg-white rounded-[15.5px]" />
                <img
                  className="absolute w-5 h-4 top-1.5 left-[5px]"
                  alt="Vector"
                  src="/vector-3.svg"
                />
                <img
                  className="absolute w-3.5 h-3.5 top-2 left-[11px]"
                  alt="Vector"
                  src="/vector-6.svg"
                />
              </div>
            </div>
            <div className="absolute top-5 left-[67px] font-semibold text-2xl">
              <span className="text-black">&nbsp;</span>
              <span className="text-[#85838e]">DOER</span>
              <span className="text-[#8f7fcd]">FY</span>
            </div>
          </div>

          <div className="absolute w-[54px] h-[901px] top-[65px] left-0 bg-white border border-solid border-[#cccccc] flex flex-col items-center">
            <div className="mt-4 text-[#808080] text-xl">
              <SearchIcon />
            </div>
            <div className="w-8 h-8 mt-10 bg-[#8f7fcd] rounded flex items-center justify-center text-white text-xl">
              <ClockIcon />
            </div>
            <div className="mt-10 text-[#6f6f6f] text-xl">
              <ChevronDownIcon />
            </div>
            <div className="mt-10 text-[#808080] text-xl">
              <ChevronRightIcon />
            </div>
            <div className="mt-10 text-[#808080] text-xl">
              <InfoIcon />
            </div>
            <div className="mt-10 text-[#808080] text-xl">
              <SearchIcon />
            </div>
            <div className="mt-10 text-[#808080] text-xl">
              <SearchIcon />
            </div>
            <div className="mt-10 text-[#808080] text-xl">
              <SearchIcon />
            </div>
            <div className="mt-10 text-[#808080] text-xl">
              <SearchIcon />
            </div>
          </div>

          <div className="absolute top-[83px] left-[87px] flex items-center">
            <ClockIcon className="text-[#5036b0] text-2xl" />
            <span className="ml-4 font-light text-[#6f6f6f] text-2xl">
              Time Box
            </span>
          </div>

          <div className="absolute top-[157px] left-[450px] flex items-center space-x-4">
            <img
              className="w-6 h-6 object-cover"
              alt="Ellipse"
              src="/ellipse-927.png"
            />
            <Badge className="h-[34px] px-4 bg-[#efefef] text-black rounded flex items-center">
              <div className="text-[#5036b0] mr-1">●</div>
              <span className="font-normal text-sm">Work ● Personal</span>
            </Badge>
            <Badge className="h-[34px] px-4 bg-[#efefef] text-black rounded flex items-center">
              <div className="text-red-500 mr-1">
                <FlameIcon size={16} />
              </div>
              <span className="font-normal text-sm text-[#514f4f]">Energy</span>
            </Badge>
            <div className="w-4 h-4 bg-[#d9d9d9] rounded-lg ml-4 flex items-center justify-center">
              <span className="font-normal text-[8px]">+2</span>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="absolute top-[220px] left-[198px] w-[900px]">
              {(['queue', 'do', 'doing', 'today', 'done'] as const).map((stage) => (
                <TaskColumn
                  key={stage}
                  title={stage === 'queue' ? 'Do Queue' : 
                         stage === 'do' ? 'Do' :
                         stage === 'doing' ? 'Doing' :
                         stage === 'today' ? 'Do Today' : 'Done'}
                  count={getTasksByStage(stage).length}
                  tasks={getTasksByStage(stage)}
                  badgeCount={getTasksByStage(stage).length}
                  defaultExpanded={stage !== 'doing' && stage !== 'done'}
                  timeStage={stage}
                  onTaskSelect={handleTaskSelect}
                  onNewTask={handleNewTask}
                  onTaskTitleUpdate={handleTaskTitleUpdate}
                  editingTaskId={editingTaskId}
                  isActive={activeTimeStage === stage}
                  isDraggingOver={dragOverStage === stage}
                  isValidDropTarget={draggedTask ? isValidDropTarget(draggedTask.timeStage, stage) : true}
                />
              ))}
            </div>
          </DndContext>

          {selectedTask && (
            <div className="absolute top-[72px] right-0">
              <PropertySheet
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onTaskUpdate={handleTaskUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};