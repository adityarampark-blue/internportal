import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDocuments, mockInterns } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const InternDocuments = () => {
  const { user } = useAuth();
  const docs = mockDocuments.filter(d => d.assignedTo.length === 0 || d.assignedTo.includes(user?.id || ''));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground mt-1">Documents shared with you</p>
      </div>

      {docs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />No documents available</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {docs.map(doc => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{doc.name}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{doc.size}</span>
                    <span>{doc.category}</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InternDocuments;
