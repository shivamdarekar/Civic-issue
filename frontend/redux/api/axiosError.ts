import { AxiosError } from "axios";

const handleAxiosError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  return defaultMessage;
};

export { handleAxiosError };