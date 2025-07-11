import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Edit, Info, Trash2 } from "lucide-react";
import { Room, RoomStatus } from "~/fetch/room";
import { Link } from "@tanstack/react-router";

interface RoomTableProps {
  rooms: Room[];
  getRoomTypeName: (roomTypeId: number) => string;
  getStatusBadgeVariant: (
    status: RoomStatus,
  ) => "default" | "secondary" | "destructive" | "outline" | null | undefined;
  handleEditRoom: (room: Room) => void;
  handleDeleteRoom: (roomID: number) => void;
}

const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  getRoomTypeName,
  getStatusBadgeVariant,
  handleEditRoom,
  handleDeleteRoom,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Room ID</TableHead>
        <TableHead>Room Number</TableHead>
        <TableHead>Room Type</TableHead>
        <TableHead>Max Occupancy</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rooms.map((room: Room) => (
        <TableRow key={room.RoomID}>
          <TableCell className="font-medium">{room.RoomID}</TableCell>
          <TableCell>{room.RoomNumber}</TableCell>
          <TableCell>{getRoomTypeName(room.RoomTypeID)}</TableCell>
          <TableCell>{room.MaxOccupancy}</TableCell>
          <TableCell>
            <Badge variant={getStatusBadgeVariant(room.Status)}>
              {room.Status}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditRoom(room)}
                className="flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteRoom(room.RoomID)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
              <Link
                to="/room/$roomId"
                params={{ roomId: room.RoomID.toString() }}
              >
                <Button size="sm" variant="secondary">
                  <Info />
                </Button>
              </Link>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default RoomTable;
