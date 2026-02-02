import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  Upload,
  Landmark,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import fincartLogo from "@/assets/fincart-logo.png";
import fincartIcon from "@/assets/fincart-icon.png";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Conciliação Bancária",
    icon: CheckCircle2,
    path: "/conciliacao",
  },
  {
    title: "Contas Bancárias",
    icon: Landmark,
    path: "/contas",
  },
  {
    title: "Extratos",
    icon: Upload,
    path: "/extratos",
  },
  {
    title: "Lançamentos",
    icon: Wallet,
    path: "/lancamentos",
  },
  {
    title: "Registros de Imóveis",
    icon: FileSpreadsheet,
    path: "/registros",
  },
  {
    title: "Repasses",
    icon: RefreshCw,
    path: "/repasses",
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    path: "/relatorios",
  },
  {
    title: "Usuários",
    icon: Users,
    path: "/usuarios",
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/configuracoes",
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(true);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  const userInitials = user?.user_metadata?.nome
    ? user.user_metadata.nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center justify-center border-b border-sidebar-border",
        collapsed ? "h-16 px-2" : "h-20 px-4"
      )}>
        <img 
          src={collapsed ? fincartIcon : fincartLogo} 
          alt="FinCart" 
          className={cn(
            "transition-all duration-300 object-contain",
            collapsed ? "h-10 w-10" : "w-44 h-auto"
          )}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2 text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-primary">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.nome || user?.email}
              </p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs text-sidebar-foreground/70 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
