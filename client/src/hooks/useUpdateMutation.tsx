import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import useToast from './useToast';

interface UpdateMutationOptions {
  resource: string;
  invalidateKeys?: string[];
  onSuccessMessage?: string;
  onSucessCallback?: () => void;
  method?: string;
  contentType?: string;
}

export const useUpdateMutation = ({
  resource,
  invalidateKeys,
  onSuccessMessage,
  method,
  contentType,
  onSucessCallback,
}: UpdateMutationOptions) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  contentType = contentType || 'application/json';
  const ContentType = contentType === 'empty' ? {} : { 'Content-Type': contentType };

  return useMutation({
    mutationFn: async (variables: { id: string | number; data?: Record<string, any> }) => {
      const { id, data } = variables;
      const response = await axiosInstance({
        method: method || 'PUT',
        url: `/${resource}/${id}`,
        data: contentType === 'application/json' ? JSON.stringify(data) : data,
        headers: {
          ...ContentType,
        },
      });

      if (response.status !== 200) {
        showToast('Failed to update resource', 'error');
        throw new Error('Failed to update resource');
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
      showToast('Failed to update resource', 'error');
    },
  });
};
