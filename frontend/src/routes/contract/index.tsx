import { createFileRoute } from "@tanstack/react-router";
import Header from "~/components/header";
import React from "react";
import ContractManagement from "~/components/contract/ContractManagement";

export const Route = createFileRoute("/contract/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Header breadcrumbs={[{ name: "Contract", url: "/contract" }]} />
      <ContractManagement />
    </div>
  );
}
