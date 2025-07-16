import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Plus, Edit, X } from "lucide-react";
import { RoomStatus } from "~/fetch/room";

export interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRoom: any;
  roomTypes: any[];
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  setErrors: (errors: any) => void;
  handleInputChange: (field: string, value: any) => void;
  handleCreateRoom: () => void;
  handleUpdateRoom: () => void;
  resetForm: () => void;
  createRoomMutation: any;
  updateRoomMutation: any;
  showCreateNewButton?: boolean;
}

const RoomFormDialog: React.FC<RoomFormDialogProps> = ({
  open,
  onOpenChange,
  editingRoom,
  roomTypes,
  formData,
  setFormData,
  errors,
  setErrors,
  handleInputChange,
  handleCreateRoom,
  handleUpdateRoom,
  resetForm,
  createRoomMutation,
  updateRoomMutation,
  showCreateNewButton,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {showCreateNewButton && (
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setFormData({
              RoomTypeID: 0,
              RoomNumber: "",
              MaxOccupancy: 0,
              Status: RoomStatus.Available,
            });
            setErrors({});
          }}
        >
          <Plus className="h-4 w-4" />
          Create New Room
        </Button>
      </DialogTrigger>
    )}
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {editingRoom ? (
            <Edit className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          {editingRoom ? "Edit Room" : "Create New Room"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type</Label>
            <Select
              value={
                formData.RoomTypeID > 0 ? formData.RoomTypeID.toString() : ""
              }
              onValueChange={(value) =>
                handleInputChange("RoomTypeID", parseInt(value))
              }
            >
              <SelectTrigger
                className={errors.RoomTypeID ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes?.map((roomType) => (
                  <SelectItem
                    key={roomType.RoomTypeID}
                    value={roomType.RoomTypeID.toString()}
                  >
                    {roomType.RoomTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.RoomTypeID && (
              <p className="text-sm text-destructive">{errors.RoomTypeID}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              type="text"
              placeholder="e.g., 101, A-201"
              value={formData.RoomNumber}
              onChange={(e) => handleInputChange("RoomNumber", e.target.value)}
              className={errors.RoomNumber ? "border-destructive" : ""}
            />
            {errors.RoomNumber && (
              <p className="text-sm text-destructive">{errors.RoomNumber}</p>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxOccupancy">Max Occupancy</Label>
            <Input
              id="maxOccupancy"
              type="number"
              placeholder="Enter max occupancy"
              value={formData.MaxOccupancy || ""}
              onChange={(e) =>
                handleInputChange("MaxOccupancy", parseInt(e.target.value) || 0)
              }
              className={errors.MaxOccupancy ? "border-destructive" : ""}
            />
            {errors.MaxOccupancy && (
              <p className="text-sm text-destructive">{errors.MaxOccupancy}</p>
            )}
          </div>
          {/*<div className="space-y-2">*/}
          {/*  <Label htmlFor="status">Status</Label>*/}
          {/*  <Select*/}
          {/*    value={formData.Status}*/}
          {/*    onValueChange={(value) =>*/}
          {/*      handleInputChange("Status", value as RoomStatus)*/}
          {/*    }*/}
          {/*  >*/}
          {/*    <SelectTrigger>*/}
          {/*      <SelectValue placeholder="Select status" />*/}
          {/*    </SelectTrigger>*/}
          {/*    <SelectContent>*/}
          {/*      <SelectItem value="Available">Available</SelectItem>*/}
          {/*      <SelectItem value="Full">Full</SelectItem>*/}
          {/*    </SelectContent>*/}
          {/*  </Select>*/}
          {/*</div>*/}
        </div>
        <Separator />
        <div className="flex gap-2">
          <Button
            onClick={editingRoom ? handleUpdateRoom : handleCreateRoom}
            disabled={
              createRoomMutation.isPending || updateRoomMutation.isPending
            }
            className="flex-1"
          >
            {editingRoom ? "Update Room" : "Create Room"}
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

export default RoomFormDialog;
