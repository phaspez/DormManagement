import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "~/components/header";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoiceByID } from "~/fetch/invoice";
import { deleteServiceUsage, putServiceUsage } from "~/fetch/serviceUsage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CalendarIcon, Info, ArrowUpRight, Pencil, Trash } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import ServiceUsageDialog from "~/components/contract/ContractDetailFormDialog";

export const Route = createFileRoute("/invoice/$invoiceId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { invoiceId } = Route.useParams();
  const queryClient = useQueryClient();

  // Generate month options for display
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: () => getInvoiceByID(Number(invoiceId)),
    enabled: !!invoiceId,
  });

  // Mutation for deleting service usage
  const deleteServiceUsageMutation = useMutation({
    mutationFn: deleteServiceUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
      toast.success("Service usage deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete service usage");
    },
  });

  const handleDeleteServiceUsage = (serviceUsageID: number) => {
    if (window.confirm("Are you sure you want to delete this service usage?")) {
      deleteServiceUsageMutation.mutate(serviceUsageID);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "PPP");
    } catch (error) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Header
          breadcrumbs={[
            { name: "Invoices", url: "/invoice" },
            { name: `Invoice ${invoiceId}`, url: `/invoice/${invoiceId}` },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-muted-foreground">
            Loading invoice details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="w-full">
        <Header
          breadcrumbs={[
            { name: "Invoices", url: "/invoice" },
            { name: `Invoice ${invoiceId}`, url: `/invoice/${invoiceId}` },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-destructive">
            {error ? "Failed to load invoice details" : "Invoice not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header
        breadcrumbs={[
          { name: "Invoices", url: "/invoice" },
          { name: `Invoice ${invoiceId}`, url: `/invoice/${invoiceId}` },
        ]}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Details</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Information
            </CardTitle>
            <CardDescription>Invoice summary and dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-4 px-2 grid gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <div className="flex grow gap-2 justify-between items-center">
                  <span className="text-sm font-medium">Created Date:</span>
                  <Badge variant="outline" className="text-sm py-1.5">
                    {formatDate(invoice.CreatedDate)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <div className="flex grow gap-2 justify-between items-center">
                  <span className="text-sm font-medium">Due Date:</span>
                  <Badge variant="outline" className="text-sm py-1.5">
                    {formatDate(invoice.DueDate)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Total Amount:</span>
                <Badge variant="outline" className="text-sm py-1.5">
                  {invoice.TotalAmount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Usages</CardTitle>
            <CardDescription>Services included in this invoice</CardDescription>
          </CardHeader>
          <CardContent>
            {invoice.ServiceUsages && invoice.ServiceUsages.length > 0 ? (
              <div className="space-y-4">
                {invoice.ServiceUsages.map((service) => (
                  <div
                    key={service.ServiceUsageID}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center justify-between">
                          <h5 className="text-lg font-bold">
                            {service.ServiceName} x{service.Quantity}
                          </h5>
                          <span>
                            ID: {service.ServiceID}, Contract ID:{" "}
                            {service.ContractID}, Invoice ID:{" "}
                            {service.InvoiceID}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {
                            months.find((m) => m.value === service.UsageMonth)
                              ?.label
                          }{" "}
                          {service.UsageYear}
                        </p>
                        <div className="flex gap-2 items-center">
                          <Link
                            to="/contract/$contractId"
                            params={{
                              contractId: service.ContractID.toString(),
                            }}
                          >
                            <Badge variant="outline" className="cursor-pointer">
                              View Contract{" "}
                              <ArrowUpRight className="inline ml-1 h-4 w-4" />
                            </Badge>
                          </Link>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ServiceUsageDialog
                          contractId={service.ContractID.toString()}
                          editingServiceUsage={service}
                          onSuccess={() => {
                            queryClient.invalidateQueries({
                              queryKey: ["invoices", invoiceId],
                            });
                          }}
                          trigger={
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeleteServiceUsage(service.ServiceUsageID)
                          }
                          disabled={deleteServiceUsageMutation.isPending}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No service usages found for this invoice.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
