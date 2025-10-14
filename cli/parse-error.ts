export const getMessageFromError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};
