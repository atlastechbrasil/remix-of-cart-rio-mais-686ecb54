import * as React from "react";
import { DesktopSidebar, MobileSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <DesktopSidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header with hamburger - hidden on desktop */}
        <MobileHeader />
        
        {children}
      </main>
    </div>
  );
}
