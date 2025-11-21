let downloading = false;

export async function downloadFile(fileUrl: string, fileName: string): Promise<void> {
  // Block spam download
  if (downloading) {
    return;
  }

  downloading = true;
  try {
    const response = await fetch(fileUrl)
    const blob = await response.blob()
    downloadFileBlob(blob, fileName)
  } catch {
    globalThis.open(fileUrl, '_blank')
  } finally {
    // Reset after a short delay to allow download to complete
    setTimeout(() => {
      downloading = false;
    }, 1000);
  }
}

export function downloadFileBlob(blob: Blob, fileName: string): void {
  const url = globalThis.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  globalThis.URL.revokeObjectURL(url)
}

