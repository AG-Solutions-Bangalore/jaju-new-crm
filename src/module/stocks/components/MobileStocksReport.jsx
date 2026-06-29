import React from "react";
import moment from "moment";
import { Printer, Search, Plus, Pencil, Loader2 } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/config/ButtonConfig";

const MobileStocksReport = ({
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
    <div className="sm:hidden">
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
      >
        <div className="flex flex-col gap-2">
          {/* Title + Print Button */}
          <div className="flex justify-between items-center">
            <h1 className="text-base font-bold text-gray-800 px-2">
              Stocks
            </h1>
            <div className="flex gap-[2px]">
              <button
                type="button"
                className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                onClick={handleDownloadCsv}
              >
                <FaRegFileExcel className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                onClick={handleDownloadPDF}
              >
                <FaRegFilePdf className="h-4 w-4" />
              </button>

              <ReactToPrint
                trigger={() => (
                  <button
                    type="button"
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                  >
                    <Printer className=" h-4 w-4" />
                  </button>
                )}
                content={() => tableRef.current}
                documentTitle="Stock-Report"
              />
              <button
                type="button"
                onClick={() => setShowNewItemDialog(true)}
                className="sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm p-3 rounded-b-md flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-2 rounded-md shadow-xs">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-1">
                <Label htmlFor="from_date_mobile" className="text-xs">
                  From Date
                </Label>
                <Input
                  id="from_date_mobile"
                  type="date"
                  {...form.register("from_date")}
                  className="text-xs h-8"
                  value={form.watch("from_date")}
                  onChange={(e) =>
                    form.setValue("from_date", e.target.value)
                  }
                />
                {form.formState.errors.from_date && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.from_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="to_date_mobile" className="text-xs">
                  To Date
                </Label>
                <Input
                  id="to_date_mobile"
                  type="date"
                  {...form.register("to_date")}
                  className="text-xs h-8"
                  value={form.watch("to_date")}
                  onChange={(e) => form.setValue("to_date", e.target.value)}
                />
                {form.formState.errors.to_date && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.to_date.message}
                  </p>
                )}
              </div>
            </div>
            <div className="pt-1">
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                className={`w-full h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3 mr-1" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Results */}
      {searchParams && (
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="text-center font-semibold text-sm mb-2">
                Stocks Report
              </div>
              <div className="text-center text-xs mb-3">
                From {moment(searchParams.from_date).format("DD-MMM-YYYY")}{" "}
                to {moment(searchParams.to_date).format("DD-MMM-YYYY")}
              </div>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1 text-left">Item Name</th>
                    <th className="border p-1 text-right">Open</th>
                    <th className="border p-1 text-right">Purchase</th>
                    <th className="border p-1 text-right">Sale</th>
                    <th className="border p-1 text-right">Close</th>
                  </tr>
                </thead>
                <tbody>
                  {stocksData?.stocks?.length ? (
                    stocksData.stocks.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }
                      >
                        <td className="border p-1 text-left">
                          <span className="flex items-center gap-1">
                            {item.item_name}
                            <button
                              type="button"
                              onClick={() => handleEditItem(item.item_name)}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </span>
                        </td>
                        <td className="border p-1 text-right">
                          {formatStockValue(item.openpurch - item.closesale)}
                        </td>
                        <td className="border p-1 text-right">
                          {formatStockValue(item.purch)}
                        </td>
                        <td className="border p-1 text-right">
                          {formatStockValue(item.sale)}
                        </td>
                        <td className="border p-1 text-right">
                          {formatStockValue(
                            item.openpurch -
                              item.closesale +
                              (item.purch - item.sale)
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="border p-2 text-center text-gray-500"
                      >
                        No stock data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileStocksReport;
