import * as React from "react";
import { Bell, Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalSearch } from "./GlobalSearch";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function HeaderCartorioSelector() {
  const { cartorioAtivo, cartorios, isLoading, setCartorioAtivo, isSuperAdmin } = useTenant();

  // Sempre verificar loading primeiro
  if (isLoading) {
    return <Skeleton className="h-9 w-48 hidden md:block" />;
  }

  // Sem cartórios disponíveis
  if (cartorios.length === 0) {
    return null;
  }

  // Se não é super admin e só tem um cartório, mostrar label estático
  if (!isSuperAdmin && cartorios.length <= 1) {
    if (!cartorioAtivo) return null;
    
    return (
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-md">
        <Building2 className="w-4 h-4" />
        <span className="truncate max-w-[200px]">{cartorioAtivo.nome}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex gap-2 max-w-[250px]">
          <Building2 className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{cartorioAtivo?.nome || "Selecione"}</span>
          <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover">
        {cartorios.map((cartorio) => (
          <DropdownMenuItem
            key={cartorio.id}
            onClick={() => setCartorioAtivo(cartorio.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Check
              className={cn(
                "w-4 h-4 flex-shrink-0",
                cartorioAtivo?.id === cartorio.id ? "opacity-100" : "opacity-0"
              )}
            />
            <span className="truncate">{cartorio.nome}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:h-16 sm:py-0 sm:px-6">
        {/* Title and Description */}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-foreground sm:text-xl truncate">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground sm:text-sm truncate">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Global Search - hidden on mobile */}
          <GlobalSearch />

          {/* Cartório Selector - hidden on mobile (shown in MobileHeader) */}
          <HeaderCartorioSelector />

          {/* Notifications - hidden on mobile (shown in MobileHeader) */}
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {children}
        </div>
      </div>
    </header>
  );
}
