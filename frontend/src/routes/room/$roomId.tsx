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
import { CalendarIcon, Edit, HomeIcon, UsersIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/room/$roomId")({
  component: RouteComponent,
});

// Update the RoomDetails interface to reflect that Students is an array
interface Student {
  StudentID: number;
  FullName: string;
  StartDate: string;
  EndDate: string;
}

// Override the RoomDetails type locally to ensure Students is treated as an array
interface RoomDetailsWithStudents extends Room {
  Students: Student[];
}

function RouteComponent() {
  const { roomId } = Route.useParams();
  const [room, setRoom] = useState<RoomDetailsWithStudents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);
        const roomData = await getRoomsByID(Number(roomId));

        // Ensure that Students is always treated as an array
        const students = Array.isArray(roomData.Students)
          ? roomData.Students
          : roomData.Students
            ? [roomData.Students]
            : [];

        setRoom({
          ...roomData,
          Students: students,
        } as RoomDetailsWithStudents);
      } catch (err) {
        console.error("Error fetching room details:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

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
            name: `Room ${room.RoomNumber}`,
            url: `/room/${roomId}`,
          },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Details</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() =>
            toast.info("Edit functionality will be implemented soon")
          }
        >
          <Edit className="h-4 w-4" />
          Edit Room
        </Button>
      </div>

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

              <p className="text-sm font-medium">Max Occupancy:</p>
              <p className="text-sm">{room.MaxOccupancy}</p>

              <p className="text-sm font-medium">Status:</p>
              <p className="text-sm">
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
              </p>
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
