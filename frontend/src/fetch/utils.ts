interface ErrorMessage {
  detail: string;
}

export async function handleResponse(response: Response) {
  if (!response.ok) {
    console.log(response);

    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorJson = (await response
        .clone()
        .json()) as Partial<ErrorMessage>;
      if (errorJson?.detail) {
        errorMessage = `${errorJson.detail}`;
      }
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        }
      } catch {
        // keep default message
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
