import { redirect } from "@tanstack/react-router";

// This function should only be used for client-side checks
export function requireAuth({ location }: { location: any }) {
  if (typeof window === "undefined") {
    // During SSR, we can't check localStorage, so we allow the request to proceed
    // The actual auth check will happen on the client side
    return;
  }

  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  }
}

// Helper hook for client-side authentication
export function useRequireAuth() {
  return { isAuthenticated: true }; // This is now handled by AuthContext
}
