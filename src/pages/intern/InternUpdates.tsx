import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDailyUpdates } from '@/data/mockData';
import { DailyUpdate } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Clock, Send } from 'lucide-react';

const InternUpdates = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<DailyUpdate[]>(mockDailyUpdates.filter(u => u.internId === user?.id));
  const [content, setContent] = useState('');
  const [hours, setHours] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const submittedToday = updates.some(u => u.date === today);

  const handleSubmit = () => {
    if (!content.trim()) { toast.error('Please describe your work'); return; }
    const update: DailyUpdate = {
      id: Date.now().toString(), internId: user?.id || '', date: today,
      content: content.trim(), hoursWorked: parseFloat(hours) || 0,
    };
    setUpdates(prev => [update, ...prev]);
    setContent(''); setHours('');
    toast.success('Daily update submitted');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Daily Updates</h1>
        <p className="text-muted-foreground mt-1">Submit your daily work progress</p>
      </div>

      {!submittedToday && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Submit Today's Update</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>What did you work on today? *</Label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} rows={3} placeholder="Describe your tasks and progress..." />
            </div>
            <div className="space-y-2 max-w-[200px]">
              <Label>Hours Worked</Label>
              <Input type="number" min="0" max="12" step="0.5" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 8" />
            </div>
            <Button onClick={handleSubmit}><Send className="w-4 h-4 mr-2" />Submit Update</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Previous Updates</h2>
        {updates.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground"><Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />No updates yet</CardContent></Card>
        ) : updates.map(u => (
          <Card key={u.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">{u.date}</span>
                <span className="text-xs text-muted-foreground">· {u.hoursWorked}h</span>
              </div>
              <p className="text-sm text-muted-foreground">{u.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InternUpdates;
