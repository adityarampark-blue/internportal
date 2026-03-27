import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInterns, getTasks, getAttendance, getMeetings } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ClipboardList, Video } from 'lucide-react';
import { Intern } from '@/data/types';

const formattedInternId = (id?: string) => {
  if (!id) return '';
  if (id.toUpperCase().startsWith('IN')) return id.toUpperCase();
  const numeric = parseInt(id.replace(/\D/g, ''), 10);
  if (!Number.isNaN(numeric)) return `IN${String(numeric).padStart(3, '0')}`;
  return id;
};

const InternDashboard = () => {
  const { user } = useAuth();
  const [intern, setIntern] = useState<Intern | null>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [interns, tasks, attendance, meetingsList] = await Promise.all([
          getInterns(),
          getTasks(),
          getAttendance(),
          getMeetings(),
        ]);
        
        const currentIntern = interns.find((i: Intern) => i.name === user?.name || i.email === user?.email);
        const normalizedIntern = currentIntern
          ? { ...currentIntern, id: formattedInternId(currentIntern.id) }
          : null;
        setIntern(normalizedIntern);
        
        if (normalizedIntern) {
          setMyTasks(tasks.filter((t: any) => t.assignedTo.includes(normalizedIntern.id) || t.group === normalizedIntern.group));
          setMyAttendance(attendance.filter((a: any) => a.internId === normalizedIntern.id));
        }
        setMeetings(meetingsList);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const presentDays = myAttendance.filter(a => a.status === 'present').length;
  const pendingTasks = myTasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}!</h1>
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
        <div className="stat-card">
          <CalendarDays className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{presentDays}</p>
          <p className="text-sm text-muted-foreground">Days Present</p>
        </div>
        <div className="stat-card">
          <ClipboardList className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingTasks}</p>
          <p className="text-sm text-muted-foreground">Pending Tasks</p>
        </div>
        <div className="stat-card">
          <Video className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">{meetings.length}</p>
          <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
        </div>
      </div>

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
