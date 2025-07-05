import { createFileRoute } from "@tanstack/react-router";

import Header from "~/components/header";
import React from "react";

export const Route = createFileRoute("/room/$roomId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();

  return (
    <div className="w-full">
      <Header
        breadcrumbs={[
          { name: "Rooms", url: "/room" },
          { name: `Room ${roomId} details`, url: `/room/${roomId}` },
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Room {roomId} Details</h1>
    </div>
  );
}
