import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./AppSidebar";
import fincartIcon from "@/assets/fincart-icon.png";
import { useTenant } from "@/contexts/TenantContext";

export function MobileHeader() {
  const { cartorioAtivo } = useTenant();

  return (
    <header className="sticky top-0 z-40 flex lg:hidden items-center justify-between h-14 px-4 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <img 
          src={fincartIcon} 
          alt="FinCart" 
          className="h-8 w-8"
        />
      </div>

      {/* Center: Cartório name (truncated) */}
      {cartorioAtivo && (
        <div className="flex-1 mx-4 min-w-0">
          <p className="text-sm font-medium truncate text-center text-sidebar-foreground/80">
            {cartorioAtivo.nome}
          </p>
        </div>
      )}

      {/* Right: Notifications */}
      <Button variant="ghost" size="icon" className="relative text-sidebar-foreground hover:bg-sidebar-accent/50">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
      </Button>
    </header>
  );
}
