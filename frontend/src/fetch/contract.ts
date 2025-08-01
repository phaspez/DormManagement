import { handleResponse } from "~/fetch/utils";
import { ServiceUsageWithName } from "~/fetch/serviceUsage";
import { Paginated } from "~/fetch/utils";

export interface BaseContract {
  StudentID: number;
  RoomID: number;
  StartDate: string;
  EndDate: string;
}

export interface Contract extends BaseContract {
  RoomNumber: string;
  ContractID: string;
}

export interface ContractDetails extends Contract {
  StudentName: string;
  RoomNumber: string;
  RoomTypeName: string;
  ServiceUsages: ServiceUsageWithName[];
}

export async function getContracts(page: number = 1, size: number = 20) {
  try {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append("page", page.toString());
    if (size !== undefined) queryParams.append("size", size.toString());

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/contracts?${queryParams.toString()}`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(
      `${import.meta.env.VITE_BACKEND_URL}/contracts?${queryParams.toString()}`,
    );
    return data as Paginated<Contract>;
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
}

export async function getContractsByID(contractID: string) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/contracts/${contractID}/details`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as ContractDetails;
  } catch (error) {
    console.error("Error fetching contract by ID:", error);
    throw error;
  }
}

export async function postContract(contract: BaseContract) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/contracts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contract),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Contract;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function putContract(contract: Omit<Contract, "RoomNumber">) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/contracts/${contract.ContractID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contract as BaseContract),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Contract;
  } catch (error) {
    console.error("Error updating contract:", error);
    throw error;
  }
}

export async function deleteContract(contractID: string) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/contracts/${contractID}`,
      {
        method: "DELETE",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Omit<Contract, "RoomNumber">;
  } catch (error) {
    console.error("Error deleting contract:", error);
    throw error;
  }
}

export async function exportContractsExcel() {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/contracts/export/excel",
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contracts.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("Error exporting contracts to Excel:", error);
    throw error;
  }
}
