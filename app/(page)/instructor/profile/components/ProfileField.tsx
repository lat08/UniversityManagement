import React from 'react'
import { Dropdown } from '@/app/components/ui'

interface ProfileFieldProps {
  label: string
  value: string
  placeholder?: string
  editable?: boolean
  onChange?: (value: string) => void
  type?: 'text' | 'date' | 'select'
  options?: { value: string; label: string }[]
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  placeholder = '',
  editable = false,
  onChange,
  type = 'text',
  options = []
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {type === 'select' ? (
        <Dropdown
          options={options}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={!editable}
        />
      ) : (
        <input
          type={type === 'date' ? 'text' : type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={!editable}
          className={`w-full px-4 py-3 text-sm rounded-lg transition-all
            ${editable 
              ? 'text-gray-700 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
              : 'text-gray-700 bg-gray-50 border border-gray-200 cursor-not-allowed'
            }`}
        />
      )}
    </div>
  )
}

