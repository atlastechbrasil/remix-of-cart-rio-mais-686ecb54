import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/conciliacao" element={<Conciliacao />} />
          <Route path="/contas" element={<ContasBancarias />} />
          <Route path="/extratos" element={<Extratos />} />
          <Route path="/lancamentos" element={<Lancamentos />} />
          <Route path="/registros" element={<Registros />} />
          <Route path="/repasses" element={<Repasses />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
