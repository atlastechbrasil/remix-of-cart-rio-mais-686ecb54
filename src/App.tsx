import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Lancamentos from "./pages/Lancamentos";
import Registros from "./pages/Registros";
import Repasses from "./pages/Repasses";
import Relatorios from "./pages/Relatorios";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import Conciliacao from "./pages/Conciliacao";
import ContasBancarias from "./pages/ContasBancarias";
import Extratos from "./pages/Extratos";
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/conciliacao" element={<ProtectedRoute><Conciliacao /></ProtectedRoute>} />
            <Route path="/contas" element={<ProtectedRoute><ContasBancarias /></ProtectedRoute>} />
            <Route path="/extratos" element={<ProtectedRoute><Extratos /></ProtectedRoute>} />
            <Route path="/lancamentos" element={<ProtectedRoute><Lancamentos /></ProtectedRoute>} />
            <Route path="/registros" element={<ProtectedRoute><Registros /></ProtectedRoute>} />
            <Route path="/repasses" element={<ProtectedRoute><Repasses /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
