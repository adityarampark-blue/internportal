import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import InternManagement from "@/pages/admin/InternManagement";
import AdminTasks from "@/pages/admin/AdminTasks";
import AdminMeetings from "@/pages/admin/AdminMeetings";
import AdminDocuments from "@/pages/admin/AdminDocuments";
import AdminAttendance from "@/pages/admin/AdminAttendance";
import AdminUpdates from "@/pages/admin/AdminUpdates";
import PendingApprovals from "@/pages/admin/PendingApprovals";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import InternDashboard from "@/pages/intern/InternDashboard";
import InternAttendance from "@/pages/intern/InternAttendance";
import InternUpdates from "@/pages/intern/InternUpdates";
import InternTasks from "@/pages/intern/InternTasks";
import InternDocuments from "@/pages/intern/InternDocuments";
import InternMeetings from "@/pages/intern/InternMeetings";
import NotFound from "@/pages/NotFound";



// Example in App.tsx


// In your routes
<Route path="/documents" element={<AdminDocuments />} />




















const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role: 'admin' | 'intern' }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to={user?.role === 'admin' ? '/admin' : '/intern'} replace />;
  if (role === 'intern' && user && user.approved === false) {
    // show pending approval notice inside layout
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-16 p-6">
          <div className="p-6 rounded-lg border bg-muted/50 text-center">
            <h2 className="text-lg font-semibold">Account Pending Approval</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your account is awaiting approval by an administrator. You will be notified once approved.</p>
            <div className="mt-4 flex justify-center">
              <button className="px-4 py-2 rounded bg-destructive text-white" onClick={() => { /* sign out */ window.location.href = '/login'; }}>Sign out</button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AuthRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signup" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/intern'} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    
    {/* Admin Routes */}
    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/interns" element={<ProtectedRoute role="admin"><InternManagement /></ProtectedRoute>} />
    <Route path="/admin/tasks" element={<ProtectedRoute role="admin"><AdminTasks /></ProtectedRoute>} />
    <Route path="/admin/meetings" element={<ProtectedRoute role="admin"><AdminMeetings /></ProtectedRoute>} />
    <Route path="/admin/documents" element={<ProtectedRoute role="admin"><AdminDocuments /></ProtectedRoute>} />
    <Route path="/admin/pending" element={<ProtectedRoute role="admin"><PendingApprovals /></ProtectedRoute>} />
    <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><AdminAttendance /></ProtectedRoute>} />
    <Route path="/admin/updates" element={<ProtectedRoute role="admin"><AdminUpdates /></ProtectedRoute>} />

    {/* Intern Routes */}
    <Route path="/intern" element={<ProtectedRoute role="intern"><InternDashboard /></ProtectedRoute>} />
    <Route path="/intern/attendance" element={<ProtectedRoute role="intern"><InternAttendance /></ProtectedRoute>} />
    <Route path="/intern/updates" element={<ProtectedRoute role="intern"><InternUpdates /></ProtectedRoute>} />
    <Route path="/intern/tasks" element={<ProtectedRoute role="intern"><InternTasks /></ProtectedRoute>} />
    <Route path="/intern/documents" element={<ProtectedRoute role="intern"><InternDocuments /></ProtectedRoute>} />
    <Route path="/intern/meetings" element={<ProtectedRoute role="intern"><InternMeetings /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
