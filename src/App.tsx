
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UnifiedAuthProvider } from "@/hooks/useUnifiedAuth";
import DonationButton from "@/components/DonationButton";
import Index from "./pages/Index";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Shortcuts from "./pages/Shortcuts";
import Terms from "./pages/Terms";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Bookmarks from "./pages/Bookmarks";
import SeedVault from "./pages/SeedVault";
import EscrowDashboard from "./pages/EscrowDashboard";
import DisputeDashboard from "./pages/admin/DisputeDashboard";
import AuditLogDashboard from "./pages/admin/AuditLogDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UnifiedAuthProvider>
          <Toaster />
          <Sonner />
          <DonationButton />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shortcuts" element={<Shortcuts />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/seedvault" element={<SeedVault />} />
            <Route path="/escrow" element={<EscrowDashboard />} />
            <Route path="/admin/disputes" element={<DisputeDashboard />} />
            <Route path="/admin/audit-logs" element={<AuditLogDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </UnifiedAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
