import React from "react";
import moment from "moment";
import { Printer, Search, Plus, Pencil, Loader2, CalendarDays } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { ButtonConfig } from "@/config/ButtonConfig";
import { cn } from "@/lib/utils";

const MobileSingleItemStockReport = ({
  form,
  isLoading,
  selectedItem,
  setSelectedItem,
  itemOptions,
  searchParams,
  normalizedTxs,
  openingPieces,
  openingSqft,
  closingPieces,
  closingSqft,
  lastTxDate,
  handleDownloadCsv,
  handleDownloadPDF,
  onSubmit,
  handleEditItem,
  setShowNewItemDialog,
  tableRef,
  formatCellValue,
  formatClosingBalanceText,
}) => {
  return (
    <div className="sm:hidden space-y-4">
      {/* Title Controls */}
      <div className="flex flex-col gap-2 bg-gray-50 p-2 rounded-lg border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-base font-bold text-gray-800">Single Item Stock</h1>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => setShowNewItemDialog(true)}
              className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white p-0 flex items-center justify-center rounded"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {selectedItem && (
              <Button
                type="button"
                onClick={handleEditItem}
                variant="outline"
                className="h-8 w-8 p-0 flex items-center justify-center rounded border-gray-300"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
        <div className="space-y-1">
          <Label htmlFor="mob_itemSelect" className="text-xs font-semibold text-gray-700">
            Select Item
          </Label>
          <MemoizedSelect
            value={selectedItem}
            onChange={setSelectedItem}
            options={itemOptions}
            placeholder="Search / Select Item"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal h-8 text-xs border-gray-300 px-2",
                    !form.watch("from_date") && "text-muted-foreground"
                  )}
                >
                  {form.watch("from_date") ? (
                    moment(form.watch("from_date")).format("DD-MM-YYYY")
                  ) : (
                    <span>Pick date</span>
                  )}
                  <CalendarDays className="h-3.5 w-3.5 opacity-75 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("from_date") ? new Date(form.watch("from_date")) : undefined}
                  onSelect={(date) =>
                    form.setValue("from_date", date ? moment(date).format("YYYY-MM-DD") : "")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700">To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal h-8 text-xs border-gray-300 px-2",
                    !form.watch("to_date") && "text-muted-foreground"
                  )}
                >
                  {form.watch("to_date") ? (
                    moment(form.watch("to_date")).format("DD-MM-YYYY")
                  ) : (
                    <span>Pick date</span>
                  )}
                  <CalendarDays className="h-3.5 w-3.5 opacity-75 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("to_date") ? new Date(form.watch("to_date")) : undefined}
                  onSelect={(date) =>
                    form.setValue("to_date", date ? moment(date).format("YYYY-MM-DD") : "")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className={`w-full h-8 text-xs font-semibold ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Generating...
            </>
          ) : (
            <>
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {searchParams && (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded border">
            <div>
              <div className="font-bold text-sm text-gray-800">{selectedItem}</div>
              <div className="text-[10px] text-gray-500">
                {moment(searchParams.from_date).format("DD-MM-YY")} to{" "}
                {moment(searchParams.to_date).format("DD-MM-YY")}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCsv}
                className="h-8 text-xs px-2 border-gray-300"
              >
                <FaRegFileExcel className="h-3.5 w-3.5 text-green-600" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="h-8 text-xs px-2 border-gray-300"
              >
                <FaRegFilePdf className="h-3.5 w-3.5 text-red-600" />
              </Button>
              <ReactToPrint
                trigger={() => (
                  <Button variant="outline" size="sm" className="h-8 text-xs px-2 border-gray-300">
                    <Printer className="h-3.5 w-3.5 text-gray-600" />
                  </Button>
                )}
                content={() => tableRef.current}
                documentTitle={`Single-Item-Stock-${selectedItem}`}
              />
            </div>
          </div>

          <div ref={tableRef} className="overflow-x-auto border rounded-lg border-gray-200 bg-white">
            <div className="hidden print:block text-center p-4">
              <h2 className="text-xl font-bold">{selectedItem}</h2>
              <p className="text-xs text-gray-500 mt-1">
                Stock Transaction History (From {moment(searchParams.from_date).format("DD MMMM YYYY")} to {moment(searchParams.to_date).format("DD MMMM YYYY")})
              </p>
            </div>

            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-center font-bold border-r p-1.5 w-20 text-gray-700">DATE</th>
                  <th className="text-left font-bold border-r p-1.5 text-gray-700">REF</th>
                  <th className="text-right font-bold border-r p-1.5 text-green-800 bg-green-50/30">IN (pcs)</th>
                  <th className="text-right font-bold border-r p-1.5 text-green-800 bg-green-50/30">IN (sqft)</th>
                  <th className="text-right font-bold border-r p-1.5 text-red-800 bg-red-50/30">OUT (pcs)</th>
                  <th className="text-right font-bold border-r p-1.5 text-red-800 bg-red-50/30">OUT (sqft)</th>
                  <th className="text-right font-bold border-r p-1.5 text-blue-800 bg-blue-50/30">BAL (pcs)</th>
                  <th className="text-right font-bold p-1.5 text-blue-800 bg-blue-50/30">BAL (sqft)</th>
                </tr>
              </thead>
              <tbody>
                {normalizedTxs.length ? (
                  normalizedTxs.map((t, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "border-b border-gray-200",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      )}
                    >
                      <td className="text-center border-r p-1.5">
                        {t.date ? moment(t.date).format("DD-MM-YY") : ""}
                      </td>
                      <td className="text-left p-1.5 border-r truncate max-w-[80px]">
                        {t.reference}
                      </td>
                      <td className="text-right border-r p-1.5 text-green-700">
                        {formatCellValue(t.inward_pieces)}
                      </td>
                      <td className="text-right border-r p-1.5 text-green-700">
                        {formatCellValue(t.inward_sqft)}
                      </td>
                      <td className="text-right border-r p-1.5 text-red-700">
                        {formatCellValue(t.outward_pieces)}
                      </td>
                      <td className="text-right border-r p-1.5 text-red-700">
                        {formatCellValue(t.outward_sqft)}
                      </td>
                      <td className="text-right border-r p-1.5 font-bold">
                        {formatCellValue(t.balance_pieces)}
                      </td>
                      <td className="text-right p-1.5 font-bold">
                        {formatCellValue(t.balance_sqft)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No transaction history found
                    </td>
                  </tr>
                )}

                {normalizedTxs.length > 0 && (
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="text-center p-1.5">
                      {lastTxDate ? moment(lastTxDate).format("DD-MM-YY") : ""}
                    </td>
                    <td className="text-left p-1.5">
                      Closing Balance
                    </td>
                    <td colSpan={4} className="p-1.5"></td>
                    <td className="text-right border-r p-1.5">
                      {closingPieces}
                    </td>
                    <td className="text-right p-1.5">
                      {closingSqft}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSingleItemStockReport;
