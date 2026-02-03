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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BecomeTrainer from "./pages/BecomeTrainer";
import Dashboard from "./pages/Dashboard";
import BookSession from "./pages/BookSession";
import ScheduleSession from "./pages/ScheduleSession";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
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
            
            {/* Auth pages (no layout) */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/become-trainer" element={<BecomeTrainer />} />
            
            {/* Protected pages - Candidates */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/book" element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <BookSession />
              </ProtectedRoute>
            } />
            <Route path="/schedule/:bookingId" element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <ScheduleSession />
              </ProtectedRoute>
            } />
            
            {/* Trainer pages */}
            <Route path="/trainer" element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin pages */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
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
