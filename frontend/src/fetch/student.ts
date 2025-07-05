import {handleResponse} from "~/fetch/utils";

export interface Students {
    FullName: string,
    Gender: string,
    PhoneNumber: string,
    StudentID: number
}

export async function getStudents() {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/students", {
            method: "GET",
        });

        const data = await handleResponse(response);
        console.log(data);
        return data as Students[];
    } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
    }
}

export async function getStudentByID(studentID: number) {
    try {
        const response = await fetch(
            import.meta.env.VITE_BACKEND_URL + `/students/${studentID}`,
            {
                method: "GET",
            }
        );

        const data = await handleResponse(response);
        console.log(data);
        return data as Students;
    } catch (error) {
        console.error("Error fetching student by ID:", error);
        throw error;
    }
}

export async function postStudent(student: Omit<Students, "StudentID">) {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(student),
        });

        const data = await handleResponse(response);
        console.log(data);
        return data as Students;
    } catch (error) {
        console.error("Error creating student:", error);
        throw error;
    }
}

export async function putStudent(student: Students) {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/students/${student.StudentID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(student),
        });

        const data = await handleResponse(response);
        console.log(data);
        return data as Students;
    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
}

export async function deleteStudent(studentID: number) {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/students/${studentID}`, {
            method: "DELETE",
        });

        const data = await handleResponse(response);
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }
}