import { handleResponse } from "~/fetch/utils";
import { Paginated } from "~/fetch/utils";

export interface Students {
  FullName: string;
  Gender: string;
  PhoneNumber: string;
  StudentID: number;
}

export async function getStudents(page: number = 1, size: number = 20) {
  try {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append("page", page.toString());
    if (size !== undefined) queryParams.append("size", size.toString());

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/students?${queryParams.toString()}`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Paginated<Students>;
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
      },
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
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/students",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      },
    );

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
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/students/${student.StudentID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      },
    );

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
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/students/${studentID}`,
      {
        method: "DELETE",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}
