import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { BaseContract, Contract } from "~/fetch/contract";
import { searchRooms, RoomSearchResult } from "~/fetch/room";
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
import { Separator } from "~/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import {
  Edit,
  FileText,
  CalendarIcon,
  X,
  Plus,
  SearchIcon,
  CheckIcon,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

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
  formData: BaseContract;
  setFormData: React.Dispatch<React.SetStateAction<BaseContract>>;
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

  // State for room search
  const [roomSearchInput, setRoomSearchInput] = useState("");
  const [roomSearchResults, setRoomSearchResults] = useState<
    RoomSearchResult[]
  >([]);
  const [roomSearchLoading, setRoomSearchLoading] = useState(false);
  const [roomPopoverOpen, setRoomPopoverOpen] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("");

  // Effect to search rooms as user types
  useEffect(() => {
    let active = true;
    if (roomSearchInput.length > 0) {
      setRoomSearchLoading(true);
      searchRooms(roomSearchInput)
        .then((results) => {
          if (active) setRoomSearchResults(results);
        })
        .catch(() => {
          if (active) setRoomSearchResults([]);
        })
        .finally(() => {
          if (active) setRoomSearchLoading(false);
        });
    } else {
      setRoomSearchResults([]);
    }
    return () => {
      active = false;
    };
  }, [roomSearchInput]);

  // Effect to set the selected room number when editing a contract
  useEffect(() => {
    if (editingContract && formData.RoomID) {
      const room = rooms.find((r) => r.RoomID === formData.RoomID);
      if (room) {
        setSelectedRoomNumber(room.RoomNumber);
      }
    }
  }, [editingContract, formData.RoomID, rooms]);

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

  // Check if all required fields are filled
  const isFormValid =
    !!formData.StudentID &&
    !!formData.RoomID &&
    !!formData.StartDate &&
    !!formData.EndDate;

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
              <Popover open={roomPopoverOpen} onOpenChange={setRoomPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={roomPopoverOpen}
                    className={cn(
                      "w-full justify-between",
                      errors.RoomID && "border-destructive",
                      !selectedRoomNumber && "text-muted-foreground",
                    )}
                  >
                    {selectedRoomNumber || "Search for a room..."}
                    <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  avoidCollisions={true}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  style={{
                    maxHeight: "200px",
                    width: "var(--radix-popover-trigger-width)",
                  }}
                >
                  <Command>
                    <CommandInput
                      placeholder="Search room number..."
                      value={roomSearchInput}
                      onValueChange={setRoomSearchInput}
                    />
                    <CommandList className="max-h-[150px] overflow-y-auto">
                      {roomSearchLoading ? (
                        <CommandEmpty>Searching rooms...</CommandEmpty>
                      ) : (
                        <>
                          {roomSearchResults.length === 0 && (
                            <CommandEmpty>No rooms found.</CommandEmpty>
                          )}
                          <CommandGroup>
                            {roomSearchResults.map((room) => (
                              <CommandItem
                                key={room.RoomID}
                                value={room.RoomNumber}
                                onSelect={(value) => {
                                  handleInputChange("RoomID", room.RoomID);
                                  setSelectedRoomNumber(room.RoomNumber);
                                  setRoomSearchInput("");
                                  setRoomPopoverOpen(false);
                                }}
                                className="w-full"
                              >
                                <span>{room.RoomNumber}</span>
                                <span className="ml-2 text-muted-foreground">
                                  ID: {room.RoomID}
                                </span>
                                {formData.RoomID === room.RoomID && (
                                  <CheckIcon className="ml-auto h-4 w-4" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
            <Button
              onClick={onSubmit}
              disabled={isLoading || !isFormValid}
              className="flex-1"
            >
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
