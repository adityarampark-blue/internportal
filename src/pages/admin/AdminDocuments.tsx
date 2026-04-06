// import React, { useEffect, useState } from 'react';
// import { API_BASE, getDocuments, createDocument, getInterns, deleteDocument } from '@/lib/api';
// import { Document, Intern } from '@/data/types';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent } from '@/components/ui/card';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
// import { toast } from 'sonner';
// import { Plus, FileText, Upload, Eye, Download, Trash2 } from 'lucide-react';

// const AdminDocuments = () => {
//   const [documents, setDocuments] = useState<Document[]>([]);
//   const [interns, setInterns] = useState<Intern[]>([]);
//   const [groups, setGroups] = useState<string[]>([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [form, setForm] = useState({ name: '', category: '', group: '', assignedTo: '' });
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const handleAdd = async () => {
//     if (!selectedFile) { 
//       toast.error('Please select a file to upload'); 
//       return; 
//     }

//     try {
//       const formData = new FormData();
//       formData.append('file', selectedFile);
//       formData.append('name', form.name || selectedFile.name);
//       formData.append('category', form.category);
//       formData.append('assignedTo', JSON.stringify(form.assignedTo ? form.assignedTo.split(',').map(s => s.trim()) : []));

//       const response = await fetch(`${API_BASE}/documents`, {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'Upload failed');
//       }

//       const created = await response.json();
//       setDocuments(prev => [...prev, created]);
//       setDialogOpen(false);
//       setForm({ name: '', category: '', group: '', assignedTo: '' });
//       setSelectedFile(null);
//       toast.success('Document uploaded');
//     } catch (err: any) {
//       console.error('Upload error:', err);
//       toast.error(err?.message || 'Upload failed');
//     }
//   };

//   const handleViewDocument = (doc: Document) => {
//     try {
//       window.open(`${API_BASE}/documents/${doc.id}/view`, '_blank');
//       toast.success(`Opening ${doc.name}`);
//     } catch (err: any) {
//       toast.error('Failed to open document');
//     }
//   };

//   const handleDownloadDocument = (doc: Document) => {
//     try {
//       const link = document.createElement('a');
//       link.href = `${API_BASE}/documents/${doc.id}/download`;
//       link.download = doc.name;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       toast.success(`Downloaded ${doc.name}`);
//     } catch (err: any) {
//       toast.error('Download failed');
//     }
//   };

//   const handleDeleteDocument = async () => {
//     if (!deleteDocId) return;
//     try {
//       await deleteDocument(deleteDocId);
//       setDocuments(prev => prev.filter(d => d.id !== deleteDocId));
//       setDeleteConfirmOpen(false);
//       setDeleteDocId(null);
//       toast.success('Document deleted');
//     } catch (err: any) {
//       toast.error(err?.message || 'Delete failed');
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const [d, i] = await Promise.all([getDocuments(), getInterns()]);
//         setDocuments(d || []);
//         setInterns(i || []);
//         const uniqueGroups = Array.from(new Set(i.map((intern: Intern) => intern.group).filter(Boolean)));
//         setGroups(uniqueGroups as string[]);
//       } catch (err: any) {
//         console.error('Load error:', err);
//         setError('Could not load documents');
//         toast.error('Could not load documents');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   if (loading) {
//     return <div className="p-6 text-center">Loading documents...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-center text-red-600">{error}</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Documents</h1>
//           <p className="text-muted-foreground mt-1">{documents.length} documents</p>
//         </div>
//         <Button type="button" onClick={() => setDialogOpen(true)}>
//           <Upload className="w-4 h-4 mr-2" />
//           Upload Document
//         </Button>
//       </div>

//       {dialogOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h2 className="text-lg font-semibold">Upload Document</h2>
//                 <p className="text-sm text-muted-foreground">Add a new document for interns.</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setDialogOpen(false)}
//                 className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
//               >
//                 Close
//               </button>
//             </div>
//             <div className="grid gap-5">
//               <div className="space-y-3">
//                 <Label className="text-sm font-semibold text-foreground">Select Document File *</Label>
//                 <div className="relative">
//                   <input
//                     type="file"
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                     onChange={e => {
//                       const file = e.target.files?.[0] || null;
//                       setSelectedFile(file);
//                       if (file && !form.name) {
//                         setForm(p => ({ ...p, name: file.name }));
//                       }
//                     }}
//                   />
//                   <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition">
//                     {selectedFile ? (
//                       <>
//                         <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
//                         <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
//                         <p className="text-xs text-muted-foreground mt-1">
//                           {(selectedFile.size / 1024).toFixed(0)} KB
//                         </p>
//                       </>
//                     ) : (
//                       <>
//                         <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
//                         <p className="text-sm font-medium text-foreground">Click to upload</p>
//                         <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label>Document Name</Label>
//                 <Input
//                   value={form.name}
//                   onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
//                   placeholder="e.g. Guide.pdf"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label>Category</Label>
//                 <Input
//                   value={form.category}
//                   onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
//                   placeholder="e.g. Engineering"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label>Group (optional)</Label>
//                 <Select
//                   value={form.group}
//                   onValueChange={(v) => {
//                     if (v === '__selectall') {
//                       const allIds = interns.map(i => i.id);
//                       setForm(p => ({ ...p, group: '', assignedTo: allIds.join(', ') }));
//                     } else if (v === '') {
//                       setForm(p => ({ ...p, group: '', assignedTo: '' }));
//                     } else {
//                       const groupMembers = interns.filter(i => i.group === v).map(i => i.id);
//                       setForm(p => ({ ...p, group: v, assignedTo: groupMembers.join(', ') }));
//                     }
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select group" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="">-- None --</SelectItem>
//                     <SelectItem value="__selectall">✓ Select All Interns</SelectItem>
//                     {groups.length > 0 && groups.map(group => (
//                       <SelectItem key={group} value={group}>{group}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label>Assign to intern IDs</Label>
//                 <Input
//                   value={form.assignedTo}
//                   onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
//                   placeholder="e.g. IN001, IN002"
//                 />
//               </div>
//               <div className="flex justify-end gap-2 pt-3">
//                 <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="button" onClick={handleAdd}>Upload</Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid gap-3">
//         {documents.length === 0 ? (
//           <p className="text-center text-muted-foreground py-8">No documents uploaded yet</p>
//         ) : (
//           documents.map(doc => (
//             <Card key={doc.id}>
//               <CardContent className="p-4 flex items-center gap-4">
//                 <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
//                   <FileText className="w-5 h-5 text-accent-foreground" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-foreground truncate">{doc.name}</p>
//                   <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
//                     <span>{doc.size}</span>
//                     <span>{doc.category}</span>
//                     <span>{doc.uploadedAt}</span>
//                   </div>
//                 </div>
//                 {doc.assignedTo && doc.assignedTo.length > 0 && (
//                   <p className="text-xs text-muted-foreground hidden sm:block">
//                     Assigned: {doc.assignedTo.map(id => interns.find(i => i.id === id)?.name || id).join(', ')}
//                   </p>
//                 )}
//                 <div className="flex gap-2 shrink-0">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleViewDocument(doc)}
//                     title="View document"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleDownloadDocument(doc)}
//                     title="Download document"
//                   >
//                     <Download className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => {
//                       setDeleteDocId(doc.id);
//                       setDeleteConfirmOpen(true);
//                     }}
//                     title="Delete document"
//                   >
//                     <Trash2 className="w-4 h-4 text-destructive" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>

//       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Document</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this document? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <div className="flex justify-end gap-2">
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDeleteDocument}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </div>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default AdminDocuments;





// import React, { useEffect, useState } from 'react';
// import { API_BASE, getDocuments, getInterns } from '@/lib/api';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent } from '@/components/ui/card';
// import { toast } from 'sonner';
// import { FileText, Upload, Eye, Download, Trash2, X } from 'lucide-react';

// const AdminDocuments = () => {
//   const [documents, setDocuments] = useState([]);
//   const [interns, setInterns] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [form, setForm] = useState({ 
//     name: '', 
//     description: '', 
//     category: '', 
//     groupName: '', 
//     assignedTo: '' 
//   });
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const handleAdd = async () => {
//     if (!selectedFile) { 
//       toast.error('Please select a file to upload'); 
//       return; 
//     }

//     try {
//       const formData = new FormData();
//       formData.append('file', selectedFile);
//       formData.append('name', form.name || selectedFile.name);
//       formData.append('description', form.description);
//       formData.append('category', form.category);
//       formData.append('groupName', form.groupName);
//       formData.append('assignedTo', JSON.stringify(
//         form.assignedTo ? form.assignedTo.split(',').map(s => s.trim()) : []
//       ));

//       const response = await fetch(`${API_BASE}/documents`, {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         throw new Error('Upload failed');
//       }

//       const created = await response.json();
//       setDocuments(prev => [created, ...prev]);
//       setDialogOpen(false);
//       setForm({ name: '', description: '', category: '', groupName: '', assignedTo: '' });
//       setSelectedFile(null);
//       toast.success('Document uploaded successfully');
//     } catch (err) {
//       console.error('Upload error:', err);
//       toast.error(err?.message || 'Upload failed');
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [docs, internsData] = await Promise.all([getDocuments(), getInterns()]);
//         setDocuments(docs || []);
//         setInterns(internsData || []);
//         const uniqueGroups = Array.from(new Set(
//           internsData.map(intern => intern.group).filter(Boolean)
//         ));
//         setGroups(uniqueGroups);
//       } catch (err) {
//         console.error('Load error:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) return <div className="p-6 text-center">Loading documents...</div>;
//   if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

//   return (
//     <div className="space-y-6 p-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold">Documents</h1>
//           <p className="text-gray-500 mt-1">{documents.length} documents</p>
//         </div>
//         <Button onClick={() => setDialogOpen(true)}>
//           <Upload className="w-4 h-4 mr-2" />
//           Upload Document
//         </Button>
//       </div>

//       {/* Native Dialog - No shadcn dependencies */}
//       {dialogOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-bold">Upload Document</h2>
//                 <button
//                   onClick={() => setDialogOpen(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {/* File Upload */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Select File <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       setSelectedFile(file);
//                       if (file && !form.name) {
//                         setForm(p => ({ ...p, name: file.name }));
//                       }
//                     }}
//                     className="w-full p-2 border rounded"
//                   />
//                   {selectedFile && (
//                     <p className="text-sm text-gray-500 mt-1">
//                       {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
//                     </p>
//                   )}
//                 </div>

//                 {/* Document Name */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Document Name</label>
//                   <input
//                     type="text"
//                     value={form.name}
//                     onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
//                     className="w-full p-2 border rounded"
//                     placeholder="Enter document name"
//                   />
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Description</label>
//                   <textarea
//                     value={form.description}
//                     onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
//                     className="w-full p-2 border rounded"
//                     // rows ="3"
//                     placeholder="Add a description"
//                   />
//                 </div>

//                 {/* Category */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Category</label>
//                   <input
//                     type="text"
//                     value={form.category}
//                     onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
//                     className="w-full p-2 border rounded"
//                     placeholder="e.g., Engineering, HR"
//                   />
//                 </div>

//                 {/* Group */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Group</label>
//                   <select
//                     value={form.groupName}
//                     onChange={e => setForm(p => ({ ...p, groupName: e.target.value }))}
//                     className="w-full p-2 border rounded"
//                   >
//                     <option value="">Select a group</option>
//                     {groups.map(group => (
//                       <option key={group} value={group}>{group}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Assigned To */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Assign to Interns (IDs)</label>
//                   <input
//                     type="text"
//                     value={form.assignedTo}
//                     onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
//                     className="w-full p-2 border rounded"
//                     placeholder="intern_001, intern_002"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 mt-6">
//                 <button
//                   onClick={() => setDialogOpen(false)}
//                   className="px-4 py-2 border rounded hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAdd}
//                   disabled={!selectedFile}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
//                 >
//                   Upload
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Documents List */}
//       <div className="space-y-3">
//         {documents.length === 0 ? (
//           <p className="text-center text-gray-500 py-8">No documents uploaded yet</p>
//         ) : (
//           documents.map(doc => (
//             <Card key={doc.id}>
//               <CardContent className="p-4">
//                 <div className="flex items-start gap-4">
//                   <FileText className="w-8 h-8 text-gray-400" />
//                   <div className="flex-1">
//                     <h3 className="font-medium">{doc.name}</h3>
//                     {doc.description && (
//                       <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
//                     )}
//                     <div className="flex gap-3 text-xs text-gray-400 mt-2">
//                       <span>{doc.size}</span>
//                       {doc.category && <span>{doc.category}</span>}
//                       <span>{doc.uploadedAt}</span>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => window.open(`${API_BASE}/documents/${doc.id}/view`, '_blank')}
//                       className="p-1 hover:bg-gray-100 rounded"
//                     >
//                       <Eye className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => window.open(`${API_BASE}/documents/${doc.id}/download`, '_blank')}
//                       className="p-1 hover:bg-gray-100 rounded"
//                     >
//                       <Download className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDocuments;




















import React, { useEffect, useState } from 'react';
import { API_BASE, getDocuments, getInterns } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText, Upload, Eye, Download, Trash2, X } from 'lucide-react';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [interns, setInterns] = useState([]);
  const [groups, setGroups] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    category: '', 
    groupName: '', 
    assignedTo: '' 
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAdd = async () => {
    if (!selectedFile) { 
      toast.error('Please select a file to upload'); 
      return; 
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', form.name || selectedFile.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('groupName', form.groupName);
      formData.append('assignedTo', JSON.stringify(
        form.assignedTo ? form.assignedTo.split(',').map(s => s.trim()) : []
      ));

      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const created = await response.json();
      setDocuments(prev => [created, ...prev]);
      setDialogOpen(false);
      setForm({ name: '', description: '', category: '', groupName: '', assignedTo: '' });
      setSelectedFile(null);
      toast.success('Document uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err?.message || 'Upload failed');
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      const response = await fetch(`${API_BASE}/documents/${documentToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
      toast.success('Document deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete document');
    }
  };

  const handleViewDocument = (doc) => {
    try {
      window.open(`${API_BASE}/documents/${doc.id}/view`, '_blank');
      toast.success(`Opening ${doc.name}`);
    } catch (err) {
      toast.error('Failed to open document');
    }
  };

  const handleDownloadDocument = (doc) => {
    try {
      window.open(`${API_BASE}/documents/${doc.id}/download`, '_blank');
      toast.success(`Downloading ${doc.name}`);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docs, internsData] = await Promise.all([getDocuments(), getInterns()]);
        setDocuments(docs || []);
        setInterns(internsData || []);
        const uniqueGroups = Array.from(new Set(
          internsData.map(intern => intern.group).filter(Boolean)
        ));
        setGroups(uniqueGroups);
      } catch (err) {
        console.error('Load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading documents...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-500 mt-1">{documents.length} documents</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Upload Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Document</h2>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setSelectedFile(file);
                      if (file && !form.name) {
                        setForm(p => ({ ...p, name: file.name }));
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>

                {/* Document Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Document Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="Enter document name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full p-2 border rounded"
                    // rows="3"
                    placeholder="Add a description"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Engineering, HR"
                  />
                </div>

                {/* Group */}
                <div>
                  <label className="block text-sm font-medium mb-2">Group</label>
                  <select
                    value={form.groupName}
                    onChange={e => setForm(p => ({ ...p, groupName: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a group</option>
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium mb-2">Assign to Interns (IDs)</label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="intern_001, intern_002"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setDocumentToDelete(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No documents uploaded yet</p>
        ) : (
          documents.map(doc => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-medium">{doc.name}</h3>
                    {doc.description && (
                      <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                    )}
                    <div className="flex gap-3 text-xs text-gray-400 mt-2">
                      <span>{doc.size}</span>
                      {doc.category && <span>{doc.category}</span>}
                      {doc.groupName && <span>Group: {doc.groupName}</span>}
                      <span>{doc.uploadedAt}</span>
                    </div>
                    {doc.assignedTo && doc.assignedTo.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Assigned to: {doc.assignedTo.map(id => 
                          interns.find(i => i.id === id)?.name || id
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="View document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDocumentToDelete(doc);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDocuments;