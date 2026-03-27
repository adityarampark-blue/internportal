import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockAttendance } from '@/data/mockData';
import { Attendance } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { CalendarDays } from 'lucide-react';

const InternAttendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<Attendance[]>(mockAttendance.filter(a => a.internId === user?.id).map(a => ({...a, status: a.status === 'late' ? 'present' : a.status})));
  const today = new Date().toISOString().split('T')[0];
  const markedToday = records.some(r => r.date === today);

  const markAttendance = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const record: Attendance = {
      id: Date.now().toString(), internId: user?.id || '', date: today,
      status: 'present', checkIn: time,
    };
    setRecords(prev => [...prev, record]);
    toast.success(`Attendance marked: Present at ${time}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Your attendance records</p>
        </div>
        <Button onClick={markAttendance} disabled={markedToday}>
          <CalendarDays className="w-4 h-4 mr-2" />
          {markedToday ? 'Already Marked Today' : 'Mark Attendance'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No records yet</TableCell></TableRow>
                ) : records.sort((a, b) => b.date.localeCompare(a.date)).map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{r.date}</TableCell>
                    <TableCell><Badge variant={r.status === 'present' ? 'default' : 'destructive'}>{r.status === 'present' ? 'present' : 'absent'}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{r.checkIn || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternAttendance;
