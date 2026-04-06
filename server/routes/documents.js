// const express = require('express');
// const router = express.Router();
// const Document = require('../models/Document');
// const path = require('path');
// const fs = require('fs');
// const mime = require('mime-types');

// module.exports = (upload) => {
//   router.get('/', async (req, res) => {
//     try {
//       const docs = await Document.find().sort({ createdAt: -1 });
//       res.json(docs);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   router.post('/', upload.single('file'), async (req, res) => {
//     try {
//       const data = req.body;
      
//       // Generate unique ID
//       const id = Date.now().toString();
      
//       let filePath = null;
//       let originalName = null;
//       let size = '0 MB';
//       let type = 'file';
      
//       if (req.file) {
//         filePath = req.file.path;
//         originalName = req.file.originalname;
//         size = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
        
//         // Better MIME type detection
//         let detectedType = req.file.mimetype;
//         if (!detectedType || detectedType === 'application/octet-stream') {
//           // Fallback to extension-based detection
//           detectedType = mime.lookup(originalName) || 'application/octet-stream';
//         }
//         // Ensure correct MIME types for common document formats
//         if (originalName.toLowerCase().endsWith('.csv')) {
//           detectedType = 'text/csv';
//         } else if (originalName.toLowerCase().endsWith('.docx')) {
//           detectedType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//         } else if (originalName.toLowerCase().endsWith('.xlsx')) {
//           detectedType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
//         } else if (originalName.toLowerCase().endsWith('.pptx')) {
//           detectedType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
//         }
//         type = detectedType;
//       }
      
//       let assignedTo = [];
//       try {
//         assignedTo = data.assignedTo ? JSON.parse(data.assignedTo) : [];
//       } catch (e) {
//         // If parsing fails, use empty array
//         assignedTo = [];
//       }
      
//       const docData = {
//         id,
//         name: data.name || originalName || 'Unnamed Document',
//         type,
//         size,
//         uploadedAt: new Date().toISOString().split('T')[0],
//         assignedTo,
//         category: data.category || '',
//         filePath,
//         originalName
//       };
      
//       const doc = new Document(docData);
//       await doc.save();
//       res.status(201).json(doc);
//     } catch (err) {
//       console.error('Create document error:', err);
//       res.status(500).json({ error: err.message });
//     }
//   });

//   router.put('/:id', async (req, res) => {
//     try {
//       const id = req.params.id;
//       const data = req.body;
//       const updated = await Document.findOneAndUpdate({ id }, data, { new: true });
//       if (!updated) return res.status(404).json({ error: 'Document not found' });
//       res.json(updated);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   router.delete('/:id', async (req, res) => {
//     try {
//       const id = req.params.id;
//       const deleted = await Document.findOneAndDelete({ id });
//       if (!deleted) return res.status(404).json({ error: 'Document not found' });
      
//       // Delete the actual file if it exists
//       if (deleted.filePath && fs.existsSync(deleted.filePath)) {
//         fs.unlinkSync(deleted.filePath);
//       }
      
//       res.json({ message: 'Document deleted successfully', deleted });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Download document
//   router.get('/:id/download', async (req, res) => {
//     try {
//       const id = req.params.id;
//       const doc = await Document.findOne({ id });
//       if (!doc) return res.status(404).json({ error: 'Document not found' });
      
//       if (!doc.filePath || !fs.existsSync(doc.filePath)) {
//         return res.status(404).json({ error: 'File not found on server' });
//       }
      
//       const fileName = doc.originalName || doc.name;
//       let contentType = doc.type || 'application/octet-stream';
      
//       // If we still have octet-stream, try to detect from filename
//       if (contentType === 'application/octet-stream' && doc.originalName) {
//         const detected = mime.lookup(doc.originalName);
//         if (detected) {
//           contentType = detected;
//         }
//       }
      
//       res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//       res.setHeader('Content-Type', contentType);
      
//       const fileStream = fs.createReadStream(doc.filePath);
//       fileStream.pipe(res);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // View document (for inline viewing or opening in native app)
//   router.get('/:id/view', async (req, res) => {
//     try {
//       const id = req.params.id;
//       const doc = await Document.findOne({ id });
//       if (!doc) return res.status(404).json({ error: 'Document not found' });
      
//       if (!doc.filePath || !fs.existsSync(doc.filePath)) {
//         return res.status(404).json({ error: 'File not found on server' });
//       }
      
//       const fileName = doc.originalName || doc.name;
      
