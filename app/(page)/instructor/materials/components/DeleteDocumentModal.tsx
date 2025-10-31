"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import type { Document } from "./DocumentCard";

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: Document | null;
  isLoading?: boolean;
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  onConfirm,
  document,
  isLoading = false,
}: DeleteDocumentModalProps) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Xác nhận xóa tài liệu
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Bạn có chắc chắn muốn xóa tài liệu{" "}
            <span className="font-semibold text-gray-900">{document.title}</span>?
            <br />
            <span className="text-sm text-gray-500 mt-1 block">
              Hành động này không thể hoàn tác.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="sm:flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="sm:flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Đang xử lý..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

