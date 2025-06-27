import { Alert, AlertDescription, AlertTitle } from './alert';

interface ApiErrorAlertProps {
  message: string;
  isVisible: boolean;
}

export const ApiErrorAlert = ({ message, isVisible }: ApiErrorAlertProps) => {
  if (!isVisible) return null;

  return (
    <Alert variant="destructive" className="bg-red-900 border-red-700">
      <AlertTitle className="text-white">Error</AlertTitle>
      <AlertDescription className="text-white">
        {message}
      </AlertDescription>
    </Alert>
  );
}; 