import {
  Command,
  House,
  Hotel,
  ReceiptText,
  User,
  Notebook,
  CircleGauge,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Dorm. Management",
      logo: Command,
      plan: "Project Quản trị dữ liệu",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: House,
      isActive: true,
    },
    {
      title: "Rooms",
      url: "/room",
      icon: Hotel,
      isActive: true,
    },
    {
      title: "Contracts",
      url: "/contract",
      icon: Notebook,
      isActive: true,
    },
    {
      title: "Students",
      url: "/student",
      icon: User,
      isActive: true,
    },
    {
      title: "Invoices",
      url: "/invoice",
      icon: ReceiptText,
      isActive: true,
    },
    {
      title: "Service Usages",
      url: "/serviceusage",
      icon: CircleGauge,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
