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
  blue: 'bg-blue-50 border-blue-200',
  emerald: 'bg-emerald-50 border-emerald-200',
  purple: 'bg-purple-50 border-purple-200',
  red: 'bg-red-50 border-red-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  emerald: 'text-emerald-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]} ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}