import axios from "axios";

export function scanOperationStatusCode(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function scanOperationResponseDetail(error: unknown) {
  return axios.isAxiosError(error) && typeof error.response?.data === "object"
    ? (error.response.data as { detail?: unknown }).detail
    : undefined;
}

export function scanOperationUncertain(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    (!error.response || error.response.status >= 500)
  );
}
