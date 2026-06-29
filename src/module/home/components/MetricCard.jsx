import { Card, CardContent } from "@/components/ui/card";

const MetricCard = ({ title, value, icon: Icon, iconBg, count, countLabel, onClick, gradientFrom }) => {
  return (
    <Card
      className="relative overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border-gray-100"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {count !== undefined && (
          <div className="mt-4 flex items-center text-xs text-gray-500 gap-1.5">
            <span>{count} {countLabel}</span>
          </div>
        )}
        {gradientFrom && (
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${gradientFrom} to-transparent rounded-full -mr-8 -mt-8 pointer-events-none`} />
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
