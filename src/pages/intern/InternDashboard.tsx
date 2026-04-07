import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInterns, getTasks, getAttendance, getMeetings, getDocuments } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ClipboardList, Video } from 'lucide-react';
import { Intern } from '@/data/types';

const formattedInternId = (id?: string) => id || '';

const InternDashboard = () => {
  const { user } = useAuth();
  const [intern, setIntern] = useState<Intern | null>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showPresentDetails, setShowPresentDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [interns, tasks, attendance, meetingsList, documentsList] = await Promise.all([
          getInterns(),
          getTasks(),
          getAttendance(),
          getMeetings(),
          getDocuments(),
        ]);
        
        const currentIntern = interns.find((i: Intern) => i.name === user?.name || i.email === user?.email);
        const normalizedIntern = currentIntern
          ? { ...currentIntern, id: formattedInternId(currentIntern.id) }
          : null;
        setIntern(normalizedIntern);
        
        if (normalizedIntern) {
          setMyTasks(tasks.filter((t: any) => (t.assignedTo || []).includes(normalizedIntern.id) || t.group === normalizedIntern.group));
          setMyAttendance(attendance.filter((a: any) => a.internId === normalizedIntern.id));
          setDocuments(documentsList.filter((d: any) => (d.assignedTo || []).includes(normalizedIntern.id)));
          setMeetings(meetingsList.filter((m: any) => !m.group || m.group === normalizedIntern.group));
        } else {
          setMeetings(meetingsList);
          setDocuments([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const presentRecords = myAttendance.filter(a => a.status === 'present').sort((a, b) => b.date.localeCompare(a.date));
  const presentDays = presentRecords.length;
  const pendingTasks = myTasks.filter(t => t.status !== 'completed');
  const pendingTasksCount = pendingTasks.length;
  const upcomingMeetings = meetings
    .filter(m => {
      if (!intern) return false;
      return !m.group || m.group === intern.group;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {intern ? `${formattedInternId(intern.id)} - ` : ''}{user?.name}!</h1>
        <p className="text-muted-foreground mt-1">Your internship dashboard</p>
      </div>

      {intern && (
        <Card className="border border-gray-300 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Intern ID</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{formattedInternId(intern.id)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Period</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{intern.startDate} → {intern.endDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Department</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{intern.department}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Group</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{intern.group || '—'}</p>
              </div>
              <div className="flex items-end">
                <Badge variant={intern.status === 'active' ? 'default' : 'secondary'}>{intern.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          className="stat-card text-left"
          type="button"
          onClick={() => setShowPresentDetails(prev => !prev)}
        >
          <CalendarDays className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{presentDays}</p>
          <p className="text-sm text-muted-foreground">Days Present</p>
          <p className="text-xs text-muted-foreground mt-1">
            {showPresentDetails ? 'Hide present day details' : 'Click to view present days'}
          </p>
        </button>
        <div className="stat-card">
          <ClipboardList className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingTasksCount}</p>
          <p className="text-sm text-muted-foreground">Pending Tasks</p>
        </div>
        <div className="stat-card">
          <Video className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">{upcomingMeetings.length}</p>
          <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
        </div>
      </div>

      {showPresentDetails && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Present Days</CardTitle></CardHeader>
          <CardContent>
            {presentRecords.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No present days yet.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {presentRecords.map((a: any) => (
                  <li key={a.id}>{a.date} {a.checkIn ? `- checked in at ${a.checkIn}` : ''}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Pending Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {pendingTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No pending tasks.</p>
          ) : pendingTasks.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">Due: {t.dueDate}</p>
              </div>
              <Badge variant={t.status === 'completed' ? 'outline' : t.status === 'in-progress' ? 'default' : 'secondary'}>{t.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Upcoming Meetings</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {upcomingMeetings.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No upcoming meetings.</p>
          ) : upcomingMeetings.map(m => (
            <div key={m.id} className="p-3 rounded-lg bg-muted/40">
              <p className="text-sm font-medium text-foreground">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.date} {m.time} {m.link ? `• Join: ${m.link}` : ''}</p>
              {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Documents</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No documents shared yet.</p>
          ) : documents.map(d => (
            <div key={d.id} className="p-3 rounded-lg bg-muted/40">
              <p className="text-sm font-medium text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.type} • {d.size} • {d.uploadedAt}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">My Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {myTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No tasks assigned</p>
          ) : myTasks.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">Due: {t.dueDate}</p>
              </div>
              <Badge variant={t.status === 'completed' ? 'outline' : t.status === 'in-progress' ? 'default' : 'secondary'}>{t.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InternDashboard;
