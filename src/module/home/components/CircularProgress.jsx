import { Card } from "@/components/ui/card";

const CircularProgress = ({ percentage, label, color }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    green: "text-[#2e7d32] stroke-[#2e7d32] stroke-emerald-500 text-emerald-500",
    indigo: "text-[#5c6bc0] stroke-[#5c6bc0] stroke-indigo-500 text-indigo-500",
    orange: "text-[#d84315] stroke-[#d84315] stroke-orange-500 text-orange-500",
  };

  const strokeColor = colorMap[color] || colorMap.green;

  return (
    <Card className="flex flex-col items-center justify-center p-6 border border-gray-100 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="7"
            stroke="#f3f4f6"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="7"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${strokeColor} transition-all duration-700 ease-in-out`}
            stroke="currentColor"
          />
        </svg>
        <span className="absolute text-2xl font-bold text-gray-800">{percentage}%</span>
      </div>
      <span className="mt-4 text-sm font-semibold text-gray-600 tracking-wide">{label}</span>
    </Card>
  );
};

export default CircularProgress;
