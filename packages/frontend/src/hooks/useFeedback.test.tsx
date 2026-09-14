import useFeedback from './useFeedback';

const FeedbackComponent = () => {
  const { feedbackAxiosError, feedbackAxiosResponse, feedback } = useFeedback();

  return (
    <div>
      <button
        data-testid="errorButton"
        onClick={() =>
          feedbackAxiosError(new Error('Test Error'), 'Default Error Message')
        }
      >
        Trigger Error
      </button>
      <button
        data-testid="successButton"
        onClick={() =>
          feedbackAxiosResponse(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { data: { message: 'Success' } } as any,
            'Default Success Message',
            'success',
          )
        }
      >
        Trigger Success
      </button>
      <button
        data-testid="customFeedbackButton"
        onClick={() => feedback('Custom Feedback', 'info')}
      >
        Trigger Custom Feedback
      </button>
    </div>
  );
};

export default FeedbackComponent;
