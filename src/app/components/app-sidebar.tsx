import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import CharacterSheet from "./character-sheet";

export function AppSidebar() {
  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="w-5/24 group-data-[collapsible=icon]:h-15"
    >
      <SidebarHeader className="max-h-20 rounded-lg">
        <div className="flex h-full items-center">
          <div className="flex w-full justify-end">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="min-h-0 flex-1 rounded-lg group-data-[collapsible=icon]:hidden">
        <CharacterSheet />
      </SidebarContent>
    </Sidebar>
  );
}
