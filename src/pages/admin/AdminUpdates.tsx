import React, { useEffect, useState } from 'react';
import { getUpdates, getInterns } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const AdminUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);

  useEffect(() => { (async () => { try { const [u, i] = await Promise.all([getUpdates(), getInterns()]); setUpdates(u); setInterns(i); } catch (err:any) { } })(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Daily Updates</h1>
        <p className="text-muted-foreground mt-1">Work updates submitted by interns</p>
      </div>

      {updates.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />No updates yet</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {updates.map(u => {
            const intern = interns.find((it:any) => it.id === u.internId);
            return (
              <Card key={u.id}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {intern?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{intern?.name}</p>
                      <span className="text-xs text-muted-foreground">{u.date}</span>
                      <span className="text-xs text-muted-foreground">· {u.hoursWorked}h worked</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{u.content}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminUpdates;
