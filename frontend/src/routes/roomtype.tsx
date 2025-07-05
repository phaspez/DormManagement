import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRoom,
  getRoomTypes,
  postRoom,
  putRoomType,
  RoomType,
} from "~/fetch/roomType";
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
import { Trash2, Edit, Plus, X, CircleGauge, Building2 } from "lucide-react";
import Header from "~/components/header";
import { Skeleton } from "~/components/ui/skeleton";
import TableSkeleton from "~/components/TableSkeleton";

export const Route = createFileRoute("/roomtype")({
  component: RoomTypeManagement,
});

interface FormErrors {
  RoomTypeName?: string;
  RentPrice?: string;
}

export default function RoomTypeManagement() {
  const queryClient = useQueryClient();

  // Fetch room types
  const {
    data: roomTypes,
    isLoading,
    isError,
  } = useQuery({
    queryFn: getRoomTypes,
    queryKey: ["roomTypes"],
  });

  // Mutations
  const createRoomTypeMutation = useMutation({
    mutationFn: postRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      resetForm();
    },
  });

  const updateRoomTypeMutation = useMutation({
    mutationFn: putRoomType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      resetForm();
    },
  });

  const deleteRoomTypeMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roomTypes"] }),
  });

  // State for form inputs
  const [formData, setFormData] = useState<Omit<RoomType, "RoomTypeID">>({
    RoomTypeName: "",
    RentPrice: 0,
  });
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.RoomTypeName.trim()) {
      newErrors.RoomTypeName = "Room type name is required";
    } else if (formData.RoomTypeName.length < 2) {
      newErrors.RoomTypeName = "Room type name must be at least 2 characters";
    }

    if (formData.RentPrice <= 0) {
      newErrors.RentPrice = "Rent price must be greater than 0";
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
    setFormData({ RoomTypeName: "", RentPrice: 0 });
    setEditingRoomType(null);
    setErrors({});
    setIsCreateDialogOpen(false);
  };

  const handleCreateRoomType = () => {
    if (!validateForm()) return;
    createRoomTypeMutation.mutate(formData);
  };

  const handleEditRoomType = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setFormData({
      RoomTypeName: roomType.RoomTypeName,
      RentPrice: roomType.RentPrice,
    });
    setErrors({});
    setIsCreateDialogOpen(true);
  };

  const handleUpdateRoomType = () => {
    if (!validateForm()) return;
    if (editingRoomType) {
      updateRoomTypeMutation.mutate({ ...editingRoomType, ...formData });
    }
  };

  const handleDeleteRoomType = (roomTypeID: number) => {
    if (window.confirm("Are you sure you want to delete this room type?")) {
      deleteRoomTypeMutation.mutate(roomTypeID);
    }
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
            Error loading room types. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Building2
            className="text-purple-600 bg-purple-100 rounded-lg p-1"
            size={36}
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Room Type Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and define different types of rooms in the dormitory
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingRoomType(null);
                  setFormData({ RoomTypeName: "", RentPrice: 0 });
                  setErrors({});
                }}
              >
                <Plus className="h-4 w-4" />
                Create New Room Type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingRoomType ? (
                    <Edit className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  {editingRoomType ? "Edit Room Type" : "Create New Room Type"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomTypeName">Room Type Name</Label>
                  <Input
                    id="roomTypeName"
                    type="text"
                    placeholder="e.g., Standard, Deluxe, Suite"
                    value={formData.RoomTypeName}
                    onChange={(e) =>
                      handleInputChange("RoomTypeName", e.target.value)
                    }
                    className={errors.RoomTypeName ? "border-destructive" : ""}
                  />
                  {errors.RoomTypeName && (
                    <p className="text-sm text-destructive">
                      {errors.RoomTypeName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentPrice">Rent Price</Label>
                  <Input
                    id="rentPrice"
                    type="number"
                    placeholder="Enter rent price"
                    value={formData.RentPrice || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "RentPrice",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className={errors.RentPrice ? "border-destructive" : ""}
                  />
                  {errors.RentPrice && (
                    <p className="text-sm text-destructive">
                      {errors.RentPrice}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    onClick={
                      editingRoomType
                        ? handleUpdateRoomType
                        : handleCreateRoomType
                    }
                    disabled={
                      createRoomTypeMutation.isPending ||
                      updateRoomTypeMutation.isPending
                    }
                    className="flex-1"
                  >
                    {editingRoomType ? "Update Room Type" : "Create Room Type"}
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

      {/* Room Type List */}
      <Card>
        <CardHeader>
          <CardTitle>Room Types ({roomTypes?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {roomTypes?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No room types found. Create your first room type to get started.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type ID</TableHead>
                    <TableHead>Room Type Name</TableHead>
                    <TableHead>Rent Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomTypes?.map((roomType) => (
                    <TableRow key={roomType.RoomTypeID}>
                      <TableCell>{roomType.RoomTypeID}</TableCell>
                      <TableCell className="font-medium">
                        {roomType.RoomTypeName}
                      </TableCell>
                      <TableCell>${roomType.RentPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoomType(roomType)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteRoomType(roomType.RoomTypeID)
                            }
                            disabled={deleteRoomTypeMutation.isPending}
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
