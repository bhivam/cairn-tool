import type React from "react";
import { Sidebar, SidebarContent, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import CharacterSheet from "./character-sheet";

export function AppSidebar() {
  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
      className="group-data-[collapsible=icon]:h-15"
    >
      {/* Collapsed (icon) toolbar with a trigger to re-expand */}
      <div className="hidden items-center justify-center p-2 group-data-[collapsible=icon]:flex">
        <SidebarTrigger />
      </div>

      <SidebarContent className="min-h-0 flex-1 overflow-hidden rounded-lg group-data-[collapsible=icon]:hidden">
        <CharacterSheet />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
