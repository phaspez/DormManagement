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
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <ModeToggle />
      </div>
      <Separator className="my-2" />
    </header>
  );
}
