export type TimeStage = 'queue' | 'do' | 'doing' | 'today' | 'done';
export type Priority = 'high' | 'medium' | 'low';
export type Energy = 'high' | 'medium' | 'low';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  timeStage: TimeStage;
  stageEntryDate: string;
  
  // Core Properties
  assignee: string;
  list: string;
  priority: Priority;
  energy: Energy;
  location: string | null;
  
  // Relationships
  story: string | null;
  
  // Scheduling
  isReoccurring: boolean;
  reoccurringPattern: string | null;
  dueDate: string | null;
  
  // Metadata
  labels: string[];
  alarm: boolean;
  icon: string; // For the colored dot
  highlighted?: boolean;
  status?: string;
  
  // System fields
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Optional fields
  checklistItems: ChecklistItem[];
  comments: any[]; // To be defined based on comments feature
  attachments: any[]; // To be defined based on attachments feature
}