import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "./GlobalSearch";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
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

          {/* Notifications - hidden on mobile (shown in MobileHeader) */}

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
