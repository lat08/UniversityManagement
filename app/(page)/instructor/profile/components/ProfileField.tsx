import React from 'react'
import { ChevronDown } from 'lucide-react'

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
      
      {type === 'select' && editable ? (
        <div className="relative">
          <select
            value={value}
            onChange={handleChange}
            className="w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      ) : type === 'select' && !editable ? (
        <div className="relative">
          <input
            type="text"
            value={value}
            disabled
            className="w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
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

