import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Contract } from "~/fetch/contract";
import { Room } from "~/fetch/room";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Edit, FileText, CalendarIcon, X, Plus } from "lucide-react";

interface FormErrors {
  StudentID?: string;
  RoomID?: string;
  StartDate?: string;
  EndDate?: string;
}

interface ContractFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
  formData: Omit<Contract, "ContractID">;
  setFormData: React.Dispatch<
    React.SetStateAction<Omit<Contract, "ContractID">>
  >;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  endDate: Date | undefined;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  rooms?: Room[];
  editingContract: Contract | null;
  resetForm: () => void;
  triggerButton?: React.ReactNode;
}

export default function ContractFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  formData,
  setFormData,
  errors,
  setErrors,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  rooms = [],
  editingContract,
  resetForm,
  triggerButton,
}: ContractFormDialogProps) {
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
    field: "StartDate" | "EndDate",
    date: Date | undefined,
  ) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setFormData((prev) => ({
        ...prev,
        [field]: formattedDate,
      }));

      if (field === "StartDate") {
        setStartDate(date);
      } else {
        setEndDate(date);
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

  // Default trigger button if not provided
  const defaultTriggerButton = (
    <Button
      className="flex items-center gap-2"
      onClick={() => {
        setFormData({
          StudentID: 0,
          RoomID: 0,
          StartDate: "",
          EndDate: "",
        });
        setErrors({});
        setStartDate(undefined);
        setEndDate(undefined);
      }}
    >
      <Plus className="h-4 w-4" />
      Create New Contract
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
            {editingContract ? (
              <Edit className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            {editingContract ? "Edit Contract" : "Create New Contract"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                type="number"
                placeholder="Enter student ID"
                value={formData.StudentID || ""}
                onChange={(e) =>
                  handleInputChange("StudentID", parseInt(e.target.value) || 0)
                }
                className={errors.StudentID ? "border-destructive" : ""}
              />
              {errors.StudentID && (
                <p className="text-sm text-destructive">{errors.StudentID}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomId">Room</Label>
              <Select
                value={formData.RoomID > 0 ? formData.RoomID.toString() : ""}
                onValueChange={(value) =>
                  handleInputChange("RoomID", parseInt(value))
                }
              >
                <SelectTrigger
                  className={errors.RoomID ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms?.map((room) => (
                    <SelectItem
                      key={room.RoomID}
                      value={room.RoomID.toString()}
                    >
                      {room.RoomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.RoomID && (
                <p className="text-sm text-destructive">{errors.RoomID}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                      errors.StartDate && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear() - 5}
                    toYear={new Date().getFullYear() + 5}
                    selected={startDate}
                    onSelect={(date) => handleDateChange("StartDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.StartDate && (
                <p className="text-sm text-destructive">{errors.StartDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                      errors.EndDate && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear() - 5}
                    toYear={new Date().getFullYear() + 5}
                    selected={endDate}
                    onSelect={(date) => handleDateChange("EndDate", date)}
                    initialFocus
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
              {errors.EndDate && (
                <p className="text-sm text-destructive">{errors.EndDate}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={isLoading} className="flex-1">
              {editingContract ? "Update Contract" : "Create Contract"}
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
