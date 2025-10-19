import { FileText, Archive, FileImage, File } from 'lucide-react'
import React from 'react'

export const getFileIcon = (type: string) => {
  const iconProps = { className: "w-8 h-8", style: { color: '#4E8EE1' } }
  
  switch (type) {
    case 'pdf':
      return React.createElement(FileText, iconProps)
    case 'zip':
      return React.createElement(Archive, iconProps)
    case 'pptx':
      return React.createElement(FileImage, iconProps)
    case 'docx':
      return React.createElement(File, iconProps)
    default:
      return React.createElement(FileText, iconProps)
  }
}

export const getFileTypeTag = (type: string) => {
  const tagColors = {
    'pdf': 'bg-red-50 text-red-600 border border-red-200',
    'zip': 'bg-green-50 text-green-600 border border-green-200', 
    'pptx': 'bg-orange-50 text-orange-600 border border-orange-200',
    'docx': 'bg-blue-50 text-blue-600 border border-blue-200'
  }
  
  const typeLabels = {
    'pdf': 'PDF',
    'zip': 'ZIP',
    'pptx': 'PPTX',
    'docx': 'WORD'
  }
  
  const colorClass = tagColors[type as keyof typeof tagColors] || 'bg-gray-50 text-gray-600 border-gray-200'
  const label = typeLabels[type as keyof typeof typeLabels] || type.toUpperCase()
  
  return React.createElement('span', {
    className: `inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium border ${colorClass}`
  }, label)
}
