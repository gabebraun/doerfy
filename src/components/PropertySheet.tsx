import React, { useState } from 'react';
import { Task } from '../types/task';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EditableProperty } from './EditableProperty';
import { RichTextEditor } from './RichTextEditor';
import {
  BellIcon,
  ChevronDownIcon,
  XIcon,
  StarIcon,
  MoreHorizontalIcon,
} from 'lucide-react';

interface PropertySheetProps {
  task: Task;
  onClose: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
}

const timeStageOptions = ['queue', 'do', 'doing', 'today', 'done'];
const priorityOptions = ['High', 'Medium', 'Low'];
const energyOptions = ['High', 'Medium', 'Low'];
const listOptions = ['Personal', 'Work', 'Shopping', 'Health'];

export const PropertySheet: React.FC<PropertySheetProps> = ({
  task,
  onClose,
  onTaskUpdate,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);

  const handleTaskUpdate = (updates: Partial<Task>) => {
    onTaskUpdate({ ...task, ...updates, updatedAt: new Date().toISOString() });
  };

  const handleTimeStageChange = (stage: string) => {
    handleTaskUpdate({ timeStage: stage.toLowerCase() as Task['timeStage'] });
  };

  const handleTitleSave = () => {
    if (titleValue.trim() !== task.title) {
      handleTaskUpdate({ title: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="w-[635px] h-full bg-white border border-solid border-[#d9d9d9]">
      <div className="p-4 flex items-center">
        <div className="text-[#5036b0] text-2xl mr-4">●</div>
        <h2 className="font-light text-[#6f6f6f] text-[21px]">About Task</h2>
        <div className="flex-grow" />
        <Button
          variant="ghost"
          size="icon"
          className="text-[#6f6f6f] text-[32px]"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </div>

      <div className="px-8 py-4">
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              className="h-9 bg-[#efefef] border-none rounded flex items-center"
              onClick={() => handleTaskUpdate({ alarm: !task.alarm })}
            >
              <BellIcon className="text-[#6f6f6f] text-[21px] mr-2" />
              <span className="font-normal text-lg">Alarm</span>
            </Button>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              className="h-9 border-[#efefef] rounded flex items-center mr-2"
            >
              <StarIcon className="text-yellow-500 text-lg mr-2" />
              <span className="font-normal text-[#514f4f] text-base">
                Age {task.status || '0'}
              </span>
            </Button>
            <EditableProperty
              label=""
              value={task.timeStage.charAt(0).toUpperCase() + task.timeStage.slice(1)}
              options={timeStageOptions.map(s => s.charAt(0).toUpperCase() + s.slice(1))}
              onChange={handleTimeStageChange}
            />
            <Button variant="ghost" size="sm" className="ml-2">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className={`mb-4 p-2 rounded ${
            isHoveringTitle ? 'bg-[#f5f5f5]' : ''
          }`}
          onMouseEnter={() => setIsHoveringTitle(true)}
          onMouseLeave={() => setIsHoveringTitle(false)}
        >
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleSave();
                }
              }}
              className="text-[21px] font-medium w-full bg-transparent border-none focus:outline-none"
              autoFocus
            />
          ) : (
            <h1
              className="text-[21px] font-medium cursor-text"
              onClick={() => setIsEditingTitle(true)}
            >
              {task.title}
            </h1>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-base mb-2">Description</h3>
          <div className="flex">
            <RichTextEditor
              content={task.description}
              onChange={(content) => handleTaskUpdate({ description: content })}
            />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-base mb-2">Labels</h3>
          <div className="flex gap-2">
            {task.labels.map((label) => (
              <Badge
                key={label}
                className="h-6 bg-[#efefef] text-black rounded-[20px] px-4"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="properties">
          <TabsList className="bg-transparent">
            <TabsTrigger
              value="properties"
              className="bg-[#efefef] text-[#5036b0] data-[state=active]:bg-[#efefef]"
            >
              Properties
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="text-[#6f6f6f] data-[state=active]:bg-[#efefef]"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="text-[#6f6f6f] data-[state=active]:bg-[#efefef]"
            >
              Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-6">
            <div className="grid grid-cols-2 gap-y-8">
              <EditableProperty
                label="Assignee"
                value="Me"
                icon={
                  <img
                    className="w-6 h-6"
                    alt="Assignee"
                    src="/ellipse-927.png"
                  />
                }
                options={['Me', 'Maria Smith', 'John Doe']}
                onChange={(value) => handleTaskUpdate({ assignee: value })}
              />

              <EditableProperty
                label="List"
                value={task.list}
                options={listOptions}
                onChange={(value) => handleTaskUpdate({ list: value })}
              />

              <EditableProperty
                label="Priority"
                value={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                icon={<div className="text-red-500 text-lg">●</div>}
                options={priorityOptions}
                onChange={(value) => 
                  handleTaskUpdate({ 
                    priority: value.toLowerCase() as Task['priority']
                  })
                }
              />

              <EditableProperty
                label="Energy"
                value={task.energy.charAt(0).toUpperCase() + task.energy.slice(1)}
                icon={<div className="text-yellow-500 text-lg">●</div>}
                options={energyOptions}
                onChange={(value) => 
                  handleTaskUpdate({ 
                    energy: value.toLowerCase() as Task['energy']
                  })
                }
              />

              <EditableProperty
                label="Location"
                value={task.location || 'None'}
                options={['Home', 'Office', 'Outside']}
                onChange={(value) => handleTaskUpdate({ location: value })}
              />

              <EditableProperty
                label="Story"
                value={task.story || 'None'}
                options={['Brazil Vacation', 'Home Renovation', 'Career Goals']}
                onChange={(value) => handleTaskUpdate({ story: value })}
              />

              <div>
                <h4 className="font-medium text-base mb-2">Reoccurring</h4>
                <div className="flex items-center">
                  <Checkbox
                    checked={task.isReoccurring}
                    onCheckedChange={(checked) =>
                      handleTaskUpdate({ isReoccurring: checked === true })
                    }
                    className="rounded-sm border-[#808080]"
                  />
                </div>
              </div>

              <EditableProperty
                label="Due Date"
                value={task.dueDate || 'None'}
                options={['Today', 'Tomorrow', 'Next Week']}
                onChange={(value) => handleTaskUpdate({ dueDate: value })}
              />
            </div>

            <div className="mt-16 text-[#6f6f6f] text-base">
              Created {new Date(task.createdAt).toLocaleString()}
              <br />
              Updated {new Date(task.updatedAt).toLocaleString()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};