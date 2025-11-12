export const extractPaymentIdFromQrUrl = (qrUrl: string): string | null => {
  try {
    const url = new URL(qrUrl);
    const desParam = url.searchParams.get('des');
    
    if (!desParam) return null;
    
    if (desParam.startsWith('I ')) {
      return desParam.split(' ')[1];
    }
    
    return desParam;
  } catch {
    return null;
  }
};

