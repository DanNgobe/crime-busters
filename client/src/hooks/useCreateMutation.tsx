import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";
import axiosInstance from "../utils/axiosInstance";

interface CreateMutationOptions {
  resource: string;
  invalidateKeys?: string[];
  onSuccessMessage?: string;
  onSuccessCallback?: () => void;
  contentType?: string;
}

export const useCreateMutation = ({
  resource,
  invalidateKeys,
  contentType,
  onSuccessMessage,
  onSuccessCallback,
}: CreateMutationOptions) => {
  const queryClient = useQueryClient();

  const { showToast } = useToast();

  contentType = contentType || "application/json";
  const ContentType =
    contentType === "empty" ? {} : { "Content-Type": contentType };

  return useMutation({
    mutationFn: async (variables: Record<string, any>) => {
      const response = await axiosInstance.post(
        `/${resource}`,
        contentType === "application/json"
          ? JSON.stringify(variables)
          : variables,
        {
          headers: {
            ...ContentType,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      if (onSuccessMessage) {
        showToast(onSuccessMessage, "success");
      }
      queryClient.invalidateQueries({ queryKey: [resource] });
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },

    onError: (error: any) => {
      showToast(
        error?.response?.data?.message || "Failed to create resource",
        "error"
      );
    },
  });
};
