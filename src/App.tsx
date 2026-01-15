import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "./components/layout/PublicLayout";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Sessions from "./pages/Sessions";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BookSession from "./pages/BookSession";
import ScheduleSession from "./pages/ScheduleSession";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public pages with layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            
            {/* Auth page (no layout) */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected pages */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/book" element={
              <ProtectedRoute>
                <BookSession />
              </ProtectedRoute>
            } />
            <Route path="/schedule/:bookingId" element={
              <ProtectedRoute>
                <ScheduleSession />
              </ProtectedRoute>
            } />
            
            {/* Admin pages */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
