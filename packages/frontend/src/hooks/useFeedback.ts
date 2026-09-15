import { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar, VariantType } from 'notistack';

interface IErrorResponseData {
  error?: string;
}

const useFeedback = (): {
  feedbackAxiosError: (error: unknown, defaultMessage: string) => void;
  feedbackAxiosResponse: <T extends { message?: string }>(
    response: AxiosResponse<T>,
    defaultMessage: string,
    type: VariantType,
  ) => void;
  feedback: (message: string, type: VariantType) => void;
} => {
  const { enqueueSnackbar } = useSnackbar();

  const feedbackAxiosError = (error: unknown, defaultMessage: string): void => {
    const responseData =
      error instanceof AxiosError
        ? (error.response?.data as IErrorResponseData | undefined)
        : undefined;

    enqueueSnackbar(responseData?.error ?? defaultMessage, {
      variant: 'error',
    });
  };

  const feedbackAxiosResponse = <T extends { message?: string }>(
    response: AxiosResponse<T>,
    defaultMessage: string,
    type: VariantType,
  ): void => {
    enqueueSnackbar(response?.data?.message ?? defaultMessage, {
      variant: type,
    });
  };

  const feedback = (message: string, type: VariantType) => {
    enqueueSnackbar(message, {
      variant: type,
    });
  };

  return { feedbackAxiosResponse, feedbackAxiosError, feedback };
};

export default useFeedback;
