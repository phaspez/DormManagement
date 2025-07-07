import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteServiceUsage,
  getServiceUsages,
  postServiceUsage,
  putServiceUsage,
  ServiceUsage,
} from "~/fetch/serviceUsage";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import {
  Trash2,
  Edit,
  Plus,
  X,
  Bath,
  MonitorCog,
  CircleGauge,
} from "lucide-react";
import Header from "~/components/header";
import { Skeleton } from "~/components/ui/skeleton";
import TableSkeleton from "~/components/TableSkeleton";
import { getServices, Service } from "~/fetch/service";
import RoomTypeManagement from "~/routes/roomtype";
import ServiceManagement from "~/routes/service";
import { getContracts, Contract } from "~/fetch/contract";
import { getStudents, Students } from "~/fetch/student";

export const Route = createFileRoute("/serviceusage")({
  component: ServiceUsageManagement,
});

interface FormErrors {
  ContractID?: string;
  ServiceID?: string;
  Quantity?: string;
  UsageMonth?: string;
  UsageYear?: string;
}

export default function ServiceUsageManagement() {
  const queryClient = useQueryClient();

  // Fetch service usages
  const {
    data: serviceUsages,
    isLoading,
    isError,
  } = useQuery({
    queryFn: getServiceUsages,
    queryKey: ["serviceUsages"],
  });

  // Fetch all services for mapping ServiceID to ServiceName
  const {
    data: services,
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useQuery({
    queryFn: getServices,
    queryKey: ["services"],
  });

  // Fetch all contracts for mapping ContractID to StudentID
  const {
    data: contracts,
    isLoading: isContractsLoading,
    isError: isContractsError,
  } = useQuery({
    queryFn: getContracts,
    queryKey: ["contracts"],
  });

  // Fetch all students for mapping StudentID to student names
  const {
    data: students,
    isLoading: isStudentsLoading,
    isError: isStudentsError,
  } = useQuery({
    queryFn: getStudents,
    queryKey: ["students"],
  });

  // Mutations
  const createServiceUsageMutation = useMutation({
    mutationFn: postServiceUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceUsages"] });
      resetForm();
    },
  });

  const updateServiceUsageMutation = useMutation({
    mutationFn: putServiceUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceUsages"] });
      resetForm();
    },
  });

  const deleteServiceUsageMutation = useMutation({
    mutationFn: deleteServiceUsage,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["serviceUsages"] }),
  });

  // State for form inputs
  const [formData, setFormData] = useState<
    Omit<ServiceUsage, "ServiceUsageID">
  >({
    ContractID: 0,
    ServiceID: 0,
    Quantity: 0,
    UsageMonth: new Date().getMonth() + 1, // Current month (1-12)
    UsageYear: new Date().getFullYear(), // Current year
  });
  const [editingServiceUsage, setEditingServiceUsage] =
    useState<ServiceUsage | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Generate month options
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

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.ContractID <= 0) {
      newErrors.ContractID = "Please select a valid contract";
    }

    if (formData.ServiceID <= 0) {
      newErrors.ServiceID = "Please select a valid service";
    }

    if (formData.Quantity <= 0) {
      newErrors.Quantity = "Quantity must be greater than 0";
    }

    if (formData.UsageMonth < 1 || formData.UsageMonth > 12) {
      newErrors.UsageMonth = "Please select a valid month";
    }

    if (formData.UsageYear < 2000 || formData.UsageYear > currentYear + 1) {
      newErrors.UsageYear = "Please select a valid year";
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

  const resetForm = () => {
    setFormData({
      ContractID: 0,
      ServiceID: 0,
      Quantity: 0,
      UsageMonth: new Date().getMonth() + 1,
      UsageYear: new Date().getFullYear(),
    });
    setEditingServiceUsage(null);
    setErrors({});
    setIsCreateDialogOpen(false);
  };

  const handleCreateServiceUsage = () => {
    if (!validateForm()) return;
    createServiceUsageMutation.mutate(formData);
  };

  const handleEditServiceUsage = (serviceUsage: ServiceUsage) => {
    setEditingServiceUsage(serviceUsage);
    setFormData({
      ContractID: serviceUsage.ContractID,
      ServiceID: serviceUsage.ServiceID,
      Quantity: serviceUsage.Quantity,
      UsageMonth: serviceUsage.UsageMonth,
      UsageYear: serviceUsage.UsageYear,
    });
    setErrors({});
    setIsCreateDialogOpen(true);
  };

  const handleUpdateServiceUsage = () => {
    if (!validateForm()) return;
    if (editingServiceUsage) {
      updateServiceUsageMutation.mutate({
        ...editingServiceUsage,
        ...formData,
      });
    }
  };

  const handleDeleteServiceUsage = (serviceUsageID: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this service usage record?",
      )
    ) {
      deleteServiceUsageMutation.mutate(serviceUsageID);
    }
  };

  // Format the period as Month Year
  const formatPeriod = (month: number, year: number) => {
    const monthName = months.find((m) => m.value === month)?.label || month;
    return `${monthName} ${year}`;
  };

  // Function to get student name from contract ID
  const getStudentNameByContractID = (contractID: number): string => {
    if (!contracts || !students) return "Unknown";

    // Find the contract with the given ID
    const contract = contracts.find(
      (c) => parseInt(c.ContractID) === contractID,
    );
    if (!contract) return "Unknown Contract";

    // Find the student associated with the contract
    const student = students.find((s) => s.StudentID === contract.StudentID);
    if (!student) return "Unknown Student";

    return student.FullName;
  };

  if (
    isLoading ||
    isServicesLoading ||
    isContractsLoading ||
    isStudentsLoading
  ) {
    return (
      <div className="w-full">
        <Header
          breadcrumbs={[{ name: "Service Usage", url: "/serviceusage" }]}
        />
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

  if (isError || isServicesError || isContractsError || isStudentsError) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Error loading service usage data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header breadcrumbs={[{ name: "Service Usage", url: "/serviceusage" }]} />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircleGauge
              className="text-orange-600 bg-orange-100 rounded-lg p-1"
              size={36}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Service Usage Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Track and manage service usage by students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingServiceUsage(null);
                    setFormData({
                      ContractID: 0,
                      ServiceID: 0,
                      Quantity: 0,
                      UsageMonth: new Date().getMonth() + 1,
                      UsageYear: new Date().getFullYear(),
                    });
                    setErrors({});
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Service Usage
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {editingServiceUsage ? (
                      <Edit className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                    {editingServiceUsage
                      ? "Edit Service Usage"
                      : "Add Service Usage"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contractID">Contract ID</Label>
                      <Input
                        id="contractID"
                        type="number"
                        placeholder="Enter contract ID"
                        value={formData.ContractID || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "ContractID",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className={
                          errors.ContractID ? "border-destructive" : ""
                        }
                      />
                      {errors.ContractID && (
                        <p className="text-sm text-destructive">
                          {errors.ContractID}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceID">Service</Label>
                      <Select
                        value={
                          formData.ServiceID
                            ? formData.ServiceID.toString()
                            : ""
                        }
                        onValueChange={(value) =>
                          handleInputChange("ServiceID", parseInt(value))
                        }
                        disabled={isServicesLoading || isServicesError}
                      >
                        <SelectTrigger
                          className={
                            errors.ServiceID ? "border-destructive" : ""
                          }
                        >
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services?.map((service) => (
                            <SelectItem
                              key={service.ServiceID}
                              value={service.ServiceID.toString()}
                            >
                              {service.ServiceName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.ServiceID && (
                        <p className="text-sm text-destructive">
                          {errors.ServiceID}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity used"
                      value={formData.Quantity || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "Quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className={errors.Quantity ? "border-destructive" : ""}
                    />
                    {errors.Quantity && (
                      <p className="text-sm text-destructive">
                        {errors.Quantity}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="usageMonth">Month</Label>
                      <Select
                        value={formData.UsageMonth.toString()}
                        onValueChange={(value) =>
                          handleInputChange("UsageMonth", parseInt(value))
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.UsageMonth ? "border-destructive" : ""
                          }
                        >
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem
                              key={month.value}
                              value={month.value.toString()}
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.UsageMonth && (
                        <p className="text-sm text-destructive">
                          {errors.UsageMonth}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usageYear">Year</Label>
                      <Select
                        value={formData.UsageYear.toString()}
                        onValueChange={(value) =>
                          handleInputChange("UsageYear", parseInt(value))
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.UsageYear ? "border-destructive" : ""
                          }
                        >
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.UsageYear && (
                        <p className="text-sm text-destructive">
                          {errors.UsageYear}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      onClick={
                        editingServiceUsage
                          ? handleUpdateServiceUsage
                          : handleCreateServiceUsage
                      }
                      disabled={
                        createServiceUsageMutation.isPending ||
                        updateServiceUsageMutation.isPending
                      }
                      className="flex-1"
                    >
                      {editingServiceUsage ? "Update Record" : "Add Record"}
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <MonitorCog className="h-4 w-4" />
                  Edit Services...
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl lg:max-w-6xl max-w-full">
                <ServiceManagement />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Service Usage List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Service Usage Records ({serviceUsages?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviceUsages?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No service usage records found. Add a new record to get started.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Usage Period</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceUsages?.map((usage) => (
                    <TableRow key={usage.ServiceUsageID}>
                      <TableCell>{usage.ContractID}</TableCell>
                      <TableCell>
                        {getStudentNameByContractID(usage.ContractID)}
                      </TableCell>
                      <TableCell>
                        {
                          services?.find(
                            (service) => service.ServiceID === usage.ServiceID,
                          )?.ServiceName
                        }
                      </TableCell>
                      <TableCell>{usage.Quantity}</TableCell>
                      <TableCell>
                        {formatPeriod(usage.UsageMonth, usage.UsageYear)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditServiceUsage(usage)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteServiceUsage(usage.ServiceUsageID)
                            }
                            disabled={deleteServiceUsageMutation.isPending}
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
