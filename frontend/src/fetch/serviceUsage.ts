import { handleResponse, Paginated } from "~/fetch/utils";

export interface ServiceUsage {
  ContractID: number;
  ServiceID: number;
  InvoiceID: number;
  Quantity: number;
  UsageMonth: number;
  UsageYear: number;
  ServiceUsageID: number;
}

export interface ServiceUsageWithName extends ServiceUsage {
  ServiceName: string;
  UnitPrice: number;
}

export async function getServiceUsages(page: number = 1, size: number = 20) {
  try {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append("page", page.toString());
    if (size !== undefined) queryParams.append("size", size.toString());
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL +
        `/serviceusages?${queryParams.toString()}`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Paginated<ServiceUsage>;
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

export async function exportServiceUsagesExcel() {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/serviceusages/export/excel",
      {
        method: "GET",
      },
    );

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "service_usages.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting students to Excel:", error);
  }
}
