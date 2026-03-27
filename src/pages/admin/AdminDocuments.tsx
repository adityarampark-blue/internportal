import React, { useEffect, useState } from 'react';
import { getDocuments, createDocument, getInterns } from '@/lib/api';
import { Document, Intern } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FileText, Upload } from 'lucide-react';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', group: '', assignedTo: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAdd = async () => {
    const name = selectedFile ? selectedFile.name : form.name;
    if (!name) { toast.error('Document name required'); return; }

    try {
      const groupAssignees = form.group ? interns.filter(i => i.group === form.group).map(i => i.id) : [];
      const manualAssignees = form.assignedTo ? form.assignedTo.split(',').map(s => s.trim()) : [];
      const assignedTo = Array.from(new Set([...groupAssignees, ...manualAssignees].filter(Boolean)));

      const payload = {
        id: Date.now().toString(),
        name,
        type: selectedFile ? selectedFile.type || name.split('.').pop() || 'file' : (name.split('.').pop() || 'file'),
        size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : '1.0 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        assignedTo,
        category: form.category,
      };

      const created = await createDocument(payload);
      setDocuments(prev => [...prev, created]);
      setDialogOpen(false);
      setForm({ name: '', category: '', group: '', assignedTo: '' });
      setSelectedFile(null);
      toast.success('Document uploaded');
    } catch (err:any) {
      toast.error(err?.message || 'Upload failed');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [d, i] = await Promise.all([getDocuments(), getInterns()]);
        setDocuments(d);
        setInterns(i);
        setGroups(Array.from(new Set(i.map((intern: Intern) => intern.group).filter(Boolean))));
      } catch (err:any) {
        toast.error('Could not load documents');
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">{documents.length} documents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Upload className="w-4 h-4 mr-2" />Upload Document</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Select Document File *</Label>
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      if (file && !form.name) {
                        setForm(p => ({ ...p, name: file.name }));
                      }
                    }}
                  />
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                    {selectedFile ? (
                      <>
                        <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2"><Label>Document Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Guide.pdf" /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Engineering" /></div>
              <div className="space-y-2"><Label>Group (optional)</Label>
                <Select value={form.group} onValueChange={v => setForm(p => ({ ...p, group: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    {groups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Assign to intern IDs</Label><Input value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} placeholder="e.g. IN001, IN002" /></div>
              <Button onClick={handleAdd}>Upload</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {documents.map(doc => (
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
              {doc.assignedTo.length > 0 && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Assigned: {doc.assignedTo.map(id => interns.find(i => i.id === id)?.name || id).join(', ')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
};

export default AdminDocuments;
