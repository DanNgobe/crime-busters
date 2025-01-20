import { notification } from 'antd';

type ToastSeverity = 'error' | 'warning' | 'info' | 'success';

const useToast = () => {
  const showToast = (message: string, severity: ToastSeverity = 'info') => {
    notification[severity]({
      message: severity.charAt(0).toUpperCase() + severity.slice(1), // Capitalize severity
      description: message,
      placement: 'bottomLeft',
      duration: 2.5,
    });
  };

  return { showToast };
};

export default useToast;
