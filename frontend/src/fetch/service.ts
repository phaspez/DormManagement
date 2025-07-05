import { handleResponse } from "~/fetch/utils";

export interface Service {
  ServiceName: string;
  UnitPrice: number;
  ServiceID: number;
}

export async function getServices() {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/services",
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Service[];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

export async function getServiceByID(serviceID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/services/${serviceID}`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Service;
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    throw error;
  }
}

export async function postService(service: Omit<Service, "ServiceID">) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/services",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(service),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Service;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}

export async function putService(service: Service) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/services/${service.ServiceID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(service),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Service;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

export async function deleteService(serviceID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/services/${serviceID}`,
      {
        method: "DELETE",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}
