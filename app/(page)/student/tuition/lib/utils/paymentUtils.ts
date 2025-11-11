export function extractPaymentIdFromQrUrl(qrUrl: string): string | null {
  try {
    const url = new URL(qrUrl);
    const desParam = url.searchParams.get('des');
    
    if (!desParam) return null;
    
    // Nếu là insurance payment, content có format "I {PaymentId}"
    if (desParam.startsWith('I ')) {
      return desParam.split(' ')[1];
    }
    
    // Nếu là enrollment payment, content chính là PaymentId
    return desParam;
  } catch (error) {
    console.error('Error extracting payment ID from QR URL:', error);
    return null;
  }
}

