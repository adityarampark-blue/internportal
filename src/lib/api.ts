export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

import { Intern, Attendance } from '@/data/types';

export async function getInterns(): Promise<Intern[]> {
  const res = await fetch(`${API_BASE}/interns`);
  if (!res.ok) throw new Error('Failed to fetch interns');
  return res.json();
}

export async function getAttendance(): Promise<Attendance[]> {
  const res = await fetch(`${API_BASE}/attendance`);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function createIntern(payload: Omit<Intern, 'id'>) {
  const res = await fetch(`${API_BASE}/interns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create intern');
  return res.json();
}

export async function updateIntern(id: string, payload: Partial<Intern>) {
  const res = await fetch(`${API_BASE}/interns/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to update intern');
  return res.json();
}

export async function deleteIntern(id: string) {
  const res = await fetch(`${API_BASE}/interns/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete intern');
  return res.json();
}

export default { getInterns, createIntern, updateIntern, deleteIntern };

// Tasks
export async function getTasks() { const res = await fetch(`${API_BASE}/tasks`); if (!res.ok) throw new Error('Failed to fetch tasks'); return res.json(); }
export async function createTask(payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to create task'); return res.json(); }
export async function updateTask(id: string, payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to update task'); return res.json(); }

// Meetings
export async function getMeetings() { const res = await fetch(`${API_BASE}/meetings`); if (!res.ok) throw new Error('Failed to fetch meetings'); return res.json(); }
export async function createMeeting(payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/meetings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to create meeting'); return res.json(); }
export async function updateMeeting(id: string, payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/meetings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to update meeting'); return res.json(); }

// Documents
export async function getDocuments() { const res = await fetch(`${API_BASE}/documents`); if (!res.ok) throw new Error('Failed to fetch documents'); return res.json(); }
export async function createDocument(payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to create document'); return res.json(); }
export async function updateDocument(id: string, payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to update document'); return res.json(); }
export async function deleteDocument(id: string) { const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed to delete document'); return res.json(); }

// Attendance
export async function createAttendance(payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/attendance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to create attendance'); return res.json(); }
export async function updateAttendance(id: string, payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/attendance/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to update attendance'); return res.json(); }

// Updates
export async function getUpdates() { const res = await fetch(`${API_BASE}/updates`); if (!res.ok) throw new Error('Failed to fetch updates'); return res.json(); }
export async function createUpdate(payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/updates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to create update'); return res.json(); }
export async function updateUpdate(id: string, payload: Record<string, unknown>) { const res = await fetch(`${API_BASE}/updates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Failed to update update'); return res.json(); }

export const api = { getInterns, createIntern, updateIntern, deleteIntern, getTasks, createTask, updateTask, getMeetings, createMeeting, updateMeeting, getDocuments, createDocument, updateDocument, deleteDocument, getAttendance, createAttendance, updateAttendance, getUpdates, createUpdate, updateUpdate };
