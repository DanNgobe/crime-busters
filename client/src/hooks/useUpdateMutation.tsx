import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";
import axiosInstance from "../utils/axiosInstance";

interface UpdateMutationOptions {
  resource: string;
  invalidateKeys?: string[];
  onSuccessMessage?: string;
  onSuccessCallback?: () => void;
  method?: string;
  contentType?: string;
}

export const useUpdateMutation = ({
  resource,
  invalidateKeys,
  onSuccessMessage,
  method,
  contentType,
  onSuccessCallback,
}: UpdateMutationOptions) => {
  const queryClient = useQueryClient();

  contentType = contentType || "application/json";
  const ContentType =
    contentType === "empty" ? {} : { "Content-Type": contentType };

  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (variables: {
      id: string | number;
      data?: Record<string, any>;
    }) => {
      const { id, data } = variables;
      const response = await axiosInstance({
        method: method || "PUT",
        url: `/${resource}/${id}`,
        data: contentType === "application/json" ? JSON.stringify(data) : data,
        headers: {
          ...ContentType,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      if (onSuccessMessage) {
        showToast(onSuccessMessage, "success");
      }
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      queryClient.invalidateQueries({ queryKey: [resource] });
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    onError: () => {
      showToast("Failed to update resource", "error");
    },
  });
};
