import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInterns, getTasks, getAttendance, getMeetings, getUpdates } from '@/lib/api';
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
  const [updates, setUpdates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'tasks' | 'meetings' | 'documents' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [interns, tasks, attendance, meetingsList, documentsList] = await Promise.all([
          getInterns(),
          getTasks(),
          getAttendance(),
          getMeetings(),
          getUpdates().catch(() => []),
        ]);
        
        const currentIntern = interns.find((i: Intern) => i.name === user?.name || i.email === user?.email);
        const normalizedIntern = currentIntern
          ? { ...currentIntern, id: formattedInternId(currentIntern.id) }
          : null;
        setIntern(normalizedIntern);
        
        if (normalizedIntern) {
          setMyTasks(tasks.filter((t: any) => (t.assignedTo || []).includes(normalizedIntern.id) || t.group === normalizedIntern.group));
          setMyAttendance(attendance.filter((a: any) => a.internId === normalizedIntern.id));
          setUpdates(documentsList.filter((u: any) => u.internId === normalizedIntern.id));
          setMeetings(meetingsList.filter((m: any) => !m.group || m.group === normalizedIntern.group));
        } else {
          setMeetings(meetingsList);
          setUpdates([]);
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          className={`stat-card text-left transition-colors ${activeTab === 'attendance' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
          type="button"
          onClick={() => setActiveTab(prev => prev === 'attendance' ? null : 'attendance')}
        >
          <CalendarDays className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{presentDays}</p>
          <p className="text-sm text-muted-foreground">Days Present</p>
        </button>
        <button
          className={`stat-card text-left transition-colors ${activeTab === 'tasks' ? 'ring-2 ring-warning bg-warning/5' : ''}`}
          type="button"
          onClick={() => setActiveTab(prev => prev === 'tasks' ? null : 'tasks')}
        >
          <ClipboardList className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingTasksCount}</p>
          <p className="text-sm text-muted-foreground">Pending Tasks</p>
        </button>
        <button
          className={`stat-card text-left transition-colors ${activeTab === 'meetings' ? 'ring-2 ring-info bg-info/5' : ''}`}
          type="button"
          onClick={() => setActiveTab(prev => prev === 'meetings' ? null : 'meetings')}
        >
          <Video className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold text-foreground">{upcomingMeetings.length}</p>
          <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
        </button>
        <button
          className={`stat-card text-left transition-colors ${activeTab === 'updates' ? 'ring-2 ring-emerald-500 bg-emerald-500/5' : ''}`}
          type="button"
          onClick={() => setActiveTab(prev => prev === 'updates' ? null : 'updates')}
        >
          <ClipboardList className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{updates.length}</p>
          <p className="text-sm text-muted-foreground">Daily Updates</p>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'attendance' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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

        {activeTab === 'tasks' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader><CardTitle className="text-lg">My Tasks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {myTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No tasks assigned.</p>
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
        )}

        {activeTab === 'meetings' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        )}

        {activeTab === 'updates' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader><CardTitle className="text-lg">Daily Updates</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {updates.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No daily updates yet.</p>
              ) : updates.map((u: any) => (
                <div key={u.id} className="p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{u.date}</span>
                    <span className="text-xs text-muted-foreground">· {u.hoursWorked}h</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{u.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InternDashboard;
