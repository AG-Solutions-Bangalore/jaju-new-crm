import React from "react";
import moment from "moment";
import { Printer, Search, Plus, Pencil, Loader2 } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonConfig } from "@/config/ButtonConfig";

const DesktopPiaeceReport = ({
  form,
  isLoading,
  stocksData,
  searchParams,
  handleDownloadCsv,
  handleDownloadPDF,
  onSubmit,
  handleEditItem,
  setShowNewItemDialog,
  tableRef,
  formatStockValue,
}) => {
  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <div
          className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Title Section */}
            <div className="w-[30%] shrink-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">
                Stocks Sqft Report
              </h1>
            </div>

            {/* Form Section */}
            <div className="bg-white w-full lg:w-[70%] p-3 rounded-md shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full"
                >
                  {/* From Date */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="from_date"
                      className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
                    >
                      From Date
                    </Label>
                    <Input
                      id="from_date"
                      type="date"
                      {...form.register("from_date")}
                      className="h-8 text-xs"
                    />
                    {form.formState.errors.from_date && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.from_date.message}
                      </p>
                    )}
                  </div>

                  {/* To Date */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="to_date"
                      className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
                    >
                      To Date
                    </Label>
                    <Input
                      id="to_date"
                      type="date"
                      {...form.register("to_date")}
                      className="h-8 text-xs"
                    />
                    {form.formState.errors.to_date && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.to_date.message}
                      </p>
                    )}
                  </div>

                  {/* Generate Button */}
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`h-8 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Search className="h-3 w-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {searchParams && (
          <>
            <CardHeader className="border-t">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
                <CardTitle className="text-lg flex flex-row items-center gap-2">
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewItemDialog(true)}
                    className="bg-green-50 hover:bg-green-100 border-green-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCsv}
                  >
                    <FaRegFileExcel className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                  >
                    <FaRegFilePdf className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <ReactToPrint
                    trigger={() => (
                      <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                    )}
                    content={() => tableRef.current}
                    documentTitle="Stock-Report"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div ref={tableRef} className="overflow-x-auto print:p-4">
                <div className="text-center mb-4 font-semibold">
                  Stocks Sqft Report
                </div>
                <div className="text-center text-sm mb-6">
                  From{" "}
                  {moment(searchParams.from_date).format("DD-MMM-YYYY")} to{" "}
                  {moment(searchParams.to_date).format("DD-MMM-YYYY")}
                </div>

                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-center text-black font-bold border-r">
                        Items Name
                      </TableHead>
                      <TableHead className="text-center text-black font-bold border-r">
                        Open Balance
                      </TableHead>
                      <TableHead className="text-center text-black font-bold border-r">
                        Purchase
                      </TableHead>
                      <TableHead className="text-center text-black font-bold border-r">
                        Sale
                      </TableHead>
                      <TableHead className="text-center text-black font-bold">
                        Close Balance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocksData?.stocks?.length ? (
                      stocksData.stocks.map((item, index) => (
                        <TableRow
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }
                        >
                          <TableCell className="text-left border-r">
                            <span className="flex items-center gap-1">
                              {item.item_name}
                              <button
                                type="button"
                                onClick={() => handleEditItem(item.item_name)}
                                className="text-gray-400 hover:text-blue-600 print:hidden"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            </span>
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {formatStockValue(
                              item.openpurch_pcs - item.closesale_pcs
                            )}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {formatStockValue(item.purch_pcs)}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {formatStockValue(item.sale_pcs)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatStockValue(
                              item.openpurch_pcs -
                                item.closesale_pcs +
                                (item.purch_pcs - item.sale_pcs)
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-gray-500"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Loading stock data...
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-lg">📋</div>
                              <div>
                                No stock data found for the selected criteria
                              </div>
                              <div className="text-sm text-gray-400">
                                Try adjusting your date range
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default DesktopPiaeceReport;
