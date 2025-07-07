import { handleResponse } from "~/fetch/utils";

export interface ServiceUsage {
  ContractID: number;
  ServiceID: number;
  Quantity: number;
  UsageMonth: number;
  UsageYear: number;
  ServiceUsageID: number;
}

export interface ServiceUsageWithName extends ServiceUsage {
  ServiceName: string;
}

export async function getServiceUsages() {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/serviceusages",
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as ServiceUsage[];
  } catch (error) {
    console.error("Error fetching service usages:", error);
    throw error;
  }
}

export async function getServiceUsageByID(serviceUsageID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/serviceusages/${serviceUsageID}`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as ServiceUsage;
  } catch (error) {
    console.error("Error fetching service usage by ID:", error);
    throw error;
  }
}

export async function postServiceUsage(
  serviceUsage: Omit<ServiceUsage, "ServiceUsageID">,
) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/serviceusages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceUsage),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as ServiceUsage;
  } catch (error) {
    console.error("Error creating service usage:", error);
    throw error;
  }
}

export async function putServiceUsage(serviceUsage: ServiceUsage) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL +
        `/serviceusages/${serviceUsage.ServiceUsageID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          serviceUsage as Omit<ServiceUsage, "ServiceUsageID">,
        ),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as ServiceUsage;
  } catch (error) {
    console.error("Error updating service usage:", error);
    throw error;
  }
}

export async function deleteServiceUsage(serviceUsageID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/serviceusages/${serviceUsageID}`,
      {
        method: "DELETE",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error deleting service usage:", error);
    throw error;
  }
}
