import moment from "moment";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LoadDraft from "@/components/common/LoadDraft";

const DayBookHeader = ({
  date,
  lastSaveTime,
  refreshDraftsTrigger,
  onSaveDraft,
  onLoadDraft,
  variant = "desktop",
}) => {
  const formattedDate = moment(date).format(
    variant === "mobile" ? "DD MMM YYYY" : "DD MMMM YYYY",
  );

  if (variant === "mobile") {
    return (
      <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-2 mb-2">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-base font-bold text-gray-800">
            Add Day Book - {formattedDate}
          </h1>
          <div className="flex flex-col md:flex-row space-x-2 items-end md:items-center">
            <LoadDraft
              onLoadDraft={onLoadDraft}
              refreshTrigger={refreshDraftsTrigger}
              selectedDate={moment(date).format("DD MMMM YYYY")}
            />
            <div className="flex flex-row items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveDraft}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800 text-xs h-8"
              >
                Save Draft
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800" />
                </PopoverTrigger>
                <PopoverContent className="text-xs p-2 w-fit">
                  <p className="font-semibold">Save Draft</p>
                  <p className="text-gray-600">
                    You can also press <b>Ctrl + S</b> to save.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {lastSaveTime && (
          <p className="text-xs text-gray-500 mt-1 text-center">
            Last saved: {moment(lastSaveTime).format("hh:mm A")}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Add Day Book</CardTitle>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            <LoadDraft
              onLoadDraft={onLoadDraft}
              refreshTrigger={refreshDraftsTrigger}
              selectedDate={moment(date).format("DD MMMM YYYY")}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800"
            >
              Save Draft
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Info className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800" />
              </PopoverTrigger>
              <PopoverContent className="text-xs p-2 w-fit">
                <p className="font-semibold">Save Draft</p>
                <p className="text-gray-600">
                  You can also press <b>Ctrl + S</b> to save.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {lastSaveTime && (
          <p className="text-xs text-gray-500">
            Last saved: {moment(lastSaveTime).format("hh:mm A")}
          </p>
        )}
      </CardHeader>
    </Card>
  );
};

export default DayBookHeader;
