import React from "react";
import moment from "moment";
import { Printer } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonConfig } from "@/config/ButtonConfig";

const LedgerReportTable = ({
  searchParams,
  ledgerData,
  tableRef,
  calculateTotalPayment,
  calculateTotalReceived,
  handleDownloadCsv,
  handleDownloadPDF,
  handlePrintPdf,
  layout = "desktop",
}) => {
  if (!searchParams) return null;

  const totalPayment = calculateTotalPayment();
  const totalReceived = calculateTotalReceived();

  if (layout === "mobile") {
    return (
      <div className="p-2">
        <div className="text-center font-semibold text-sm mb-2">
          Ledger Report - {searchParams.account_name}
        </div>
        <div className="text-center text-xs mb-1">
          From {moment(searchParams.from_date).format("DD-MMM-YYYY")} to{" "}
          {moment(searchParams.to_date).format("DD-MMM-YYYY")}
        </div>

        <div className="text-center text-xs mb-2">
          Opening Balance = ₹ {ledgerData?.opening_balance || 0}
        </div>

        {/* Debit Section */}
        <div className="mb-4">
          <div className="text-xs font-medium bg-red-50 p-1 text-center border">
            Debit Transactions
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Date</th>
                <th className="border p-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData?.payment?.length ? (
                ledgerData.payment.map((item, index) => (
                  <tr
                    key={`debit-mob-${index}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-red-50"}
                  >
                    <td className="border p-1 text-center">
                      {moment(item.payment_date).format("DD-MM-YYYY")}
                    </td>
                    <td className="border p-1 text-center">
                      {item.payment_amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="border p-2 text-center text-gray-500"
                  >
                    No debit transactions
                  </td>
                </tr>
              )}
              <tr className="bg-red-50 font-medium">
                <td className="border p-1 text-center">Total</td>
                <td className="border p-1 text-center">{totalPayment}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Credit Section */}
        <div className="mb-4">
          <div className="text-xs font-medium bg-green-50 p-1 text-center border">
            Credit Transactions
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Date</th>
                <th className="border p-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData?.received?.length ? (
                ledgerData.received.map((item, index) => (
                  <tr
                    key={`credit-mob-${index}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-green-50"}
                  >
                    <td className="border p-1 text-center">
                      {moment(item.received_date).format("DD-MM-YYYY")}
                    </td>
                    <td className="border p-1 text-center">
                      {item.received_amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="border p-2 text-center text-gray-500"
                  >
                    No credit transactions
                  </td>
                </tr>
              )}
              <tr className="bg-green-50 font-medium">
                <td className="border p-1 text-center">Total</td>
                <td className="border p-1 text-center">{totalReceived}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center text-xs font-medium mb-4">
          Closing Balance = ₹ {ledgerData?.closing_balance}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <>
      <CardHeader className="border-t">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
          <CardTitle className="text-lg flex flex-row items-center gap-2" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
              <FaRegFileExcel className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
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
            Ledger Report - {searchParams.account_name}
          </div>
          <div className="text-center text-sm mb-2">
            From {moment(searchParams.from_date).format("DD-MMM-YYYY")} to{" "}
            {moment(searchParams.to_date).format("DD-MMM-YYYY")}
          </div>
          <div className="text-center text-sm mb-6">
            Opening Balance = ₹ {ledgerData?.opening_balance || 0}
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
                    <TableHead className="text-center border-r">Date</TableHead>
                    <TableHead className="text-center">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData?.payment?.length ? (
                    ledgerData.payment.map((item, index) => (
                      <TableRow
                        key={`debit-${index}`}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-red-50/30"
                        }
                      >
                        <TableCell className="text-center border-r">
                          {moment(item.payment_date).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.payment_amount}
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
                    <TableCell className="text-center border-r">Total</TableCell>
                    <TableCell className="text-center">{totalPayment}</TableCell>
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
                    <TableHead className="text-center border-r">Date</TableHead>
                    <TableHead className="text-center">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData?.received?.length ? (
                    ledgerData.received.map((item, index) => (
                      <TableRow
                        key={`credit-${index}`}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-green-50/30"
                        }
                      >
                        <TableCell className="text-center border-r">
                          {moment(item.received_date).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.received_amount}
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
                    <TableCell className="text-center border-r">Total</TableCell>
                    <TableCell className="text-center">
                      {totalReceived}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 text-center font-medium">
            Closing Balance = ₹ {ledgerData?.closing_balance}
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default LedgerReportTable;
