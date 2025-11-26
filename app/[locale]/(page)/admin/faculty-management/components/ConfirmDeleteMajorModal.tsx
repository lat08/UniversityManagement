"use client";

import { Button } from "@/app/components/ui";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ConfirmDeleteMajorModalProps {
  isOpen: boolean;
  majorName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteMajorModal = ({
  isOpen,
  majorName,
  onClose,
  onConfirm,
}: ConfirmDeleteMajorModalProps) => {
  const t = useTranslations("admin.facultyManagement");
  const tCommon = useTranslations("common.actions");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t("modals.confirmDelete.title")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            {t("modals.confirmDelete.description", { name: majorName ?? "" })}
          </p>
          <p className="text-sm text-red-600 mt-2">
            {t("modals.confirmDelete.note")}
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {t("modals.confirmDelete.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};
