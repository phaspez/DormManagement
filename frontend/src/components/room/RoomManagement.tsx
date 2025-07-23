import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRoom,
  exportRoomsExcel,
  getRooms,
  postRoom,
  putRoom,
  Room,
  RoomStatus,
} from "~/fetch/room";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { MonitorCog, Hotel, Download } from "lucide-react";
import RoomTypeManagement from "~/routes/roomtype";
import { getRoomTypes } from "~/fetch/roomType";
import Header from "~/components/header";
import { Skeleton } from "~/components/ui/skeleton";
import TableSkeleton from "~/components/TableSkeleton";
import { PaginationNav } from "~/components/ui/pagination-nav";
import { Paginated } from "~/fetch/utils";
import RoomFormDialog from "~/components/room/RoomFormDialog";
import RoomTable from "~/components/room/RoomTable";

interface FormErrors {
  RoomTypeID?: string;
  RoomNumber?: string;
  MaxOccupancy?: string;
}

export default function RoomManagement() {
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch rooms with pagination
  const {
    data: roomsDataRaw,
    isLoading,
    isError,
  } = useQuery({
    queryFn: () => getRooms(page, limit),
    queryKey: ["rooms", page, limit],
  });

  // Type guard for roomsData
  const roomsData: Paginated<Room> =
    roomsDataRaw &&
    typeof roomsDataRaw === "object" &&
    "items" in roomsDataRaw &&
    "total" in roomsDataRaw
      ? (roomsDataRaw as Paginated<Room>)
      : { items: [], total: 0, page: 1, size: limit, pages: 0 };

  const rooms: Room[] = roomsData.items;
  const total = roomsData.total;

  const { data: roomTypes, isLoading: isLoadingRoomTypes } = useQuery({
    queryFn: getRoomTypes,
    queryKey: ["roomTypes"],
  });

  // Find room type name by ID
  const getRoomTypeName = (roomTypeId: number) => {
    const roomType = roomTypes?.find((type) => type.RoomTypeID === roomTypeId);
    return roomType ? roomType.RoomTypeName : `Unknown`;
  };

  // Mutations
  const createRoomMutation = useMutation({
    mutationFn: postRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      resetForm();
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: putRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      resetForm();
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  });

  // State for form inputs
  const [formData, setFormData] = useState<Omit<Room, "RoomID">>({
    RoomTypeID: 0,
    RoomNumber: "",
    MaxOccupancy: 0,
    Status: RoomStatus.Available,
  });
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.RoomNumber.trim()) {
      newErrors.RoomNumber = "Room number is required";
    } else if (formData.RoomNumber.length < 1) {
      newErrors.RoomNumber = "Room number must be at least 1 character";
    }

    if (formData.RoomTypeID <= 0) {
      newErrors.RoomTypeID = "Please select a room type";
    }

    if (formData.MaxOccupancy <= 0) {
      newErrors.MaxOccupancy = "Max occupancy must be greater than 0";
    } else if (formData.MaxOccupancy > 10) {
      newErrors.MaxOccupancy = "Max occupancy cannot exceed 10";
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
      RoomTypeID: 0,
      RoomNumber: "",
      MaxOccupancy: 0,
      Status: RoomStatus.Available,
    });
    setEditingRoom(null);
    setErrors({});
    setIsCreateDialogOpen(false);
  };

  const handleCreateRoom = () => {
    if (!validateForm()) return;
    createRoomMutation.mutate(formData);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      RoomTypeID: room.RoomTypeID,
      RoomNumber: room.RoomNumber,
      MaxOccupancy: room.MaxOccupancy,
      Status: room.Status,
    });
    setErrors({});
    setIsCreateDialogOpen(true);
  };

  const handleUpdateRoom = () => {
    if (!validateForm()) return;
    if (editingRoom) {
      updateRoomMutation.mutate({ ...editingRoom, ...formData });
    }
  };

  const handleDeleteRoom = (roomID: number) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      deleteRoomMutation.mutate(roomID);
    }
  };

  const getStatusBadgeVariant = (status: RoomStatus) => {
    return status === RoomStatus.Available ? "default" : "destructive";
  };

  if (isLoading || isLoadingRoomTypes) {
    return (
      <div className="w-full">
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
            Error loading rooms. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hotel
              className="text-blue-600 bg-blue-100 rounded-lg p-1"
              size={36}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Room Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage dormitory rooms, their types, and availability status
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <RoomFormDialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (open) {
                  setEditingRoom(null);
                  setFormData({
                    RoomTypeID: 0,
                    RoomNumber: "",
                    MaxOccupancy: 0,
                    Status: RoomStatus.Available,
                  });
                  setErrors({});
                }
              }}
              editingRoom={editingRoom}
              roomTypes={roomTypes ?? []}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              handleInputChange={handleInputChange}
              handleCreateRoom={handleCreateRoom}
              handleUpdateRoom={handleUpdateRoom}
              resetForm={resetForm}
              createRoomMutation={createRoomMutation}
              updateRoomMutation={updateRoomMutation}
              showCreateNewButton={true}
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <MonitorCog className="h-4 w-4" />
                  Edit Room Type...
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl lg:max-w-6xl max-w-full">
                <RoomTypeManagement />
              </DialogContent>
            </Dialog>

            <Button onClick={exportRoomsExcel}>
              <Download />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Room List */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms ({total})</CardTitle>
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
          {rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rooms found. Create your first room to get started.
            </div>
          ) : (
            <div className="border rounded-lg">
              <RoomTable
                rooms={rooms}
                getRoomTypeName={getRoomTypeName}
                getStatusBadgeVariant={getStatusBadgeVariant}
                handleEditRoom={handleEditRoom}
                handleDeleteRoom={handleDeleteRoom}
              />
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
    </>
    //</div>
  );
}
