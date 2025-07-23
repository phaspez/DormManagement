import { handleResponse, Paginated } from "~/fetch/utils";
import { ServiceUsageWithName } from "~/fetch/serviceUsage";

export interface BaseInvoice {
  //ServiceUsageID: number;
  CreatedDate: string;
  DueDate: string;
}

export interface InvoiceEdit extends BaseInvoice {
  InvoiceID: number;
}

export interface Invoice extends InvoiceEdit {
  TotalAmount: number;
}

export interface InvoiceDetails extends Invoice {
  ServiceUsages: ServiceUsageWithName[];
}

export async function getInvoices(page: number = 1, size: number = 20) {
  try {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append("page", page.toString());
    if (size !== undefined) queryParams.append("size", size.toString());

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/invoices?${queryParams.toString()}`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Paginated<Invoice>;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

export async function getInvoiceByID(invoiceID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/invoices/${invoiceID}/details`,
      {
        method: "GET",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as InvoiceDetails;
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    throw error;
  }
}

export async function postInvoice(invoice: BaseInvoice) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/invoices",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoice),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

export async function putInvoice(invoice: InvoiceEdit) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/invoices/${invoice.InvoiceID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoice as Omit<InvoiceEdit, "InvoiceID">),
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data as Invoice;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
}

export async function deleteInvoice(invoiceID: number) {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/invoices/${invoiceID}`,
      {
        method: "DELETE",
      },
    );

    const data = await handleResponse(response);
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}

export async function exportInvoicesExcel() {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/invoices/export/excel",
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
    a.download = "invoices.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting invoices to Excel:", error);
    throw error;
  }
}
