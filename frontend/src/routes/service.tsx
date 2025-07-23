import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteService,
  getServices,
  postService,
  putService,
  Service,
} from "~/fetch/service";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Trash2, Edit, Plus, X, Bath } from "lucide-react";
import Header from "~/components/header";
import { Skeleton } from "~/components/ui/skeleton";
import TableSkeleton from "~/components/TableSkeleton";
import { useAuth } from "~/contexts/AuthContext";

export const Route = createFileRoute("/service")({
  component: ServiceManagement,
});

interface FormErrors {
  ServiceName?: string;
  UnitPrice?: string;
}

export default function ServiceManagement() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch services
  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryFn: getServices,
    queryKey: ["services"],
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: postService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      resetForm();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: putService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      resetForm();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  // State for form inputs
  const [formData, setFormData] = useState<Omit<Service, "ServiceID">>({
    ServiceName: "",
    UnitPrice: 0,
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.ServiceName.trim()) {
      newErrors.ServiceName = "Service name is required";
    } else if (formData.ServiceName.length < 2) {
      newErrors.ServiceName = "Service name must be at least 2 characters";
    }

    if (formData.UnitPrice <= 0) {
      newErrors.UnitPrice = "Unit price must be greater than 0";
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
      ServiceName: "",
      UnitPrice: 0,
    });
    setEditingService(null);
    setErrors({});
    setIsCreateDialogOpen(false);
  };

  const handleCreateService = () => {
    if (!validateForm()) return;
    createServiceMutation.mutate(formData);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      ServiceName: service.ServiceName,
      UnitPrice: service.UnitPrice,
    });
    setErrors({});
    setIsCreateDialogOpen(true);
  };

  const handleUpdateService = () => {
    if (!validateForm()) return;
    if (editingService) {
      updateServiceMutation.mutate({ ...editingService, ...formData });
    }
  };

  const handleDeleteService = (serviceID: number) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteServiceMutation.mutate(serviceID);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <Header breadcrumbs={[{ name: "Services", url: "/service" }]} />
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
            Error loading services. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bath
              className="text-cyan-600 bg-cyan-100 rounded-lg p-1"
              size={36}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Service Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage dormitory services and their details
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
                    setEditingService(null);
                    setFormData({ ServiceName: "", UnitPrice: 0 });
                    setErrors({});
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {editingService ? (
                      <Edit className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                    {editingService ? "Edit Service" : "Create New Service"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input
                      id="serviceName"
                      type="text"
                      placeholder="Enter service name"
                      value={formData.ServiceName}
                      onChange={(e) =>
                        handleInputChange("ServiceName", e.target.value)
                      }
                      className={errors.ServiceName ? "border-destructive" : ""}
                    />
                    {errors.ServiceName && (
                      <p className="text-sm text-destructive">
                        {errors.ServiceName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      placeholder="Enter unit price"
                      value={formData.UnitPrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "UnitPrice",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className={errors.UnitPrice ? "border-destructive" : ""}
                    />
                    {errors.UnitPrice && (
                      <p className="text-sm text-destructive">
                        {errors.UnitPrice}
                      </p>
                    )}
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      onClick={
                        editingService
                          ? handleUpdateService
                          : handleCreateService
                      }
                      disabled={
                        createServiceMutation.isPending ||
                        updateServiceMutation.isPending
                      }
                      className="flex-1"
                    >
                      {editingService ? "Update Service" : "Create Service"}
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

      {/* Service List */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({services?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {services?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No services found. Create your first service to get started.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services?.map((service) => (
                    <TableRow key={service.ServiceID}>
                      <TableCell className="font-medium">
                        {service.ServiceName}
                      </TableCell>
                      <TableCell>${service.UnitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteService(service.ServiceID)
                            }
                            disabled={deleteServiceMutation.isPending}
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
