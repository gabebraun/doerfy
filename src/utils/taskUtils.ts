import { Task } from '../types/task';
import { getCurrentUser } from './supabaseClient';

export async function createNewTask(list: string, title: string = ''): Promise<Task> {
  console.log('Creating new task:', { list, title });
  
  const now = new Date().toISOString();
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }

  // Ensure title is never empty
  const taskTitle = title.trim() || 'New Task';

  const newTask = {
    id: crypto.randomUUID(),
    title: taskTitle,
    description: '',
    timeStage: 'queue',
    stageEntryDate: now,
    assignee: user.id,
    list,
    priority: 'medium',
    energy: 'medium',
    location: null,
    story: null,
    labels: [],
    showInTimeBox: true,
    showInList: true,
    showInCalendar: false,
    icon: 'blue',
    checklistItems: [],
    comments: [],
    attachments: [],
    history: [{
      timeStage: 'queue',
      entryDate: now,
      userId: user.id
    }],
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  };

  console.log('Created task:', newTask);
  return newTask;
}

export function validateTaskTitle(title: string): string {
  return title.trim() || 'New Task';
}