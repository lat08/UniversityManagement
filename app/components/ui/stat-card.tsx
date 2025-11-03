import { ReactNode } from 'react';
import { Card, CardContent } from './card';

export interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon?: string | ReactNode;
  color?: string;
  growth?: {
    percentage: number;
    label?: string;
  };
}

export function StatCard({ label, value, subtitle, icon, color = 'bg-gray-50', growth }: StatCardProps) {
  return (
    <Card className={`${color} border border-gray-200`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className="text-4xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {growth && (
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${growth.percentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {growth.percentage < 0 ? (
                    <span className="text-xs">↓</span>
                  ) : (
                    <span className="text-xs">↑</span>
                  )}
                  {`${growth.percentage > 0 ? '+' : ''}${growth.percentage.toFixed(1)}%`}
                </span>
                {growth.label && (
                  <span className="text-xs text-gray-500">{growth.label}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="text-3xl">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

