import { createFileRoute } from "@tanstack/react-router";
import Header from "~/components/header";
import React from "react";
import RoomManagement from "~/components/room/RoomManagement";

export const Route = createFileRoute("/room/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Header breadcrumbs={[{ name: "Rooms", url: "/room" }]} />
      <RoomManagement />
    </div>
  );
}
