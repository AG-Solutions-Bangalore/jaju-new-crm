import React from "react";
import moment from "moment";
import { Printer, Search, Loader2 } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
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

const DesktopTrialBalanceReport = ({
  form,
  isLoading,
  searchParams,
  hideZeroEntries,
  setHideZeroEntries,
  positiveValues,
  positiveSum,
  negativeValues,
  negativeSum,
  handleDownloadCsv,
  handleDownloadPDF,
  handlePrintPdf,
  onSubmit,
  tableRef,
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
                Trial Balance Report
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
                  <Button
                    variant="outline"
                    size="sm"
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={() => setHideZeroEntries(!hideZeroEntries)}
                  >
                    {hideZeroEntries
                      ? "Show 0 value enteries"
                      : "Hide 0 value enteries"}
                  </Button>
                </CardTitle>
                <div className="flex gap-2">
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
                  <Button variant="outline" size="sm" onClick={handlePrintPdf}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div ref={tableRef} className="overflow-x-auto print:p-4">
                <div className="text-center mb-4 font-semibold">
                  Trial Balance Report
                </div>
                <div className="text-center text-sm mb-6">
                  From {moment(searchParams.from_date).format("DD-MMM-YYYY")} to{" "}
                  {moment(searchParams.to_date).format("DD-MMM-YYYY")}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Debit Table */}
                  <div className="flex-1">
                    <Table className="border">
                      <TableHeader>
                        <TableRow className="bg-red-100 hover:bg-red-100">
                          <TableHead
                            colSpan={2}
                            className="text-center text-black bg-red-50"
                          >
                            Debit Transactions
                          </TableHead>
                        </TableRow>
                        <TableRow className="bg-gray-100 hover:bg-gray-100">
                          <TableHead className="text-center border-r">
                            Account
                          </TableHead>
                          <TableHead className="text-center">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {negativeValues.length ? (
                          negativeValues.map((item, index) => (
                            <TableRow
                              key={`debit-${index}`}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-red-50/30"
                              }
                            >
                              <TableCell className="text-left border-r">
                                {item.payment_about}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.balance * -1}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center py-4 text-gray-500"
                            >
                              No debit transactions found
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="bg-red-50/30 font-medium">
                          <TableCell className="text-left border-r">Total</TableCell>
                          <TableCell className="text-right">
                            {negativeSum * -1}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Credit Table */}
                  <div className="flex-1">
                    <Table className="border">
                      <TableHeader>
                        <TableRow className="bg-green-100 hover:bg-green-100">
                          <TableHead
                            colSpan={2}
                            className="text-center text-black bg-green-50"
                          >
                            Credit Transactions
                          </TableHead>
                        </TableRow>
                        <TableRow className="bg-gray-100 hover:bg-gray-100">
                          <TableHead className="text-center border-r">
                            Account
                          </TableHead>
                          <TableHead className="text-center">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positiveValues.length ? (
                          positiveValues.map((item, index) => (
                            <TableRow
                              key={`credit-${index}`}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-green-50/30"
                              }
                            >
                              <TableCell className="text-left border-r">
                                {item.payment_about}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.balance}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center py-4 text-gray-500"
                            >
                              No credit transactions found
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="bg-green-50/30 font-medium">
                          <TableCell className="text-left border-r">Total</TableCell>
                          <TableCell className="text-right">
                            {positiveSum}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default DesktopTrialBalanceReport;
