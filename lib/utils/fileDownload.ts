export async function downloadFile(fileUrl: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(fileUrl)
    const blob = await response.blob()
    downloadFileBlob(blob, fileName)
  } catch {
    window.open(fileUrl, '_blank')
  }
}

export function downloadFileBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

