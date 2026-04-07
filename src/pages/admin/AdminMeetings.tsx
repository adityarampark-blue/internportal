import React, { useEffect, useState } from 'react';
import { getMeetings, createMeeting, getInterns } from '@/lib/api';
import { Meeting, Intern } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Video, ExternalLink } from 'lucide-react';

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', link: '', description: '', group: '' });

  const handleAdd = async () => {
    if (!form.title || !form.date) { toast.error('Title and date required'); return; }

    let link = form.link.trim();
    if (!link) {
      link = `https://meet.google.com/${Math.random().toString(36).substring(2, 11)}`;
    }
    if (link.includes('localhost')) {
      link = link.replace(/https?:\/\/localhost(:\d+)?/, 'https://meet.google.com');
    }
    if (!link.includes('meet.google.com')) {
      link = `https://meet.google.com/${Math.random().toString(36).substring(2, 11)}`;
    }

    try {
      const payload = { id: Date.now().toString(), ...form, link, group: form.group === 'all' ? '' : form.group };
      const created = await createMeeting(payload);
      setMeetings(prev => [...prev, created]);
      setDialogOpen(false);
      setForm({ title: '', date: '', time: '', link: '', description: '', group: '' });
      toast.success('Meeting added');
    } catch (err:any) { toast.error(err?.message || 'Create failed'); }
  };

  useEffect(() => { 
    (async () => { 
      try { 
        const [m, i] = await Promise.all([getMeetings(), getInterns()]);
        setMeetings(m); 
        setInterns(i);
        setGroups(Array.from(new Set(i.map(intern => intern.group).filter(Boolean))));
      } catch (err:any) { toast.error('Could not load data'); } 
    })(); 
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground mt-1">{meetings.length} scheduled</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Meeting</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meetings.map(m => {
        let safeLink = m.link;
        if (safeLink.includes('localhost')) {
          safeLink = safeLink.replace(/https?:\/\/localhost(:\d+)?/, 'https://meet.google.com');
        }
        if (!safeLink.includes('meet.google.com')) {
          safeLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 11)}`;
        }
        return (
          <Card key={m.id} className="border border-primary/20 bg-primary/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.date} at {m.time}</p>
                  <p className="text-xs text-muted-foreground">Group: {m.group || 'General'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <a href={safeLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                Join Meeting <ExternalLink className="w-3 h-3" />
              </a>
            </CardContent>
          </Card>
        );
      })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Meeting</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Time</Label><Input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 10:00 AM" /></div>
            </div>
            <div className="space-y-2"><Label>Meeting Link *</Label><Input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Group</Label>
              <Select value={form.group} onValueChange={v => setForm(p => ({ ...p, group: v }))}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <Button onClick={handleAdd}>Add Meeting</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMeetings;
