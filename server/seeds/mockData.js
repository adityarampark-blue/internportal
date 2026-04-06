// JS copy of frontend mock data for seeding
exports.mockInterns = [
  { id: 'IN001', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43210', department: 'Engineering', startDate: '2025-01-15', endDate: '2025-07-15', status: 'active', avatar: '', group: 'Team Alpha' },
  { id: 'IN002', name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91 98765 43211', department: 'Design', startDate: '2025-02-01', endDate: '2025-08-01', status: 'active', avatar: '', group: 'Team Beta' },
  { id: 'IN003', name: 'Anita Desai', email: 'anita@example.com', phone: '+91 98765 43212', department: 'Marketing', startDate: '2024-09-01', endDate: '2025-03-01', status: 'active', avatar: '', group: 'Team Alpha' },
  { id: 'IN004', name: 'Vikram Patel', email: 'vikram@example.com', phone: '+91 98765 43213', department: 'Engineering', startDate: '2024-06-01', endDate: '2024-12-01', status: 'completed', avatar: '', group: 'Team Beta' },
  { id: 'IN005', name: 'Sneha Iyer', email: 'sneha@example.com', phone: '+91 98765 43214', department: 'Data Science', startDate: '2025-03-01', endDate: '2025-09-01', status: 'active', avatar: '', group: 'Team Alpha' },
  { id: 'IN006', name: 'Lakshita', email: 'lakshita@example.com', phone: '+91 98765 43215', department: 'Engineering', startDate: '2025-03-15', endDate: '2025-09-15', status: 'active', avatar: '', group: 'Team Alpha' },
  { id: 'IN007', name: 'Aditya', email: 'aditya@example.com', phone: '+91 98765 43216', department: 'Data Science', startDate: '2025-04-01', endDate: '2025-10-01', status: 'active', avatar: '', group: 'Team Beta' }
];

exports.mockTasks = [
  { id: '1', title: 'Build login page UI', description: 'Create responsive login page with form validation', assignedTo: ['IN001', 'IN002'], group: '', dueDate: '2025-02-20', status: 'in-progress', priority: 'high' },
  { id: '2', title: 'Design system documentation', description: 'Document all design tokens and component usage', assignedTo: ['IN002'], group: '', dueDate: '2025-02-25', status: 'pending', priority: 'medium' },
  { id: '3', title: 'API integration research', description: 'Research REST API best practices for the project', assignedTo: [], group: 'Team Alpha', dueDate: '2025-03-01', status: 'pending', priority: 'low' },
  { id: '4', title: 'Database schema review', description: 'Review and optimize database schema', assignedTo: ['IN001'], group: '', dueDate: '2025-02-18', status: 'completed', priority: 'high' },
  { id: '5', title: 'Unit testing setup', description: 'Set up testing framework and write initial tests', assignedTo: ['IN005'], group: '', dueDate: '2025-03-05', status: 'pending', priority: 'medium' }
];

exports.mockMeetings = [
  { id: '1', title: 'Weekly Standup', date: '2025-02-17', time: '10:00 AM', link: 'https://meet.google.com/abc-def-ghi', description: 'Weekly team standup meeting' },
  { id: '2', title: 'Sprint Review', date: '2025-02-21', time: '2:00 PM', link: 'https://zoom.us/j/123456789', description: 'End of sprint review and demo' },
  { id: '3', title: 'Design Workshop', date: '2025-02-19', time: '11:00 AM', link: 'https://meet.google.com/xyz-uvw-rst', description: 'UI/UX design workshop for new features' }
];

exports.mockDocuments = [
  { id: '1', name: 'Onboarding Guide.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2025-01-10', assignedTo: [], category: 'General' },
  { id: '2', name: 'Code Standards.md', type: 'md', size: '156 KB', uploadedAt: '2025-01-15', assignedTo: ['IN001', 'IN002', 'IN005'], category: 'Engineering' },
  { id: '3', name: 'Brand Guidelines.pdf', type: 'pdf', size: '5.1 MB', uploadedAt: '2025-02-01', assignedTo: ['IN002', 'IN003'], category: 'Design' },
  { id: '4', name: 'Project Roadmap.xlsx', type: 'xlsx', size: '890 KB', uploadedAt: '2025-02-05', assignedTo: [], category: 'General' }
];

exports.mockDailyUpdates = [
  { id: '1', internId: 'IN001', date: '2025-02-14', content: 'Completed login page responsive design. Started working on form validation.', hoursWorked: 7 },
  { id: '2', internId: 'IN002', date: '2025-02-14', content: 'Designed dashboard wireframes and created component library documentation.', hoursWorked: 6 },
  { id: '3', internId: 'IN001', date: '2025-02-13', content: 'Set up project structure and installed dependencies. Created initial routing.', hoursWorked: 8 },
  { id: '4', internId: 'IN003', date: '2025-02-14', content: 'Prepared social media content calendar for March. Analyzed engagement metrics.', hoursWorked: 5 }
];

exports.mockAttendance = [
  { id: '1', internId: 'IN001', date: '2025-02-14', status: 'present', checkIn: '09:00 AM' },
  { id: '2', internId: 'IN001', date: '2025-02-13', status: 'present', checkIn: '09:15 AM' },
  { id: '3', internId: 'IN001', date: '2025-02-12', status: 'present', checkIn: '09:05 AM' },
  { id: '4', internId: 'IN001', date: '2025-02-11', status: 'absent', checkIn: '' },
  { id: '5', internId: 'IN002', date: '2025-02-14', status: 'present', checkIn: '09:30 AM' },
  { id: '6', internId: 'IN002', date: '2025-02-13', status: 'present', checkIn: '10:15 AM' },
  { id: '7', internId: 'IN003', date: '2025-02-14', status: 'present', checkIn: '08:55 AM' }
];

exports.mockUsers = [
  { id: 'admin-1', email: 'admin@portal.com', password: 'admin123', role: 'admin', name: 'Admin User', approved: true },
  { id: 'IN001', email: 'priya@example.com', password: 'intern123', role: 'intern', name: 'Priya Sharma', approved: true },
  { id: 'IN002', email: 'rahul@example.com', password: 'intern123', role: 'intern', name: 'Rahul Verma', approved: true },
  // pending intern for testing approval flow
  { id: 'pending-1', email: 'pending@example.com', password: 'pending123', role: 'intern', name: 'Pending Intern', approved: false }
];
