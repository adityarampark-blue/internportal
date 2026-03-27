import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, ClipboardList, CalendarDays, FileText,
  Video, LogOut, GraduationCap, Menu, X, ChevronRight, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const adminLinks: SidebarLink[] = [
  { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/interns', icon: <Users className="w-5 h-5" />, label: 'Interns' },
  { to: '/admin/tasks', icon: <ClipboardList className="w-5 h-5" />, label: 'Tasks' },
  { to: '/admin/meetings', icon: <Video className="w-5 h-5" />, label: 'Meetings' },
  { to: '/admin/documents', icon: <FileText className="w-5 h-5" />, label: 'Documents' },
  { to: '/admin/attendance', icon: <CalendarDays className="w-5 h-5" />, label: 'Attendance' },
  { to: '/admin/updates', icon: <Clock className="w-5 h-5" />, label: 'Daily Updates' },
  { to: '/admin/pending', icon: <Users className="w-5 h-5" />, label: 'Pending Approvals' },
];

const internLinks: SidebarLink[] = [
  { to: '/intern', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/intern/attendance', icon: <CalendarDays className="w-5 h-5" />, label: 'Attendance' },
  { to: '/intern/updates', icon: <Clock className="w-5 h-5" />, label: 'Daily Updates' },
  { to: '/intern/tasks', icon: <ClipboardList className="w-5 h-5" />, label: 'Tasks' },
  { to: '/intern/documents', icon: <FileText className="w-5 h-5" />, label: 'Documents' },
  { to: '/intern/meetings', icon: <Video className="w-5 h-5" />, label: 'Meetings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : internLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground text-lg">Interns Portal</span>
          <button className="lg:hidden ml-auto text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/intern'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold text-sidebar-primary">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-3 flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1" />
        </header>
        <div className="p-4 lg:p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
