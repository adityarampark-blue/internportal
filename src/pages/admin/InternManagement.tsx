import React, { useEffect, useState } from 'react';
import { getInterns, createIntern, updateIntern, deleteIntern } from '@/lib/api';
import { getPending } from '@/lib/auth';
import { Intern } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const emptyIntern: Intern = {
  id: '', name: '', email: '', phone: '', department: '', startDate: '', endDate: '', status: 'active', avatar: '', group: '',
};

const formatInternId = (id: string) => id || '';

const nextInternId = (interns: Intern[]) => {
  const ids = interns.flatMap(i => {
    const formattedMatch = i.id.match(/^I[NB](\d+)$/i);
    const numeric = Number(i.id);
    const values: number[] = [];
    if (formattedMatch) values.push(Number(formattedMatch[1]));
    if (!Number.isNaN(numeric)) values.push(numeric);
    return values;
  });

  const maxValue = ids.length > 0 ? Math.max(...ids) : 0;
  return `IN${String(maxValue + 1).padStart(3, '0')}`;
};

const InternManagement = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Intern | null>(null);
  const [form, setForm] = useState<Intern>(emptyIntern);
  const [durationMonths, setDurationMonths] = useState<number>(0);
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInternId, setDeleteInternId] = useState<string | null>(null);

  const getDurationMonths = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.max(0, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth());
  };

  const addMonthsToDate = (dateStr: string, months: number) => {
    if (!dateStr) return dateStr;
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const filtered = interns.filter(i => {
    const formattedId = formatInternId(i.id).toLowerCase();
    const query = search.toLowerCase();
    return (
      i.id.toLowerCase().includes(query) ||
      formattedId.includes(query) ||
      i.name.toLowerCase().includes(query) ||
      i.department.toLowerCase().includes(query) ||
      i.email.toLowerCase().includes(query)
    );
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ 
      ...emptyIntern
      // id is now auto-generated, so don't set it
    });
    setDurationMonths(0);
    setIsCustomGroup(false);
    setDialogOpen(true);
  };

  const openEdit = (intern: Intern) => {
    setEditing(intern);
    setForm(intern);
    setDurationMonths(getDurationMonths(intern.startDate, intern.endDate));
    setIsCustomGroup(intern.group !== '' && !groups.includes(intern.group));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    (async () => {
      try {
        // duplicate email guard (ID is now auto-generated)
        const existingByEmail = interns.some(i => i.email === form.email && (!editing || i.id !== editing.id));
        if (existingByEmail) {
          toast.error('Intern email already assigned');
          return;
        }

        const payloadData = { ...form };

        // if duration selected, set endDate accordingly
        if (durationMonths > 0 && form.startDate) {
          payloadData.endDate = addMonthsToDate(form.startDate, durationMonths);
        }

        if (editing) {
          const updated = await updateIntern(editing.id, payloadData);
          setInterns(prev => prev.map(i => i.id === editing.id ? updated : i));
          toast.success('Intern updated');
        } else {
          // Remove id from payload since it's auto-generated
          const { id, ...payload } = payloadData;
          const created = await createIntern(payload);
          setInterns(prev => [...prev, created]);
          toast.success('Intern added');
        }

        if (payloadData.group && !groups.includes(payloadData.group)) {
          setGroups(prev => [...prev, payloadData.group]);
        }

        setDialogOpen(false);
      } catch (err: any) {
        toast.error(err?.message || 'Save failed');
      }
    })();
  };

  const handleDelete = (id: string) => {
    setDeleteInternId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteInternId) return;
    (async () => {
      try {
        console.log('Attempting to delete intern with ID:', deleteInternId);
        await deleteIntern(deleteInternId);
        setInterns(prev => prev.filter(i => i.id !== deleteInternId));
        toast.success('Intern removed');
      } catch (err: any) {
        console.error('Delete error:', err);
        // in case deferred sync issue, try refresh list
        try {
          const fresh = await getInterns();
          setInterns(fresh);
        } catch {
          // ignore
        }
        toast.error(err?.message || 'Delete failed');
      } finally {
        setDeleteConfirmOpen(false);
        setDeleteInternId(null);
      }
    })();
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'startDate' && durationMonths > 0) {
        next.endDate = addMonthsToDate(value, durationMonths);
      }
      return next;
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const [data, pending] = await Promise.all([getInterns(), getPending()]);
        const normalized = data.map((intern, idx) => ({ ...intern }));
        const deduped: Intern[] = [];
        const seen = new Set<string>();
        normalized.forEach(intern => {
          if (seen.has(intern.id)) return;
          seen.add(intern.id);
          deduped.push(intern);
        });
        if (deduped.length !== normalized.length) {
          toast.success('Duplicate intern entries removed by ID (kept first occurrence)');
        }
        setInterns(deduped);
        setGroups(Array.from(new Set(deduped.map(intern => intern.group).filter(Boolean))));
        setPendingUsers(pending || []);
      } catch (err: any) {
        toast.error('Could not load interns');
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intern Management</h1>
          <p className="text-muted-foreground mt-1">{interns.length} interns total</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Intern</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by ID, name, department, or email" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                      <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No interns found</TableCell></TableRow>
                ) : filtered.map(intern => (
                  <TableRow key={intern.id}>
                    <TableCell className="text-muted-foreground">{formatInternId(intern.id)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{intern.name}</p>
                        <p className="text-xs text-muted-foreground">{intern.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{intern.department}</TableCell>
                    <TableCell className="text-muted-foreground">{intern.group || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {intern.startDate} → {intern.endDate} ({getDurationMonths(intern.startDate, intern.endDate)} mo)
                    </TableCell>
                    <TableCell>
                      <Badge variant={intern.status === 'active' ? 'default' : 'secondary'}>
                        {intern.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(intern)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(intern.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intern?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this intern? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Intern' : 'Add New Intern'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[75vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Intern ID *</Label>
              <Input value={editing ? formatInternId(form.id) : nextInternId(interns)} onChange={e => updateField('id', e.target.value)} placeholder="Auto-generated ID" disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone No.</Label>
                <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={form.department} onChange={e => updateField('department', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={e => updateField('startDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" value={form.endDate} onChange={e => updateField('endDate', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Group</Label>
                <Select value={isCustomGroup ? '__new' : (form.group || 'none')} onValueChange={v => {
                  if (v === '__new') {
                    setIsCustomGroup(true);
                    updateField('group', '');
                  } else {
                    setIsCustomGroup(false);
                    updateField('group', v === 'none' ? '' : v);
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Select a group --</SelectItem>
                    {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    <SelectItem value="__new">+ Create new group</SelectItem>
                  </SelectContent>
                </Select>
                {isCustomGroup && (
                  <Input placeholder="New group name" value={form.group} onChange={e => updateField('group', e.target.value)} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Select value={durationMonths ? String(durationMonths) : 'none'} onValueChange={v => {
                  const months = v === 'none' ? 0 : Number(v);
                  setDurationMonths(months);
                  if (form.startDate) {
                    updateField('endDate', months ? addMonthsToDate(form.startDate, months) : form.endDate);
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="2">2 months</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">1 year</SelectItem>
                    <SelectItem value="24">2 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.group && !isCustomGroup && (
              <div className="space-y-2">
                <Label>Current members in this group</Label>
                <div className="border rounded-lg p-3 bg-muted/50 max-h-40 overflow-y-auto">
                  {interns.filter(i => i.group === form.group).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members in this group yet</p>
                  ) : (
                    <div className="space-y-1">
                      {interns.filter(i => i.group === form.group).map(intern => (
                        <div key={intern.id} className="text-sm p-2 hover:bg-accent rounded">
                          <span className="font-medium">{intern.name}</span>
                          <span className="text-muted-foreground ml-2">({intern.email})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => updateField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="mt-2">{editing ? 'Update' : 'Add'} Intern</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternManagement;
