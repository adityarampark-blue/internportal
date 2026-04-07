import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, ClipboardList, CalendarDays, RefreshCw, Layers, Clock, Check, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInterns, getAttendance } from '@/lib/api';
import { getPending, approveUser } from '@/lib/auth';
import { toast } from 'sonner';
import { Intern } from '@/data/types';

const formatInternId = (id: string | undefined) => {
  if (!id) return '';
  if (id.startsWith('IN00')) return id;
  if (/^\d+$/.test(id)) return `IN00${id}`;
  if (id.startsWith('IN')) {
    const raw = id.substring(2);
    if (/^\d+$/.test(raw) && raw.length < 3) return `IN00${parseInt(raw, 10)}`;
  }
  return id;
};

const AdminDashboard = () => {
  type AttendanceRecord = { id: string; internId: string; date: string; status: 'present' | 'absent'; checkIn?: string };
  type Activity = { message: string; time: string };
  const [interns, setInterns] = useState<Intern[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [latestActivities, setLatestActivities] = useState<Activity[]>([]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  type PendingUser = { id: string; email: string; name: string; role: string; approved: boolean };
  type LoadAttendance = { id: string; internId: string; date: string; status: string; checkIn?: string };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadInterns, loadAttendance, pending] = await Promise.all<[Intern[], LoadAttendance[], PendingUser[]]>([
        getInterns(),
        getAttendance(),
        getPending(),
      ]);
      const normalizedInterns = loadInterns.map((intern, idx) => ({ ...intern }));
      setInterns(normalizedInterns || []);
      setAttendance((loadAttendance || []).map(a => ({ ...a, status: a.status === 'late' ? 'present' : a.status })));
      setPendingCount((pending || []).length);
      setPendingUsers(pending || []);

      if (normalizedInterns.length > 0) {
        const latest = normalizedInterns[0];
        setLatestActivities([{ message: `New intern: ${latest.id}`, time: 'Latest' }]);
      } else {
        setLatestActivities([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('AdminDashboard failed to load data', err.message);
      } else {
        console.error('AdminDashboard failed to load data', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadData();
    const timer = window.setInterval(loadData, 30000);
    return () => window.clearInterval(timer);
  }, [loadData]);

  const today = new Date().toISOString().split('T')[0];
  const groups = useMemo(() => new Set(interns.filter(i => !!i.group).map(i => i.group)).size, [interns]);
  const totalInterns = interns.length;
  const activeInterns = interns.filter(i => i.status === 'active').length;
  const presentToday = attendance.filter(a => a.date === today && a.status === 'present').length;

  const internsInPeriod = useMemo(() => {
    if (!startDate || !endDate) return [];
    return interns.filter(i => i.startDate <= endDate && i.endDate >= startDate);
  }, [interns, startDate, endDate]);

  const periodGroups = useMemo(() => new Set(internsInPeriod.filter(i => !!i.group).map(i => i.group)).size, [internsInPeriod]);



  const stats = [
    { label: 'Total Interns', value: totalInterns, icon: <Users className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Active Interns', value: activeInterns, icon: <TrendingUp className="w-5 h-5" />, color: 'text-success' },
    { label: 'Groups', value: groups, icon: <Layers className="w-5 h-5" />, color: 'text-warning' },
    { label: 'Pending Approvals', value: pendingCount, icon: <ClipboardList className="w-5 h-5" />, color: 'text-destructive' },
    { label: 'Present Today', value: presentToday, icon: <CalendarDays className="w-5 h-5" />, color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your internship program</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={() => setSelectedStat(s.label)}
            className="stat-card text-left hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      {selectedStat && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selectedStat} details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStat === 'Total Interns' && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-blue-600 bg-blue-50 p-2 rounded">📋 All Interns ({totalInterns})</p>
                <div className="space-y-1 text-sm">
                  {(interns.length > 0 ? interns : []).slice(0, 10).map(i => (
                    <p key={i.id} className="text-xs text-foreground">{formatInternId(i.id)} - {i.name} · {i.email}</p>
                  ))}
                  {interns.length > 10 && <p className="text-xs text-muted-foreground">{interns.length - 10} more interns not shown.</p>}
                </div>
              </div>
            )}
            {selectedStat === 'Active Interns' && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-green-600 bg-green-50 p-2 rounded">✓ Active Interns ({activeInterns})</p>
                <div className="space-y-1 text-sm">
                  {interns.filter(i => i.status === 'active').slice(0, 10).map(i => (
                    <p key={i.id} className="text-xs text-foreground">{formatInternId(i.id)} - {i.name} · {i.email} · {i.group || 'No group'}</p>
                  ))}
                  {interns.filter(i => i.status === 'active').length > 10 && <p className="text-xs text-muted-foreground">{interns.filter(i => i.status === 'active').length - 10} more active interns not shown.</p>}
                </div>
              </div>
            )}
            {selectedStat === 'Groups' && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-amber-600 bg-amber-50 p-2 rounded">👥 Groups ({groups})</p>
                {[...new Set(interns.filter(i => !!i.group).map(i => i.group))].map(group => {
                  const groupInterns = interns.filter(i => i.group === group);
                  return (
                    <details key={group} className="border border-gray-200 rounded-lg bg-gray-50">
                      <summary className="cursor-pointer px-3 py-2 font-semibold bg-gray-200 text-gray-800">{group} ({groupInterns.length})</summary>
                      <div className="p-3 space-y-1">
                        {groupInterns.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No interns in this group</p>
                        ) : groupInterns.map(i => (
                          <p key={i.id} className="text-xs text-foreground">{formatInternId(i.id)} - {i.name} · {i.email}</p>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
            {selectedStat === 'Pending Approvals' && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-yellow-700 bg-yellow-100 p-2 rounded">⏳ Pending Approvals ({pendingCount})</p>
                {pendingUsers.length === 0 ? (
                  <p className="text-sm text-green-600 font-semibold">✓ All users approved!</p>
                ) : (
                  <div className="space-y-2">
                    {pendingUsers.map(u => (
                      <div key={u.id} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm font-semibold text-foreground">{formatInternId(u.id)} - {u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email} · {u.role}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedStat === 'Present Today' && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-blue-600 bg-blue-50 p-2 rounded">📅 Present Today ({presentToday})</p>
                {presentToday === 0 ? (
                  <p className="text-sm">No one present today</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attendance.filter(a => a.date === today && a.status === 'present').map(a => {
                      const intern = interns.find(i => i.id === a.internId);
                      return (
                        <div key={a.id} className="p-3 rounded-lg bg-green-50 border border-green-100">
                          <p className="text-sm font-semibold">{formatInternId(intern?.id || a.internId)} - {intern?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{intern?.email || ''}</p>
                          <p className="text-xs">Checked in: {a.checkIn || '—'}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Intern period snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700 flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                From
              </label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input input-bordered border-purple-300 focus:border-purple-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700 flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                To
              </label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input input-bordered border-purple-300 focus:border-purple-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700">Selected interns</label>
              <p className="font-semibold text-lg text-purple-800">{internsInPeriod.length}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700">Groups in period</label>
              <p className="font-semibold text-lg text-purple-800">{periodGroups}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {internsInPeriod.slice(0, 9).map(i => (
              <div key={i.id} className="p-4 rounded-lg bg-white border border-purple-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">{formatInternId(i.id)}</span>
                </div>
                <p className="text-sm font-semibold">{formatInternId(i.id)} - {i.name}</p>
                <p className="text-xs text-muted-foreground">{i.email}</p>
                <Badge variant="secondary" className="mt-1">{i.group || 'No group'}</Badge>
              </div>
            ))}
            {internsInPeriod.length === 0 && <p className="text-muted-foreground col-span-full">No interns found for selected period</p>}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="px-4 py-2 rounded-lg bg-muted/40 text-xs text-muted-foreground">Refreshing dashboard automatically...</div>
      )}

      <Card className="w-full">
        <CardHeader className="flex items-center gap-2 px-6 py-4">
          <CardTitle className="text-lg m-0 text-left">Latest activity</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {latestActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity found</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {latestActivities.map((activity, idx) => (
                <li key={idx} className="flex items-center justify-start gap-2 text-muted-foreground">
                  <span className="font-medium text-foreground">{activity.message}</span>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
