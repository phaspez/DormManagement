import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getRooms } from "~/fetch/room";
import Header from "~/components/header";
import React from "react";
import {
  House,
  Hotel,
  ReceiptText,
  User,
  Notebook,
  Bath,
  CircleGauge,
  Command,
} from "lucide-react";
export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const pages = [
    {
      name: "Rooms",
      description: "Manage and view all rooms.",
      url: "/room",
      icon: Hotel,
      bg: "text-blue-600",
    },
    {
      name: "Room Types",
      description: "Define and edit room types.",
      url: "/roomtype",
      icon: CircleGauge,
      bg: "text-purple-600",
    },
    {
      name: "Students",
      description: "Student directory and management.",
      url: "/student",
      icon: User,
      bg: "text-green-600",
    },
    {
      name: "Contracts",
      description: "View and manage contracts.",
      url: "/contract",
      icon: Notebook,
      bg: "text-yellow-600",
    },
    {
      name: "Invoices",
      description: "Billing and invoice management.",
      url: "/invoice",
      icon: ReceiptText,
      bg: "text-pink-600",
    },
    {
      name: "Services",
      description: "Manage dorm services.",
      url: "/service",
      icon: Bath,
      bg: "text-cyan-600",
    },
    {
      name: "Service Usage",
      description: "Track service usage by students.",
      url: "/serviceusage",
      icon: Bath,
      bg: "text-orange-600",
    },
  ];

  return (
    <div className="w-full">
      <Header breadcrumbs={[{ name: "Home", url: "/" }]} />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Dormitory Management Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome! Here you can find quick access to features and services
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.url}
            className="rounded-xl shadow p-6 flex flex-col justify-between border hover:shadow-lg transition-shadow relative overflow-hidden"
          >
            <div
              className={`absolute right-4 top-4 opacity-60 text-7xl pointer-events-none select-none ${page.bg}`}
              style={{ zIndex: 0 }}
            >
              <page.icon size={80} />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-2">{page.name}</h2>
              <p className="text-gray-600 mb-4">{page.description}</p>
            </div>
            <Button asChild className="relative z-10 mt-2">
              <a href={page.url}>Go to {page.name}</a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
