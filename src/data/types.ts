export interface Intern {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'disabled';
  avatar: string;
  group: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  group: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  link: string;
  description: string;
  group?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  assignedTo: string[];
  category: string;
}

export interface DailyUpdate {
  id: string;
  internId: string;
  date: string;
  content: string;
  hoursWorked: number;
}

export interface Attendance {
  id: string;
  internId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkIn: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'intern';
  approved?: boolean;
}
