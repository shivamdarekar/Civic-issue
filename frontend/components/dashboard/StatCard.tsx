import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'red' | 'yellow' | 'green' | 'orange';
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, color, subtitle, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}