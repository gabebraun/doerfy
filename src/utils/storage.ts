import { Task } from '../types/task';
import { TimeBox } from '../types/timeBox';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  TIME_BOXES: 'doerfy_timeboxes',
} as const;

// TimeBox functions remain localStorage-based for now
export function saveTimeBoxes(timeBoxes: TimeBox[]): void {
  localStorage.setItem(STORAGE_KEYS.TIME_BOXES, JSON.stringify(timeBoxes));
}

export function loadTimeBoxes(): TimeBox[] | null {
  const stored = localStorage.getItem(STORAGE_KEYS.TIME_BOXES);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored time boxes:', e);
    return null;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    // First, get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Prepare tasks for upsert by mapping them to the database schema
    const tasksToUpsert = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      time_stage: task.timeStage,
      stage_entry_date: task.stageEntryDate,
      assignee: user.id,
      list: task.list,
      priority: task.priority,
      energy: task.energy,
      location: task.location,
      story: task.story,
      labels: task.labels,
      icon: task.icon,
      show_in_time_box: task.showInTimeBox,
      show_in_list: task.showInList,
      show_in_calendar: task.showInCalendar,
      highlighted: task.highlighted,
      status: task.status,
      aging_status: task.agingStatus,
      created_at: task.createdAt,
      updated_at: new Date().toISOString(),
      created_by: user.id
    }));

    // Perform the upsert operation
    const { error } = await supabase
      .from('tasks')
      .upsert(tasksToUpsert, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving tasks to Supabase:', error);
    throw error;
  }
}

export async function loadTasks(): Promise<Task[]> {
  try {
    // First, get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Fetch tasks from Supabase
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!tasks) {
      return [];
    }

    // Map the database records to our Task type
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      timeStage: task.time_stage,
      stageEntryDate: task.stage_entry_date,
      assignee: task.assignee,
      list: task.list,
      priority: task.priority,
      energy: task.energy,
      location: task.location,
      story: task.story,
      labels: task.labels || [],
      icon: task.icon,
      showInTimeBox: task.show_in_time_box ?? true,
      showInList: task.show_in_list ?? true,
      showInCalendar: task.show_in_calendar ?? false,
      highlighted: task.highlighted,
      status: task.status,
      agingStatus: task.aging_status,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      createdBy: task.created_by,
      checklistItems: [],
      comments: [],
      attachments: [],
      history: []
    }));
  } catch (error) {
    console.error('Error loading tasks from Supabase:', error);
    throw error;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting task from Supabase:', error);
    throw error;
  }
}