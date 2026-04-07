import React, { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, getInterns } from '@/lib/api';
import { Task } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, ClipboardList } from 'lucide-react';

const AdminTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' as Task['priority'], group: '', assignedTo: '' });
  const [interns, setInterns] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [t, i] = await Promise.all([getTasks(), getInterns()]);
        setTasks(t);
        setInterns(i);
        setGroups(Array.from(new Set(i.map((intern: any) => intern.group).filter(Boolean))));
      } catch (err: any) {
        toast.error('Failed to load tasks');
      }
    })();
  }, []);

  const handleAdd = () => {
    if (!form.title || !form.dueDate) { toast.error('Title and due date required'); return; }
    const groupAssignees = form.group === 'All' ? interns.map((i:any) => i.id) : form.group ? interns.filter((i:any) => i.group === form.group).map((i:any) => i.id) : [];
    const manualAssignees = form.assignedTo ? form.assignedTo.split(',').map(s => s.trim()) : [];
    const assignedTo = Array.from(new Set([...groupAssignees, ...manualAssignees].filter(Boolean)));

    const newTask: Task = {
      id: Date.now().toString(), title: form.title, description: form.description,
      dueDate: form.dueDate, priority: form.priority, status: 'pending',
      assignedTo,
      group: form.group === 'All' ? 'All' : form.group,
    };
    setTasks(prev => [...prev, newTask]);
    setDialogOpen(false);
    setForm({ title: '', description: '', dueDate: '', priority: 'medium', group: '', assignedTo: '' });
    toast.success('Task created');
  };

  const statusColors = { pending: 'secondary', 'in-progress': 'default', completed: 'outline' } as const;
  const priorityColors = { high: 'destructive', medium: 'default', low: 'secondary' } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground mt-1">{tasks.length} tasks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Due Date *</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as Task['priority'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Group (optional)</Label>
                <Select value={form.group} onValueChange={v => setForm(p => ({ ...p, group: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Groups</SelectItem>
                    {groups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Assign to intern IDs</Label><Input value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} placeholder="e.g. IN001, IN002" /></div>
              <Button onClick={handleAdd}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />No tasks yet</CardContent></Card>
        ) : tasks.map(task => (
          <Card key={task.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                  <Badge variant={statusColors[task.status]}>{task.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Due: {task.dueDate}</span>
                  {task.group && <span>Group: {task.group}</span>}
                  {task.assignedTo.length > 0 && ( 
                    <span>Assigned: {task.assignedTo.map(id => interns.find((i:any) => i.id === id)?.name || id).join(', ')}</span>
                  )}
                </div>
              </div>
              <Select value={task.status} onValueChange={async v => {
                try {
                  const updated = await updateTask(task.id, { ...task, status: v });
                  setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
                } catch (err: any) { toast.error('Update failed'); }
              }}>
                <SelectTrigger className="w-[140px] shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
};
export default AdminTasks;
