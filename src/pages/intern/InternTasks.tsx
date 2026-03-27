import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockTasks, mockInterns } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

const InternTasks = () => {
  const { user } = useAuth();
  const intern = mockInterns.find(i => i.id === user?.id);
  const myTasks = mockTasks.filter(t => t.assignedTo.includes(user?.id || '') || (intern?.group && t.group === intern.group));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="text-muted-foreground mt-1">{myTasks.length} tasks assigned</p>
      </div>

      {myTasks.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />No tasks assigned yet</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {myTasks.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{t.title}</p>
                      <Badge variant={t.priority === 'high' ? 'destructive' : t.priority === 'medium' ? 'default' : 'secondary'}>{t.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Due: {t.dueDate}</span>
                      {t.group && <span>Group: {t.group}</span>}
                    </div>
                  </div>
                  <Badge variant={t.status === 'completed' ? 'outline' : t.status === 'in-progress' ? 'default' : 'secondary'}>{t.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InternTasks;
