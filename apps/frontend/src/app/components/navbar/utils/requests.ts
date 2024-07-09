import { HttpMethod } from "../../../types";

export async function postData<T, R = any>(
  data: T,
  url: string,
  httpMethod: HttpMethod
): Promise<R> {
  const response = await fetch(url, {
    method: httpMethod,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || "Unknown error occurred";
    } catch {
      errorMessage = "Failed to parse error message";
    }
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
  }

  return response.json();
}
