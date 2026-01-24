import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'red' | 'yellow' | 'green' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  red: 'bg-red-50 border-red-200 text-red-600',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  orange: 'bg-orange-50 border-orange-200 text-orange-600',
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
            {trend && (
              <Badge variant={trend.isPositive ? 'default' : 'destructive'} className="mt-1 text-xs">
                {trend.isPositive ? '+' : ''}{trend.value}% from last month
              </Badge>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-lg border flex-shrink-0 ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}