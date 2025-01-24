import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axiosInstance from '../utils/axiosInstance';

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
        message.error('Failed to create resource');
        throw new Error('Failed to create resource');
      }
      return response.data;
    },
    onSuccess: () => {
      if (onSuccessMessage) {
        message.success(onSuccessMessage);
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
      message.error('Failed to create resource');
    },
  });
};
