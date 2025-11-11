"use client";

import { useState, useEffect } from "react";
import { X, Copy, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { Spinner } from "@/app/components/ui/spinner";
import { usePaymentStatusPolling } from "../lib/hooks/usePaymentStatusPolling";

interface QrPaymentModalProps {
  isOpen: boolean;
  qrUrl: string | null;
  paymentId: string | null;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export default function QrPaymentModal({ isOpen, qrUrl, paymentId, onClose, onPaymentSuccess }: QrPaymentModalProps) {
  const [qrLoading, setQrLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  const handleStatusChange = (status: 'pending' | 'completed' | 'failed') => {
    setPaymentStatus(status);
    
    if (status === 'completed') {
      toast.success('Thanh toán thành công!', {
        position: 'top-right',
        duration: 3000,
      });
      
      // Đóng modal sau 1 giây và refetch data
      setTimeout(() => {
        onClose();
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }, 1000);
    } else if (status === 'failed') {
      toast.error('Thanh toán thất bại. Vui lòng thử lại.', {
        position: 'top-right',
        duration: 5000,
      });
    }
  };

  usePaymentStatusPolling({
    paymentId,
    isOpen,
    onStatusChange: handleStatusChange,
  });

  useEffect(() => {
    if (!isOpen) {
      setPaymentStatus('pending');
      setQrLoading(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl);
    toast.success("Đã sao chép link QR!");
  };

  const handleOpenNewTab = () => {
    if (qrUrl) window.open(qrUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-lg p-4 animate-in fade-in-50">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">QR Thanh toán</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {paymentStatus === 'pending' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">Đang chờ thanh toán...</p>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center font-semibold">Thanh toán thành công!</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 text-center">Thanh toán thất bại. Vui lòng thử lại.</p>
          </div>
        )}

        {/* QR Display */}
        <div className="flex items-center justify-center h-[50vh] bg-gray-50 rounded-lg border">
          {qrLoading && (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          )}

          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="QR Thanh toán"
              title="QR Thanh toán"
              className={`object-contain transition-opacity duration-300 ${
                qrLoading ? "opacity-0" : "opacity-100"
              } w-56 h-56 md:w-64 md:h-64`}
              onLoad={() => setQrLoading(false)}
              onError={() => {
                setQrLoading(false);
                toast.error("Không thể tải QR. Vui lòng thử lại!");
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm hover:bg-gray-100 transition"
          >
            <Copy className="w-4 h-4" />
            Sao chép link
          </button>

          <button
            onClick={handleOpenNewTab}
            className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm hover:bg-gray-100 transition"
          >
            <ExternalLink className="w-4 h-4" />
            Mở trong tab mới
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
