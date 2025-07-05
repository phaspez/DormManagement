import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Trash2, Edit, Plus, X, ReceiptText, CalendarIcon } from "lucide-react";
import Header from "~/components/header";
import {
  deleteInvoice,
  getInvoices,
  postInvoice,
  putInvoice,
  Invoice,
} from "~/fetch/invoice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import TableSkeleton from "~/components/TableSkeleton";
import { Skeleton } from "~/components/ui/skeleton";

export const Route = createFileRoute("/invoice")({
  component: InvoiceManagement,
});

interface FormErrors {
  ServiceUsageID?: string;
  CreatedDate?: string;
  DueDate?: string;
  TotalAmount?: string;
}

export default function InvoiceManagement() {
  const queryClient = useQueryClient();

  // Fetch invoices
  const {
    data: invoices,
    isLoading,
    isError,
  } = useQuery({
    queryFn: getInvoices,
    queryKey: ["invoices"],
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: postInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      resetForm();
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: putInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      resetForm();
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  // State for form inputs
  const [formData, setFormData] = useState<Omit<Invoice, "InvoiceID">>({
    ServiceUsageID: 0,
    CreatedDate: new Date().toISOString().split("T")[0],
    DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    TotalAmount: 0,
  });
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createdDate, setCreatedDate] = useState<Date | undefined>(
    formData.CreatedDate ? new Date(formData.CreatedDate) : new Date(),
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    formData.DueDate
      ? new Date(formData.DueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.ServiceUsageID <= 0) {
      newErrors.ServiceUsageID = "Service usage ID must be greater than 0";
    }

    if (!formData.CreatedDate) {
      newErrors.CreatedDate = "Created date is required";
    }

    if (!formData.DueDate) {
      newErrors.DueDate = "Due date is required";
    } else if (new Date(formData.DueDate) <= new Date(formData.CreatedDate)) {
      newErrors.DueDate = "Due date must be after created date";
    }

    if (formData.TotalAmount <= 0) {
      newErrors.TotalAmount = "Total amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleDateChange = (
    field: "CreatedDate" | "DueDate",
    date: Date | undefined,
  ) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setFormData((prev) => ({
        ...prev,
        [field]: formattedDate,
      }));

      if (field === "CreatedDate") {
        setCreatedDate(date);
      } else {
        setDueDate(date);
      }
    }

    // Clear error when user selects a date
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const resetForm = () => {
    const today = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    setFormData({
      ServiceUsageID: 0,
      CreatedDate: today.toISOString().split("T")[0],
      DueDate: thirtyDaysLater.toISOString().split("T")[0],
      TotalAmount: 0,
    });
    setEditingInvoice(null);
    setErrors({});
    setIsCreateDialogOpen(false);
    setCreatedDate(today);
    setDueDate(thirtyDaysLater);
  };

  const handleCreateInvoice = () => {
    if (!validateForm()) return;
    createInvoiceMutation.mutate(formData);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      ServiceUsageID: invoice.ServiceUsageID,
      CreatedDate: invoice.CreatedDate.split("T")[0],
      DueDate: invoice.DueDate.split("T")[0],
      TotalAmount: invoice.TotalAmount,
    });
    setErrors({});
    setIsCreateDialogOpen(true);

    // Set date picker states
    if (invoice.CreatedDate) {
      setCreatedDate(new Date(invoice.CreatedDate));
    }
    if (invoice.DueDate) {
      setDueDate(new Date(invoice.DueDate));
    }
  };

  const handleUpdateInvoice = () => {
    if (!validateForm()) return;
    if (editingInvoice) {
      updateInvoiceMutation.mutate({ ...editingInvoice, ...formData });
    }
  };

  const handleDeleteInvoice = (invoiceID: number) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(invoiceID);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Header breadcrumbs={[{ name: "Invoices", url: "/invoice" }]} />
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Error loading invoices. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header breadcrumbs={[{ name: "Invoices", url: "/invoice" }]} />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ReceiptText
              className="text-pink-600 bg-pink-100 rounded-lg p-1"
              size={36}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Invoice Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage billing and invoices for dormitory services
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingInvoice(null);
                    resetForm();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {editingInvoice ? (
                      <Edit className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                    {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceUsageID">Service Usage ID</Label>
                    <Input
                      id="serviceUsageID"
                      type="number"
                      placeholder="Enter service usage ID"
                      value={formData.ServiceUsageID || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "ServiceUsageID",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className={
                        errors.ServiceUsageID ? "border-destructive" : ""
                      }
                    />
                    {errors.ServiceUsageID && (
                      <p className="text-sm text-destructive">
                        {errors.ServiceUsageID}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Created Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !createdDate && "text-muted-foreground",
                              errors.CreatedDate && "border-destructive",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {createdDate
                              ? format(createdDate, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            fromYear={new Date().getFullYear() - 5}
                            toYear={new Date().getFullYear() + 5}
                            selected={createdDate}
                            onSelect={(date) =>
                              handleDateChange("CreatedDate", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.CreatedDate && (
                        <p className="text-sm text-destructive">
                          {errors.CreatedDate}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground",
                              errors.DueDate && "border-destructive",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            fromYear={new Date().getFullYear() - 5}
                            toYear={new Date().getFullYear() + 5}
                            selected={dueDate}
                            onSelect={(date) =>
                              handleDateChange("DueDate", date)
                            }
                            initialFocus
                            disabled={(date) =>
                              createdDate ? date < createdDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.DueDate && (
                        <p className="text-sm text-destructive">
                          {errors.DueDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Amount</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      placeholder="Enter total amount"
                      value={formData.TotalAmount || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "TotalAmount",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className={errors.TotalAmount ? "border-destructive" : ""}
                    />
                    {errors.TotalAmount && (
                      <p className="text-sm text-destructive">
                        {errors.TotalAmount}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      onClick={
                        editingInvoice
                          ? handleUpdateInvoice
                          : handleCreateInvoice
                      }
                      disabled={
                        createInvoiceMutation.isPending ||
                        updateInvoiceMutation.isPending
                      }
                      className="flex-1"
                    >
                      {editingInvoice ? "Update Invoice" : "Create Invoice"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({invoices?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Service Usage ID</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice) => (
                    <TableRow key={invoice.InvoiceID}>
                      <TableCell className="font-medium">
                        {invoice.InvoiceID}
                      </TableCell>
                      <TableCell>{invoice.ServiceUsageID}</TableCell>
                      <TableCell>{formatDate(invoice.CreatedDate)}</TableCell>
                      <TableCell>{formatDate(invoice.DueDate)}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.TotalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteInvoice(invoice.InvoiceID)
                            }
                            disabled={deleteInvoiceMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
