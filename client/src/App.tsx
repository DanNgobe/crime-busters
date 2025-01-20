import { useGetQuery } from './hooks';

type MessagePayload = {
  message: string;
};

const App = () => {
  const { data, isError, isLoading } = useGetQuery<MessagePayload>({
    resource: '',
  });

  const message = data?.message;

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error fetching message</p>}
      {message && <p>The server says: {message}</p>}
      {!isLoading && !isError && !message && <p>No message yet</p>}
    </div>
  );
};

export default App;
