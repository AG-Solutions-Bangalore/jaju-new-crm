import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/config/ButtonConfig";
import { FaRegFileExcel, FaRegFilePdf } from "react-icons/fa";

const DayBookReportHeader = ({
  date,
  onDateChange,
  onDownload,
  onSavePDF,
  onPrint,
  variant = "desktop",
}) => {
  if (variant === "mobile") {
    return (
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h1 className="text-base font-bold text-gray-800 px-2">
              Day Book Report
            </h1>
            <div className="flex gap-[2px]">
              <button
                className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                onClick={onDownload}
              >
                <FaRegFileExcel className="h-4 w-4" />
              </button>
              <button
                className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                onClick={onSavePDF}
              >
                <FaRegFilePdf className="h-4 w-4" />
              </button>
              <button
                className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                onClick={onPrint}
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="bg-white p-2 rounded-md shadow-xs">
            <div className="grid grid-cols-1 gap-2 mb-2">
              <div className="space-y-1">
                <Label htmlFor="mobile-report-date" className="text-xs">
                  Date:
                </Label>
                <Input
                  id="mobile-report-date"
                  type="date"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="text-xs h-7"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${ButtonConfig.cardheaderColor} rounded-t-lg shadow-sm mb-4`}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800">
              Day Book Report
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={onDownload}
            >
              <FaRegFileExcel className="h-3 w-3" />
              CSV
            </Button>
            <Button
              size="sm"
              className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={onSavePDF}
            >
              <FaRegFilePdf className="h-3 w-3" />
              PDF
            </Button>
            <Button
              size="sm"
              className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={onPrint}
            >
              <Printer className="h-3 w-3" />
              Print
            </Button>
          </div>
        </div>
        <div className="bg-white p-2 rounded-md shadow-xs">
          <div className="flex items-center space-x-2">
            <Label htmlFor="report-date" className="text-sm">
              Date:
            </Label>
            <Input
              id="report-date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayBookReportHeader;
