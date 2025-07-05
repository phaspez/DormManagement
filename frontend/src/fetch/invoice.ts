import {handleResponse} from "~/fetch/utils";

export interface Invoice {
    ServiceUsageID: number,
    CreatedDate: string,
    DueDate: string,
    TotalAmount: number,
    InvoiceID: number
}

export async function getInvoices() {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/invoices", {
            method: "GET",
        });

        const data = await handleResponse(response);
        console.log(data);
        return data as Invoice[];
    } catch (error) {
        console.error("Error fetching invoices:", error);
        throw error;
    }
}

export async function getInvoiceByID(invoiceID: number) {
    try {
        const response = await fetch(
            import.meta.env.VITE_BACKEND_URL + `/invoices/${invoiceID}`,
            {
                method: "GET",
            }
        );

        const data = await handleResponse(response);
        console.log(data);
        return data as Invoice;
    } catch (error) {
        console.error("Error fetching invoice by ID:", error);
        throw error;
    }
}

export async function postInvoice(invoice: Omit<Invoice, "InvoiceID">) {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(invoice),
        });

        const data = await handleResponse(response);
        console.log(data);
        return data as Invoice;
    } catch (error) {
        console.error("Error creating invoice:", error);
        throw error;
    }
}

export async function putInvoice(invoice: Invoice) {
    try {
        const response = await fetch(
            import.meta.env.VITE_BACKEND_URL + `/invoices/${invoice.InvoiceID}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(invoice as Omit<Invoice, "InvoiceID">),
            }
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
            }
        );

        const data = await handleResponse(response);
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error deleting invoice:", error);
        throw error;
    }
}