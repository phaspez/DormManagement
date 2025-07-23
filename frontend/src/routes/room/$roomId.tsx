import { createFileRoute } from "@tanstack/react-router";
import Header from "~/components/header";
import React, { useEffect, useState } from "react";
import { getRoomsByID, putRoom, Room, RoomDetails } from "~/fetch/room";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Edit, HomeIcon, UsersIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import RoomFormDialog from "~/components/room/RoomFormDialog";
import { getRoomTypes } from "~/fetch/roomType";
import { useMutation } from "@tanstack/react-query";
import { Progress } from "~/components/ui/progress";

export const Route = createFileRoute("/room/$roomId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  // Fetch room types
  useEffect(() => {
    getRoomTypes().then(setRoomTypes);
  }, []);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);
        const roomData = await getRoomsByID(Number(roomId));
        const students = Array.isArray(roomData.Students)
          ? roomData.Students
          : roomData.Students
            ? [roomData.Students]
            : [];
        setRoom({
          ...roomData,
          Students: students,
        } as RoomDetails);
        // Pre-fill formData for editing
        setFormData({
          RoomTypeID: roomData.RoomTypeID,
          RoomNumber: roomData.RoomNumber,
          MaxOccupancy: roomData.MaxOccupancy,
          Status: roomData.Status,
        });
      } catch (err) {
        console.error("Error fetching room details:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomDetails();
  }, [roomId]);

  // Mutation for updating room
  const updateRoomMutation = useMutation({
    mutationFn: async (updatedRoom: any) => {
      await putRoom({ ...room, ...updatedRoom });
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      window.location.reload();
    },
  });

  // Handlers
  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.RoomNumber?.trim())
      newErrors.RoomNumber = "Room number is required";
    if (!formData.RoomTypeID || formData.RoomTypeID <= 0)
      newErrors.RoomTypeID = "Please select a room type";
    if (!formData.MaxOccupancy || formData.MaxOccupancy <= 0)
      newErrors.MaxOccupancy = "Max occupancy must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateRoom = () => {
    if (!validateForm()) return;
    updateRoomMutation.mutate(formData);
  };

  const resetForm = () => {
    setIsEditDialogOpen(false);
    setErrors({});
    if (room) {
      setFormData({
        RoomTypeID: room.RoomTypeID,
        RoomNumber: room.RoomNumber,
        MaxOccupancy: room.MaxOccupancy,
        Status: room.Status,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "PPP");
    } catch (error) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Header
          breadcrumbs={[
            { name: "Rooms", url: "/room" },
            {
              name: `Room ${roomId}`,
              url: `/room/${roomId}`,
            },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-muted-foreground">
            Loading room details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Header
          breadcrumbs={[
            { name: "Rooms", url: "/room" },
            {
              name: `Room ${roomId}`,
              url: `/room/${roomId}`,
            },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-red-500">
            Error loading room: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="w-full">
        <Header
          breadcrumbs={[
            { name: "Rooms", url: "/room" },
            {
              name: `Room ${roomId}`,
              url: `/room/${roomId}`,
            },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-muted-foreground">Room not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header
        breadcrumbs={[
          { name: "Rooms", url: "/room" },
          {
            name: `Room ${room?.RoomNumber ?? roomId}`,
            url: `/room/${roomId}`,
          },
        ]}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Details</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit className="h-4 w-4" />
          Edit Room
        </Button>
      </div>
      <RoomFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingRoom={room}
        roomTypes={roomTypes}
        formData={formData || {}}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        handleInputChange={handleInputChange}
        handleCreateRoom={() => {}}
        handleUpdateRoom={handleUpdateRoom}
        resetForm={resetForm}
        createRoomMutation={{ isPending: false }}
        updateRoomMutation={updateRoomMutation}
        showCreateNewButton={false}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Room Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm font-medium">Room ID:</p>
              <p className="text-sm">{room.RoomID}</p>

              <p className="text-sm font-medium">Room Number:</p>
              <p className="text-sm">{room.RoomNumber}</p>

              <p className="text-sm font-medium">Room Type ID:</p>
              <p className="text-sm">{room.RoomTypeID}</p>

              <p className="text-sm font-medium">Occupancy:</p>
              <span className="flex items-center gap-2">
                <p className="text-sm min-w-max">
                  {room.CurrentOccupancy} / {room.MaxOccupancy}
                </p>
                <Progress
                  value={(room.CurrentOccupancy / room.MaxOccupancy) * 100}
                />
              </span>

              <p className="text-sm font-medium">Status:</p>
              <div className="text-sm">
                <Badge
                  variant={
                    room.Status === "Available" ? "default" : "secondary"
                  }
                  className={
                    room.Status === "Available"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }
                >
                  {room.Status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Occupancy
            </CardTitle>
            <CardDescription>
              Current occupants and their contract details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {room.Students && room.Students.length > 0 ? (
              <div className="space-y-4">
                {room.Students.map((student, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <h5 className="text-lg font-medium">
                          {student.FullName}
                        </h5>
                        <span className="text-xs text-muted-foreground">
                          ID: {student.StudentID}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">From</p>
                          <p>{formatDate(student.StartDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">To</p>
                          <p>{formatDate(student.EndDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No students currently assigned to this room.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
