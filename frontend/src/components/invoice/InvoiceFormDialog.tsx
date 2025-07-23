import React from "react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Edit, Plus, CalendarIcon, X } from "lucide-react";

interface FormErrors {
  //ServiceUsageID?: string;
  CreatedDate?: string;
  DueDate?: string;
}

interface InvoiceFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  createdDate: Date | undefined;
  setCreatedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  dueDate: Date | undefined;
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  editingInvoice: any;
  resetForm: () => void;
  triggerButton?: React.ReactNode;
}

export default function InvoiceFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  formData,
  setFormData,
  errors,
  setErrors,
  createdDate,
  setCreatedDate,
  dueDate,
  setDueDate,
  editingInvoice,
  resetForm,
  triggerButton,
}: InvoiceFormDialogProps) {
  // Handlers
  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (
    field: "CreatedDate" | "DueDate",
    date: Date | undefined,
  ) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setFormData((prev: any) => ({
        ...prev,
        [field]: formattedDate,
      }));
      if (field === "CreatedDate") {
        setCreatedDate(date);
      } else {
        setDueDate(date);
      }
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = !!formData.CreatedDate && !!formData.DueDate;

  const defaultTriggerButton = (
    <Button
      className="flex items-center gap-2"
      onClick={() => {
        setFormData({
          //ServiceUsageID: 0,
          CreatedDate: "",
          DueDate: "",
        });
        setErrors({});
        setCreatedDate(undefined);
        setDueDate(undefined);
      }}
    >
      <Plus className="h-4 w-4" />
      Create New Invoice
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || defaultTriggerButton}
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
          {/*<div className="space-y-2">*/}
          {/*  <Label htmlFor="serviceUsageID">Service Usage ID</Label>*/}
          {/*  <Input*/}
          {/*    id="serviceUsageID"*/}
          {/*    type="number"*/}
          {/*    placeholder="Enter service usage ID"*/}
          {/*    value={formData.ServiceUsageID || ""}*/}
          {/*    onChange={(e) =>*/}
          {/*      handleInputChange(*/}
          {/*        "ServiceUsageID",*/}
          {/*        parseInt(e.target.value) || 0,*/}
          {/*      )*/}
          {/*    }*/}
          {/*    className={errors.ServiceUsageID ? "border-destructive" : ""}*/}
          {/*  />*/}
          {/*  {errors.ServiceUsageID && (*/}
          {/*    <p className="text-sm text-destructive">*/}
          {/*      {errors.ServiceUsageID}*/}
          {/*    </p>*/}
          {/*  )}*/}
          {/*</div>*/}

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
                    {createdDate ? format(createdDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear() - 5}
                    toYear={new Date().getFullYear() + 5}
                    selected={createdDate}
                    onSelect={(date) => handleDateChange("CreatedDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.CreatedDate && (
                <p className="text-sm text-destructive">{errors.CreatedDate}</p>
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
                    onSelect={(date) => handleDateChange("DueDate", date)}
                    initialFocus
                    disabled={(date) =>
                      createdDate ? date < createdDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.DueDate && (
                <p className="text-sm text-destructive">{errors.DueDate}</p>
              )}
            </div>
          </div>
          <p className="text-sm">
            Total amount will be calculated accordingly.
          </p>

          <Separator />

          <div className="flex gap-2">
            <Button
              onClick={onSubmit}
              disabled={isLoading || !isFormValid}
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
  );
}
