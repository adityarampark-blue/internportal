import React, { useEffect, useState } from 'react';
import { getPending, approveUser, rejectUser } from '@/lib/auth';
import { getInterns } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const PendingApprovals = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<{ [key: string]: string }>({});
  const [newGroups, setNewGroups] = useState<{ [key: string]: string }>({});

  const groups = Array.from(new Set(interns.map(i => i.group).filter(g => g))).sort();

  useEffect(() => { 
    (async () => { 
      try { 
        const [p, i] = await Promise.all([getPending(), getInterns()]);
        setPending(p); 
        setInterns(i);
      } catch (err:any) { 
        toast.error('Could not load data'); 
      } 
    })(); 
  }, []);

  const handleApprove = async (id: string) => {
    const group = selectedGroups[id] === 'new' ? newGroups[id] || '' : selectedGroups[id] || '';
    try {
      await approveUser(id, group);
      setPending(prev => prev.filter(p => p.id !== id));
      toast.success('User approved');
    } catch (err) {
      if (err instanceof Error) toast.error(err.message || 'Approve failed');
      else toast.error('Approve failed');
    }
  };

  const handleReject = async (id: string) => {
    // immediate UI removal to avoid user staying visible on click
    setPending(prev => prev.filter(p => p.id !== id));
    try {
      await rejectUser(id);
      toast.success('User rejected');
    } catch (err) {
      toast.error('Reject failed');
      // If the backend fails, re-add user to list (if still in state from fetch most recent)
      // A robust implementation would re-fetch pending list.
      const p = await getPending().catch(() => []);
      setPending(p);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Intern Approvals</h1>
        <p className="text-muted-foreground mt-1">Approve new intern registrations</p>
      </div>

      {pending.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No pending registrations</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {pending.map(u => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col gap-1">
                    <Select value={selectedGroups[u.id] || ''} onValueChange={(value) => setSelectedGroups(prev => ({ ...prev, [u.id]: value }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        <SelectItem value="new">New Group</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedGroups[u.id] === 'new' && (
                      <Input 
                        placeholder="Enter new group name" 
                        value={newGroups[u.id] || ''} 
                        onChange={e => setNewGroups(prev => ({ ...prev, [u.id]: e.target.value }))} 
                        className="w-32"
                      />
                    )}
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(u.id)}>
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(u.id)}>
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
