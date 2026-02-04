import { Building2, ChevronDown, Check } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface CartorioSelectorProps {
  collapsed?: boolean;
}

export function CartorioSelector({ collapsed = false }: CartorioSelectorProps) {
  const { cartorioAtivo, cartorios, isLoading, setCartorioAtivo, isSuperAdmin } = useTenant();

  // Não mostrar se só tem um cartório e não é super admin
  if (!isSuperAdmin && cartorios.length <= 1) {
    if (collapsed) return null;
    
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-sidebar-foreground/70">
          <Building2 className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{cartorioAtivo?.nome || "Sem cartório"}</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("px-3 py-2", collapsed && "px-2")}>
        <Skeleton className={cn("h-9", collapsed ? "w-10" : "w-full")} />
      </div>
    );
  }

  if (cartorios.length === 0) {
    return null;
  }

  return (
    <div className={cn("px-3 py-2", collapsed && "px-2")}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center gap-2 w-full px-2 py-1.5 rounded-md",
            "bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors",
            "text-sidebar-foreground text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-sidebar-ring",
            collapsed && "justify-center px-0"
          )}
        >
          <Building2 className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">
                {cartorioAtivo?.nome || "Selecione"}
              </span>
              <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align={collapsed ? "center" : "start"} 
          className="w-56"
          sideOffset={5}
        >
          {cartorios.map((cartorio) => (
            <DropdownMenuItem
              key={cartorio.id}
              onClick={() => setCartorioAtivo(cartorio.id)}
              className="flex items-center gap-2"
            >
              <Check
                className={cn(
                  "w-4 h-4",
                  cartorioAtivo?.id === cartorio.id ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">{cartorio.nome}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
