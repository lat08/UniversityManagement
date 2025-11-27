export const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
  e.preventDefault();
};

export const handleFileClick = (fileInputRef: React.RefObject<HTMLInputElement | null>): void => {
  fileInputRef.current?.click();
};

interface SetFormData<T> {
  (updater: (prev: T) => T): void;
}

interface SetErrors<T> {
  (updater: (prev: Partial<Record<keyof T, string>>) => Partial<Record<keyof T, string>>): void;
}

export const handleFileDrop = <T extends { file: File | null }>(
  e: React.DragEvent<HTMLDivElement>,
  setFormData: SetFormData<T>,
  setErrors: SetErrors<T>,
  includeDeleteFlag = false
): void => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0] || null;
  if (file) {
    setFormData((prev) => {
      const update = { ...prev, file } as T;
      if (includeDeleteFlag && 'shouldDeleteFile' in update) {
        (update as T & { shouldDeleteFile: boolean }).shouldDeleteFile = false;
      }
      return update;
    });
    setErrors((prev) => ({ ...prev, file: undefined }));
  }
};

export const handleFileInputChange = <T extends { file: File | null }>(
  e: React.ChangeEvent<HTMLInputElement>,
  setFormData: SetFormData<T>,
  setErrors: SetErrors<T>,
  includeDeleteFlag = false
): void => {
  const file = e.target.files?.[0] || null;
  setFormData((prev) => {
    const update = { ...prev, file } as T;
    if (includeDeleteFlag && 'shouldDeleteFile' in update) {
      (update as T & { shouldDeleteFile: boolean }).shouldDeleteFile = false;
    }
    return update;
  });
  if (file) {
    setErrors((prev) => ({ ...prev, file: undefined }));
  }
};

