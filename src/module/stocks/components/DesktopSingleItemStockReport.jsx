import React from "react";
import moment from "moment";
import { Printer, Search, Plus, Pencil, Loader2, CalendarDays } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonConfig } from "@/config/ButtonConfig";
import { cn } from "@/lib/utils";

const DesktopSingleItemStockReport = ({
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
    <div className="hidden sm:block space-y-4">
      {/* Title and Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Single Item Stock</h1>
          <p className="text-xs text-gray-500">View detailed stock transaction history by item</p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button
            onClick={() => setShowNewItemDialog(true)}
            className="flex-1 sm:flex-none h-9 bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Item
          </Button>
          {selectedItem && (
            <Button
              onClick={handleEditItem}
              variant="outline"
              className="flex-1 sm:flex-none h-9 text-xs flex items-center gap-1.5 border-gray-300"
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename Item
            </Button>
          )}
        </div>
      </div>

      {/* Filter Card */}
      <Card className="shadow-xs border-gray-200">
        <CardContent className="p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Select Item */}
              <div className="space-y-1.5 md:col-span-1">
                <Label htmlFor="itemSelect" className="text-xs font-semibold text-gray-700">
                  Select Item
                </Label>
                <MemoizedSelect
                  value={selectedItem}
                  onChange={setSelectedItem}
                  options={itemOptions}
                  placeholder="Search / Select Item"
                />
              </div>

              {/* From Date Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal h-9 text-xs border-gray-300",
                        !form.watch("from_date") && "text-muted-foreground"
                      )}
                    >
                      {form.watch("from_date") ? (
                        moment(form.watch("from_date")).format("DD MMMM YYYY")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarDays className="h-4 w-4 opacity-75 text-gray-500" />
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

              {/* To Date Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal h-9 text-xs border-gray-300",
                        !form.watch("to_date") && "text-muted-foreground"
                      )}
                    >
                      {form.watch("to_date") ? (
                        moment(form.watch("to_date")).format("DD MMMM YYYY")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarDays className="h-4 w-4 opacity-75 text-gray-500" />
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

              {/* Generate Button */}
              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-9 text-xs font-semibold ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
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
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Container */}
      {searchParams && (
        <Card className="shadow-xs border-gray-200">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">
                {selectedItem}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Report from {moment(searchParams.from_date).format("DD MMMM YYYY")} to{" "}
                {moment(searchParams.to_date).format("DD MMMM YYYY")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 self-stretch sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCsv}
                className="h-8 text-xs flex-1 sm:flex-none border-gray-300"
              >
                <FaRegFileExcel className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="h-8 text-xs flex-1 sm:flex-none border-gray-300"
              >
                <FaRegFilePdf className="mr-1.5 h-3.5 w-3.5 text-red-600" />
                PDF
              </Button>
              <ReactToPrint
                trigger={() => (
                  <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none border-gray-300">
                    <Printer className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
                    Print
                  </Button>
                )}
                content={() => tableRef.current}
                documentTitle={`Single-Item-Stock-${selectedItem}`}
              />
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
                </div>

                {/* Transaction History Table */}
                <div ref={tableRef} className="overflow-x-auto border rounded-lg border-gray-200">
                  <div className="hidden print:block text-center p-4">
                    <h2 className="text-xl font-bold">{selectedItem}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Stock Transaction History (From {moment(searchParams.from_date).format("DD MMMM YYYY")} to {moment(searchParams.to_date).format("DD MMMM YYYY")})
                    </p>
                  </div>

                  <Table className="border-collapse w-full text-[11px]">
                    <TableHeader className="bg-gray-100 text-gray-900 sticky top-0">
                      <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                        <TableHead rowSpan={2} className="text-center text-gray-800 font-bold border-r border-gray-200 align-middle w-32">
                          DATE
                        </TableHead>
                        <TableHead rowSpan={2} className="text-left text-gray-800 font-bold border-r border-gray-200 align-middle pl-3 min-w-40">
                          REFERENCE
                        </TableHead>
                        <TableHead colSpan={2} className="text-center text-green-800 font-bold border-r border-gray-200 bg-green-50/50 py-1.5">
                          INWARD
                        </TableHead>
                        <TableHead colSpan={2} className="text-center text-red-800 font-bold border-r border-gray-200 bg-red-50/50 py-1.5">
                          OUTWARD
                        </TableHead>
                        <TableHead colSpan={2} className="text-center text-blue-800 font-bold bg-blue-50/50 py-1.5">
                          BALANCE
                        </TableHead>
                      </TableRow>
                      <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">Piece/Box</TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">SQFT</TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">Piece/Box</TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">SQFT</TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 bg-blue-50/20 py-1 w-20 text-gray-700">Piece/Box</TableHead>
                        <TableHead className="text-right pr-6 bg-blue-50/20 py-1 w-20 text-gray-700">SQFT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {normalizedTxs.length ? (
                        normalizedTxs.map((t, index) => (
                          <TableRow
                            key={index}
                            className={cn(
                              "border-b border-gray-200 hover:bg-gray-50/50",
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            )}
                          >
                            <TableCell className="text-center border-r border-gray-200 font-medium py-2">
                              {t.date ? moment(t.date).format("DD MMMM YYYY") : ""}
                            </TableCell>
                            <TableCell className="text-left pl-3 border-r border-gray-200 font-medium text-gray-800 py-2">
                              {t.reference}
                            </TableCell>

                            {/* INWARD */}
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-green-700 font-semibold py-2">
                              {formatCellValue(t.inward_pieces)}
                            </TableCell>
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-green-700 font-semibold py-2">
                              {formatCellValue(t.inward_sqft)}
                            </TableCell>

                            {/* OUTWARD */}
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-red-700 font-semibold py-2">
                              {formatCellValue(t.outward_pieces)}
                            </TableCell>
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-red-700 font-semibold py-2">
                              {formatCellValue(t.outward_sqft)}
                            </TableCell>

                            {/* BALANCE */}
                            <TableCell className="text-right pr-6 border-r border-gray-200 bg-blue-50/20 text-gray-800 font-bold py-2">
                              {formatCellValue(t.balance_pieces)}
                            </TableCell>
                            <TableCell className="text-right pr-6 bg-blue-50/20 text-gray-800 font-bold py-2">
                              {formatCellValue(t.balance_sqft)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <td
                            colSpan={8}
                            className="text-center py-12 text-gray-500 font-medium"
                          >
                            No transaction history found for the selected criteria
                          </td>
                        </TableRow>
                      )}

                      {/* Final Closing Balance Row */}
                      {normalizedTxs.length > 0 && (
                        <TableRow className="bg-slate-900 text-white hover:bg-slate-900 font-bold text-xs">
                          <TableCell className="text-center py-2.5">
                            {lastTxDate ? moment(lastTxDate).format("DD MMMM YYYY") : ""}
                          </TableCell>
                          <TableCell className="text-left pl-3 py-2.5">
                            Closing: {formatClosingBalanceText(closingPieces, closingSqft)}
                          </TableCell>
                          <TableCell colSpan={4} className="py-2.5"></TableCell>
                          <TableCell className="text-right pr-6 border-r border-slate-800 py-2.5">
                            {closingPieces}
                          </TableCell>
                          <TableCell className="text-right pr-6 py-2.5">
                            {closingSqft}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DesktopSingleItemStockReport;
