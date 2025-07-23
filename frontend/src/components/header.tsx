import * as React from "react";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { ModeToggle } from "~/components/ModeToggle";
import { Button } from "~/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";
import { logout as logoutApi } from "~/fetch/authentication";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type BreadcrumbItemType = {
  name: string;
  url?: string; // Optional URL (last item won't have URL)
};

interface HeaderProps {
  breadcrumbs: BreadcrumbItemType[];
  title?: string; // Optional title for the first breadcrumb item
}

export default function Header({
  breadcrumbs = [],
  title = "Dormitory Management",
}: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      toast.success("Logged out successfully");
      navigate({ to: "/login" });
    } catch (error) {
      // Even if the API call fails, we should still logout locally
      logout();
      toast.success("Logged out successfully");
      navigate({ to: "/login" });
    }
  };

  return (
    <header className="py-2 rounded-xl">
      <div className="flex flex-left items-center gap-2">
        <SidebarTrigger className="px-2 py-1 rounded" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">{title}</BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {item.url ? (
                    <BreadcrumbLink href={item.url}>{item.name}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <span className="grow" />

        {isAuthenticated && user && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.Username}</span>
            </div>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}

        <ModeToggle />
      </div>
      <Separator className="my-2" />
    </header>
  );
}
