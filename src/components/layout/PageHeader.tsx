import * as React from "react";
import { Bell, Search, Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/contexts/TenantContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function HeaderCartorioSelector() {
  const { cartorioAtivo, cartorios, isLoading, setCartorioAtivo, isSuperAdmin } = useTenant();

  // Sempre verificar loading primeiro
  if (isLoading) {
    return <Skeleton className="h-9 w-48 hidden sm:block" />;
  }

  // Sem cartórios disponíveis
  if (cartorios.length === 0) {
    return null;
  }

  // Se não é super admin e só tem um cartório, mostrar label estático
  if (!isSuperAdmin && cartorios.length <= 1) {
    if (!cartorioAtivo) return null;
    
    return (
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-md">
        <Building2 className="w-4 h-4" />
        <span className="truncate max-w-[200px]">{cartorioAtivo.nome}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex gap-2 max-w-[250px]">
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
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Cartório Selector */}
          <HeaderCartorioSelector />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {children}
        </div>
      </div>
    </header>
  );
}
