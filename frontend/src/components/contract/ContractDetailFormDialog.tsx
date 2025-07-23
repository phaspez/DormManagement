import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Edit, Plus, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  postServiceUsage,
  putServiceUsage,
  ServiceUsage,
} from "~/fetch/serviceUsage";
import { getServices } from "~/fetch/service";
import { toast } from "sonner";

interface ServiceUsageDialogProps {
  contractId?: string;
  invoiceId?: string;
  editingServiceUsage?: ServiceUsage | null;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

interface FormErrors {
  ServiceID?: string;
  Quantity?: string;
  UsageMonth?: string;
  UsageYear?: string;
  InvoiceID?: string;
}

export default function ServiceUsageDialog({
  contractId,
  invoiceId,
  editingServiceUsage = null,
  onSuccess,
  trigger,
}: ServiceUsageDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

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

  const [formData, setFormData] = useState<
    Omit<ServiceUsage, "ServiceUsageID">
  >({
    InvoiceID: invoiceId ? parseInt(invoiceId) : 0,
    ContractID: contractId ? parseInt(contractId) : 0,
    ServiceID: 0,
    Quantity: 0,
    UsageMonth: new Date().getMonth() + 1,
    UsageYear: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch services for the dropdown
  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryFn: getServices,
    queryKey: ["services"],
  });

  // Mutations for adding/editing service usage
  const createServiceUsageMutation = useMutation({
    mutationFn: postServiceUsage,
    onSuccess: () => {
      if (contractId) {
        queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      }
      if (invoiceId) {
        queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
      }
      toast.success("Service usage added successfully");
      resetForm();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to add service usage");
      console.error("Error creating service usage:", error);
    },
  });

  const updateServiceUsageMutation = useMutation({
    mutationFn: putServiceUsage,
    onSuccess: () => {
      if (contractId) {
        queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      }
      if (invoiceId) {
        queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
      }
      toast.success("Service usage updated successfully");
      resetForm();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update service usage");
      console.error("Error updating service usage:", error);
    },
  });

  // Set form data when editing
  React.useEffect(() => {
    if (editingServiceUsage) {
      setFormData({
        InvoiceID: editingServiceUsage.InvoiceID,
        ContractID: editingServiceUsage.ContractID,
        ServiceID: editingServiceUsage.ServiceID,
        Quantity: editingServiceUsage.Quantity,
        UsageMonth: editingServiceUsage.UsageMonth,
        UsageYear: editingServiceUsage.UsageYear,
      });
    } else {
      // Default to current contract/invoice ID when adding new
      setFormData((prev) => ({
        ...prev,
        ContractID: contractId ? parseInt(contractId) : 0,
        InvoiceID: invoiceId ? parseInt(invoiceId) : 0,
      }));
    }
  }, [editingServiceUsage, contractId, invoiceId, isOpen]);

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
      InvoiceID: invoiceId ? parseInt(invoiceId) : 0,
      ContractID: contractId ? parseInt(contractId) : 0,
      ServiceID: 0,
      Quantity: 0,
      UsageMonth: new Date().getMonth() + 1,
      UsageYear: new Date().getFullYear(),
    });
    setErrors({});
    setIsOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    // Only validate InvoiceID if we're not in invoice context (where it's auto-filled)
    if (!invoiceId && formData.InvoiceID <= 0) {
      newErrors.InvoiceID = "Please enter a valid Invoice ID";
    }

    // Only validate ContractID if we're not in contract context (where it's auto-filled)
    if (!contractId && formData.ContractID <= 0) {
      newErrors.InvoiceID = "Please enter a valid Contract ID";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingServiceUsage) {
      updateServiceUsageMutation.mutate({
        ...editingServiceUsage,
        ...formData,
        ContractID: contractId ? parseInt(contractId) : formData.ContractID,
        InvoiceID: invoiceId ? parseInt(invoiceId) : formData.InvoiceID,
      });
    } else {
      createServiceUsageMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Service Usage
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingServiceUsage ? (
              <Edit className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {editingServiceUsage ? "Edit Service Usage" : "Add Service Usage"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceID">Service</Label>
            <Select
              value={formData.ServiceID ? formData.ServiceID.toString() : ""}
              onValueChange={(value) =>
                handleInputChange("ServiceID", parseInt(value))
              }
              disabled={isServicesLoading}
            >
              <SelectTrigger
                className={errors.ServiceID ? "border-destructive" : ""}
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
              <p className="text-sm text-destructive">{errors.ServiceID}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity used"
              value={formData.Quantity || ""}
              onChange={(e) =>
                handleInputChange("Quantity", parseInt(e.target.value) || 0)
              }
              className={errors.Quantity ? "border-destructive" : ""}
            />
            {errors.Quantity && (
              <p className="text-sm text-destructive">{errors.Quantity}</p>
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
                  className={errors.UsageMonth ? "border-destructive" : ""}
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
                <p className="text-sm text-destructive">{errors.UsageMonth}</p>
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
                  className={errors.UsageYear ? "border-destructive" : ""}
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
                <p className="text-sm text-destructive">{errors.UsageYear}</p>
              )}
            </div>
          </div>

          {/* Contract ID field - only show when in invoice context */}
          {invoiceId && (
            <div className="space-y-2">
              <Label htmlFor="contractId">Contract ID</Label>
              <Input
                id="contractId"
                type="number"
                placeholder="Enter Contract ID"
                value={formData.ContractID || ""}
                onChange={(e) =>
                  handleInputChange("ContractID", parseInt(e.target.value) || 0)
                }
                className={errors.InvoiceID ? "border-destructive" : ""}
              />
              {errors.InvoiceID && (
                <p className="text-sm text-destructive">
                  Please enter a valid Contract ID
                </p>
              )}
            </div>
          )}

          {/* Invoice ID field - only show when in contract context */}
          {contractId && (
            <div className="space-y-2">
              <Label htmlFor="invoiceId">Invoice ID</Label>
              <Input
                id="invoiceId"
                type="number"
                placeholder="Enter Invoice ID"
                value={formData.InvoiceID || ""}
                onChange={(e) =>
                  handleInputChange("InvoiceID", parseInt(e.target.value) || 0)
                }
                className={errors.InvoiceID ? "border-destructive" : ""}
              />
              {errors.InvoiceID && (
                <p className="text-sm text-destructive">{errors.InvoiceID}</p>
              )}
            </div>
          )}

          {/* Show both fields when editing existing service usage */}
          {editingServiceUsage && !contractId && !invoiceId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contractId">Contract ID</Label>
                <Input
                  id="contractId"
                  type="number"
                  placeholder="Enter Contract ID"
                  value={formData.ContractID || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "ContractID",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceId">Invoice ID</Label>
                <Input
                  id="invoiceId"
                  type="number"
                  placeholder="Enter Invoice ID"
                  value={formData.InvoiceID || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "InvoiceID",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className={errors.InvoiceID ? "border-destructive" : ""}
                />
                {errors.InvoiceID && (
                  <p className="text-sm text-destructive">{errors.InvoiceID}</p>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
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
  );
}
