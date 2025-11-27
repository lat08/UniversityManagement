export const isScheduleNotFoundError = (message?: string): boolean => {
  if (!message) return false;
  const notFoundPhrases = ['Không tìm thấy thời khóa biểu', 'không có dữ liệu', 'không có thời khóa biểu'];
  return notFoundPhrases.some(phrase => message.includes(phrase));
};

export const getScheduleErrorMessage = (response: { message?: string }): string | null => {
  return response.message && !isScheduleNotFoundError(response.message) ? response.message : null;
};

export const handleScheduleError = (error: unknown): string | null => {
  const err = error as { response?: { data?: { success?: boolean; message?: string } } };
  if (err?.response?.data?.success === false) {
    return getScheduleErrorMessage(err.response.data);
  }
  return null;
};

