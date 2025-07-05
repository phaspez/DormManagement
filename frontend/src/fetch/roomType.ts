import {handleResponse} from "~/fetch/utils";

export interface RoomType {
    RoomTypeName: string,
    RentPrice: number,
    RoomTypeID: number
}

export async function getRoomTypes() {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/roomtypes", {
            method: "GET",
        })

        const data = await handleResponse(response)
        console.log(data)
        return data as RoomType[]
    } catch (error) {
        console.error("Error fetching rooms types:", error)
        throw error
    }
}

export async function getRoomsByID(roomtypeID: number) {
    try {
        const response = await fetch(
            import.meta.env.VITE_BACKEND_URL + `/roomtypess/${roomtypeID}`,
            {
                method: "GET",
            }
        )

        const data = await handleResponse(response)
        console.log(data)
        return data as RoomType
    } catch (error) {
        console.error("Error fetching room by ID:", error)
        throw error
    }
}

export async function postRoom(room: Omit<RoomType, "RoomTypeID">) {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/roomtypes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(room),
        })

        const data = await handleResponse(response)
        console.log(data)
        return data as RoomType
    } catch (error) {
        console.error("Error creating room:", error)
        throw error
    }
}

export async function putRoomType(roomtype: RoomType) {
    try {
        const response = await fetch(
            import.meta.env.VITE_BACKEND_URL + `/roomtypes/${roomtype.RoomTypeID}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(roomtype as Omit<RoomType, "RoomTypeID">),
            }
        )

        const data = await handleResponse(response)
        console.log(data)
        return data as RoomType
    } catch (error) {
        console.error("Error updating room:", error)
        throw error
    }
}

export async function deleteRoom(roomtypeID: number) {
    try {
        const response = await fetch(
            import.meta.env.VITE_BACKEND_URL + `/roomtypes/${roomtypeID}`,
            {
                method: "DELETE",
            }
        )

        const data = await handleResponse(response)
        console.log(data)
        return data as RoomType
    } catch (error) {
        console.error("Error deleting room:", error)
        throw error
    }
}