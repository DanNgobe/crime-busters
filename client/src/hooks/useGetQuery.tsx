import { useQuery } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";
import axiosInstance from "../utils/axiosInstance";

interface QueryOptions {
  resource: string;
  queryKey?: string;
}

export const useGetQuery = <T,>({ resource, queryKey }: QueryOptions) => {
  const { showToast } = useToast();

  return useQuery<T>({
    queryKey: [queryKey || resource],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/${resource}`);
        return response.data;
      } catch {
        showToast("Failed to fetch data", "error");
        throw new Error("Failed to fetch data");
      }
    },
  });
};
