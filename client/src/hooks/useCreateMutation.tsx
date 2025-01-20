import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import useToast from './useToast';

interface CreateMutationOptions {
  resource: string;
  invalidateKeys?: string[];
  onSuccessMessage?: string;
  onSucessCallback?: () => void;
  contentType?: string;
}

export const useCreateMutation = ({
  resource,
  invalidateKeys,
  contentType,
  onSuccessMessage,
  onSucessCallback,
}: CreateMutationOptions) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  contentType = contentType || 'application/json';
  const ContentType = contentType === 'empty' ? {} : { 'Content-Type': contentType };

  return useMutation({
    mutationFn: async (variables: Record<string, any>) => {
      const response = await axiosInstance.post(
        `/${resource}`,
        contentType === 'application/json' ? JSON.stringify(variables) : variables,
        {
          headers: {
            ...ContentType,
          },
        },
      );

      if (response.status !== 200) {
        showToast('Failed to create resource', 'error');
        throw new Error('Failed to create resource');
      }
      return response.data;
    },
    onSuccess: () => {
      if (onSuccessMessage) {
        showToast(onSuccessMessage, 'success');
      }
      if (onSucessCallback) {
        onSucessCallback();
      }
      queryClient.invalidateQueries({ queryKey: [resource] });
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    onError: () => {
      showToast('Failed to create resource', 'error');
    },
  });
};
