import React, { useEffect, useState } from 'react';
import { getPending, approveUser, rejectUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const PendingApprovals = () => {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => { (async () => { try { const p = await getPending(); setPending(p); } catch (err:any) { toast.error('Could not load pending users'); } })(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveUser(id);
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
                <div className="flex gap-2">
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
