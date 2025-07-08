import { handleResponse } from "~/fetch/utils";

export enum RoomStatus {
  Available = "Available",
  Full = "Full",
}

export interface Room {
  RoomTypeID: number;
  RoomNumber: string;
  MaxOccupancy: number;
  Status: RoomStatus;
  RoomID: number;
}

export interface RoomDetails extends Room {
  Students: {
    StudentID: number;
    FullName: string;
    StartDate: string;
    EndDate: string;
  };
}

export async function getRooms() {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/rooms", {
      method: "GET",
    });

    const data = await handleResponse(response);
    console.log(data);
    return data as Room[];
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

export async function getRoomsByID(roomID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/rooms/${roomID}/details`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as RoomDetails;
  } catch (error) {
    console.error("Error fetching room by ID:", error);
    throw error;
  }
}

export async function postRoom(room: Omit<Room, "RoomID">) {
  try {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(room),
    });

    const data = await handleResponse(response);
    console.log(data);
    return data as Room;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}

export async function putRoom(room: Room) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/rooms/${room.RoomID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(room as Omit<Room, "RoomID">),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Room;
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
}

export async function deleteRoom(roomID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/rooms/${roomID}`,
      {
        method: "DELETE",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Room;
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
}
