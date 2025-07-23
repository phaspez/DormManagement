/**
 * Helper function to trigger a file download from an API response
 * @param response - The response from an API call (e.g., from exportStudentsExcel)
 * @param defaultFileName - Default filename to use if not provided in Content-Disposition
 * @param fileType - MIME type of the file (e.g., 'application/vnd.ms-excel')
 */
export const downloadFileFromResponse = async (
  response: Response,
  defaultFileName: string,
  fileType: string,
): Promise<void> => {
  try {
    // Get the blob from the response
    const blob = await response.clone().blob();

    // Try to get filename from Content-Disposition header if available
    let filename = defaultFileName;
    const contentDisposition = response.headers.get("Content-Disposition");

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }

    // Create a blob URL
    const blobUrl = window.URL.createObjectURL(
      new Blob([blob], { type: fileType }),
    );

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};
