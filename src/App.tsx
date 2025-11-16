import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HardwareDashboard from "./pages/HardwareDashboard";
import SoftwareDashboard from "./pages/SoftwareDashboard";
import HardwareIncidents from "./pages/HardwareIncidents";
import SoftwareIncidents from "./pages/SoftwareIncidents";
import EditIncident from "./pages/EditIncident";
import AddReport from "./pages/AddReport";
import History from "./pages/History";
import Equipment from "./pages/Equipment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard/hardware" element={<HardwareDashboard />} />
        <Route path="/dashboard/software" element={<SoftwareDashboard />} />
        <Route path="/hardware" element={<HardwareIncidents />} />
        <Route path="/software" element={<SoftwareIncidents />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/incident/edit/:id" element={<EditIncident />} />
        <Route path="/software/report/:id" element={<AddReport />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

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
