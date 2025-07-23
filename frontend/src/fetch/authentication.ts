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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    const data = await handleResponse(response);
    return data as SuccessfulLogin;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
      {
        method: "POST",
      },
    );

    await handleResponse(response);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}