//       // Set appropriate headers for the file type
//       let contentType = doc.type || 'application/octet-stream';
      
//       // If we still have octet-stream, try to detect from filename
//       if (contentType === 'application/octet-stream' && doc.originalName) {
//         const detected = mime.lookup(doc.originalName);
//         if (detected) {
//           contentType = detected;
//         }
//       }
      
//       res.setHeader('Content-Type', contentType);
      
//       // For files that browsers can display inline, use inline disposition
//       const inlineTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'text/html', 'text/csv'];
      
//       // Office documents should open in their native apps
//       const officeTypes = [
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
//         'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
//         'application/msword', // .doc
//         'application/vnd.ms-excel', // .xls
//         'application/vnd.ms-powerpoint' // .ppt
//       ];
      
//       if (inlineTypes.includes(contentType)) {
//         res.setHeader('Content-Disposition', 'inline');
//       } else if (officeTypes.includes(contentType)) {
//         // Force download for Office docs so they open in native apps
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//       } else {
//         // For other files, let the browser decide
//         res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
//       }
      
//       // Add cache control headers
//       res.setHeader('Cache-Control', 'private, max-age=3600');
      
//       const fileStream = fs.createReadStream(doc.filePath);
//       fileStream.pipe(res);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   return router;
// };



const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

module.exports = (upload) => {
  // GET all documents
  router.get('/', async (req, res) => {
    try {
      const docs = await Document.find().sort({ createdAt: -1 });
      console.log('Documents fetched:', docs.length);
      res.json(docs);
    } catch (err) {
      console.error('GET documents error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST upload document
  router.post('/', upload.single('file'), async (req, res) => {
    try {
      console.log('Upload request received');
      console.log('File:', req.file);
      console.log('Body:', req.body);
      
      let filePath = null;
      let originalName = null;
      let size = '0 MB';
      let type = 'file';
      
      if (req.file) {
        filePath = req.file.path;
        originalName = req.file.originalname;
        size = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
        type = req.file.mimetype || 'application/octet-stream';
        console.log('File saved at:', filePath);
      } else {
        console.log('No file received in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Parse assignedTo if it's a string
      let assignedTo = [];
      if (req.body.assignedTo) {
        try {
          assignedTo = JSON.parse(req.body.assignedTo);
        } catch (e) {
          assignedTo = req.body.assignedTo.split(',').map(s => s.trim());
        }
      }
      
      const documentData = {
        id: Date.now().toString(),
        name: req.body.name || originalName || 'Unnamed Document',
        type: type,
        size: size,
        uploadedAt: new Date().toISOString().split('T')[0],
        assignedTo: assignedTo,
        category: req.body.category || '',
        groupName: req.body.groupName || '',
        description: req.body.description || '',
        filePath: filePath,
        originalName: originalName,
        createdAt: new Date()
      };
      
      const doc = new Document(documentData);
      await doc.save();
      
      console.log('Document saved:', doc.id);
      res.status(201).json(doc);
    } catch (err) {
      console.error('Create document error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update document
  router.put('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const updated = await Document.findOneAndUpdate({ id }, data, { new: true });
      if (!updated) return res.status(404).json({ error: 'Document not found' });
      res.json(updated);
    } catch (err) {
      console.error('Update document error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE document
  router.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await Document.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Document not found' });
      
      // Delete the actual file if it exists
      if (deleted.filePath && fs.existsSync(deleted.filePath)) {
        fs.unlinkSync(deleted.filePath);
        console.log('File deleted:', deleted.filePath);
      }
      
      res.json({ message: 'Document deleted successfully' });
    } catch (err) {
      console.error('Delete document error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // DOWNLOAD document
  router.get('/:id/download', async (req, res) => {
    try {
      const id = req.params.id;
      const doc = await Document.findOne({ id });
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      
      if (!doc.filePath || !fs.existsSync(doc.filePath)) {
        return res.status(404).json({ error: 'File not found on server' });
      }
      
      const fileName = doc.originalName || doc.name;
      res.download(doc.filePath, fileName);
    } catch (err) {
      console.error('Download error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // VIEW document
  router.get('/:id/view', async (req, res) => {
    try {
      const id = req.params.id;
      const doc = await Document.findOne({ id });
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      
      if (!doc.filePath || !fs.existsSync(doc.filePath)) {
        return res.status(404).json({ error: 'File not found on server' });
      }
      
      // Send file for viewing
      res.sendFile(path.resolve(doc.filePath));
    } catch (err) {
      console.error('View error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};