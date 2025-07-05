import { createFileRoute } from "@tanstack/react-router";
import Header from "~/components/header";
import React from "react";

export const Route = createFileRoute("/contract/$contractId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { contractId } = Route.useParams();

  return (
    <div className="w-full">
      <Header
        breadcrumbs={[
          { name: "Contracts", url: "/contract" },
          {
            name: `Contract ${contractId} details`,
            url: `/contract/${contractId}`,
          },
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">
        Contract ID {contractId} Details
      </h1>
    </div>
  );
}
