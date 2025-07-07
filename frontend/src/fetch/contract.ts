import { handleResponse } from "~/fetch/utils";
import { ServiceUsageWithName } from "~/fetch/serviceUsage";

// Extended interface for service usages in contract details
interface ExtendedServiceUsage {
  UsageID: number;
  ServiceName: string;
  Status: string;
  StartDate: string;
  EndDate: string;
  ServiceID?: number;
  ContractID?: string;
}

export interface Contract {
  StudentID: number;
  RoomID: number;
  StartDate: string;
  EndDate: string;
  ContractID: string;
}

export interface ContractDetails extends Contract {
  StudentName: string;
  RoomNumber: string;
  RoomTypeName: string;
  ServiceUsages: ServiceUsageWithName[];
}

export async function getContracts() {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/contracts",
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Contract[];
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

export async function postContract(contract: Omit<Contract, "ContractID">) {
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
    console.error("Error creating contract:", error);
    throw error;
  }
}

export async function putContract(contract: Contract) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/contracts/${contract.ContractID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contract as Omit<Contract, "ContractID">),
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
    return data as Contract;
  } catch (error) {
    console.error("Error deleting contract:", error);
    throw error;
  }
}
