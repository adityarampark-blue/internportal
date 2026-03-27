import React, { useEffect, useState } from 'react';
import { getAttendance, getInterns } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AdminAttendanceRecord = { id: string; internId: string; date?: string; status: 'present' | 'absent' | string; checkIn?: string };

type InternInfo = { id: string; name: string };

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState<AdminAttendanceRecord[]>([]);
  const [interns, setInterns] = useState<InternInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const statusVariant = (s: string) => s === 'present' ? 'default' : 'destructive';

  useEffect(() => {
    (async () => {
      try {
        const [a, i] = await Promise.all([getAttendance(), getInterns()]);
        setAttendance((a as AdminAttendanceRecord[]).map(item => ({ ...item, status: item.status === 'late' ? 'present' : item.status })));
        setInterns(i as InternInfo[]);
      } catch (err) {
        if (err instanceof Error) {
          console.error('Failed to load attendance', err.message);
        } else {
          console.error('Failed to load attendance', err);
        }
      }
    })();
  }, []);

  const downloadAttendance = () => {
    const filtered = attendance.filter(a => a.date === selectedDate);
    const csv = ['Intern ID,Name,Date,Status,Check In']
      .concat(filtered.map(a => {
        const intern = interns.find(i => i.id === a.internId);
        return `${a.internId},${intern?.name || 'Unknown'},${a.date},${a.status},${a.checkIn || ''}`;
      }))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor intern attendance records</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground" htmlFor="attendanceDate">Select date</label>
            <Input id="attendanceDate" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <Button onClick={downloadAttendance}>Download CSV</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No attendance records</TableCell></TableRow>
                ) : attendance.map(a => {
                  const intern = interns.find(i => i.id === a.internId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-foreground">{a.internId} - {intern?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-muted-foreground">{a.date}</TableCell>
                      <TableCell><Badge variant={statusVariant(a.status)}>{a.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{a.checkIn || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendance;
