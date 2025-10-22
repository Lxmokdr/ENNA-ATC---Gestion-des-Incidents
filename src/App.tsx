import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import HardwareIncidents from "./pages/HardwareIncidents";
import SoftwareIncidents from "./pages/SoftwareIncidents";
import AddReport from "./pages/AddReport";
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/hardware" element={<Layout><HardwareIncidents /></Layout>} />
          <Route path="/software" element={<Layout><SoftwareIncidents /></Layout>} />
          <Route path="/software/report/:id" element={<Layout><AddReport /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/admin-dashboard" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
