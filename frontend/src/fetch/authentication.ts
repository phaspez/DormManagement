import { handleResponse, Paginated } from "~/fetch/utils";

export interface SuccessfulLogin {
  UserID: number;
  Username: string;
  message: string;
}

export async function login(username: string, password: string) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
      {
        method: "POST",
      },
    );

    const data = await handleResponse(response);
    return data as SuccessfulLogin;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}
