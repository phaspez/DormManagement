import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Trash2, Edit, ReceiptText, Info, Download } from "lucide-react";
import Header from "~/components/header";
import {
  deleteInvoice,
  getInvoices,
  postInvoice,
  putInvoice,
  Invoice,
  exportInvoicesExcel,
} from "~/fetch/invoice";
import { format } from "date-fns";
import TableSkeleton from "~/components/TableSkeleton";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PaginationNav } from "~/components/ui/pagination-nav";
import { Paginated } from "~/fetch/utils";
import InvoiceFormDialog from "~/components/invoice/InvoiceFormDialog";
import { exportContractsExcel } from "~/fetch/contract";

export const Route = createFileRoute("/invoice/")({
  component: InvoiceManagement,
});

interface FormErrors {
  //ServiceUsageID?: string;
  CreatedDate?: string;
  DueDate?: string;
}

export default function InvoiceManagement() {
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch invoices with pagination
  const {
    data: invoicesDataRaw,
    isLoading,
    isError,
  } = useQuery({
    queryFn: () => getInvoices(page, limit),
    queryKey: ["invoices", page, limit],
  });

  // Type guard for invoicesData
  const invoicesData: Paginated<Invoice> =
    invoicesDataRaw &&
    typeof invoicesDataRaw === "object" &&
    "items" in invoicesDataRaw &&
    "total" in invoicesDataRaw
      ? (invoicesDataRaw as Paginated<Invoice>)
      : { items: [], total: 0, page: 1, size: limit, pages: 0 };

  const invoices: Invoice[] = invoicesData.items;
  const total = invoicesData.total;

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
  const [formData, setFormData] = useState({
    //ServiceUsageID: 0,
    CreatedDate: new Date().toISOString().split("T")[0],
    DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
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

    // if (formData.ServiceUsageID <= 0) {
    //   newErrors.ServiceUsageID = "Service usage ID must be greater than 0";
    // }

    if (!formData.CreatedDate) {
      newErrors.CreatedDate = "Created date is required";
    }

    if (!formData.DueDate) {
      newErrors.DueDate = "Due date is required";
    } else if (new Date(formData.DueDate) <= new Date(formData.CreatedDate)) {
      newErrors.DueDate = "Due date must be after created date";
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
      //ServiceUsageID: 0,
      CreatedDate: today.toISOString().split("T")[0],
      DueDate: thirtyDaysLater.toISOString().split("T")[0],
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
      //ServiceUsageID: invoice.ServiceUsageID,
      CreatedDate: invoice.CreatedDate.split("T")[0],
      DueDate: invoice.DueDate.split("T")[0],
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
            <InvoiceFormDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSubmit={
                editingInvoice ? handleUpdateInvoice : handleCreateInvoice
              }
              isLoading={
                createInvoiceMutation.isPending ||
                updateInvoiceMutation.isPending
              }
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              createdDate={createdDate}
              setCreatedDate={setCreatedDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              editingInvoice={editingInvoice}
              resetForm={resetForm}
            />
            <Button onClick={exportInvoicesExcel}>
              <Download />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({invoices?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div />
            <div className="flex items-center gap-2">
              <label
                htmlFor="page-size"
                className="text-sm text-muted-foreground"
              >
                Rows per page:
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  const newLimit = Number(val);
                  setLimit(newLimit);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8" id="page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                    {/*<TableHead>Service Usage ID</TableHead>*/}
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
                      {/*<TableCell>{invoice.ServiceUsageID}</TableCell>*/}
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
                          <Link
                            to={"/invoice/$invoiceId"}
                            params={{ invoiceId: invoice.InvoiceID.toString() }}
                          >
                            <Button
                              variant={"secondary"}
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Info />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center">
            <PaginationNav
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
