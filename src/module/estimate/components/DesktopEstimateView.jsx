import React from "react";
import moment from "moment";
import { ChevronLeft, Printer } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DesktopEstimateView = ({
  estimateData,
  calculateTotal,
  handleDownloadPDF,
  tableRef,
  navigate,
}) => {
  if (!estimateData) return null;

  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/estimate")}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">Estimate Details</CardTitle>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
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
                documentTitle="Estimate Report"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div ref={tableRef} className="overflow-x-auto print:p-4">
            <div className="text-center border-l border-t border-r p-4 space-y-1">
              <h3 className="text-2xl font-semibold">ESTIMATE</h3>
            </div>

            <div className="grid grid-cols-2 border m-0">
              <div className="flex items-center justify-center border-r border-gray-300 py-2 px-3">
                <span className="font-medium">Date:</span>
                <span className="ml-1">
                  {moment(estimateData?.estimate?.estimate_date).format(
                    "DD-MMM-YYYY"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center py-2 px-3">
                <span className="font-medium">Estimate No:</span>
                <span className="ml-1">
                  {estimateData?.estimate?.estimate_no}
                </span>
              </div>
            </div>

            <div className="border-l border-r p-2">
              <span className="font-semibold">Customer:</span>{" "}
              <span>{estimateData?.estimate?.estimate_customer}</span>
            </div>

            <Table className="border">
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="text-center text-black font-bold border-r">
                    Sl No
                  </TableHead>
                  <TableHead className="text-center text-black font-bold border-r">
                    Item Name
                  </TableHead>
                  <TableHead className="text-center text-black font-bold border-r">
                    Quantity
                  </TableHead>
                  <TableHead className="text-center text-black font-bold border-r">
                    Rate
                  </TableHead>
                  <TableHead className="text-center text-black font-bold">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimateData?.estimateSub?.map((item, index) => (
                  <TableRow key={index} className="bg-white">
                    <TableCell className="text-center border-r">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {item.estimate_sub_item}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {item.estimate_sub_qnty}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {item.estimate_sub_rate}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.estimate_sub_amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-right bg-white font-medium border-r border-b"
                  >
                    Sub-Total
                  </TableCell>
                  <TableCell className="text-right bg-white border-b">
                    {calculateTotal(estimateData?.estimateSub)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-right font-medium bg-white border-r border-b"
                  >
                    Tax (GST 18% ={" "}
                    {Number(estimateData?.estimate?.estimate_tax).toFixed(0)})
                  </TableCell>
                  <TableCell className="text-right bg-white border-b">
                    {estimateData?.estimate?.estimate_tax}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-right font-medium bg-white border-r border-b"
                  >
                    Tempo Charges
                  </TableCell>
                  <TableCell className="text-right bg-white border-b">
                    {estimateData?.estimate?.estimate_tempo}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-right font-medium bg-white border-r border-b"
                  >
                    Loading/Unloading
                  </TableCell>
                  <TableCell className="text-right bg-white border-b">
                    {estimateData?.estimate?.estimate_loading}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-right font-medium bg-white border-r border-b"
                  >
                    Other Charges
                  </TableCell>
                  <TableCell className="text-right bg-white border-b">
                    {estimateData?.estimate?.estimate_other}
                  </TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell
                    colSpan={4}
                    className="text-right border-r bg-white border-b"
                  >
                    Total
                  </TableCell>
                  <TableCell className="text-right bg-white border-b">
                    {estimateData?.estimate?.estimate_gross}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-right font-medium bg-white border-r border-b"
                  >
                    Advance Received
                  </TableCell>
                  <TableCell className="text-right bg-white border-b">
                    {estimateData?.estimate?.estimate_advance}
                  </TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell
                    colSpan={4}
                    className="text-right bg-white border-r"
                  >
                    Balance
                  </TableCell>
                  <TableCell className="text-right bg-white">
                    {estimateData?.estimate?.estimate_balance}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopEstimateView;
