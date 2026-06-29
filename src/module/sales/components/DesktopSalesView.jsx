import React from "react";
import moment from "moment";
import { ChevronLeft, Edit, Printer } from "lucide-react";
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

const DesktopSalesView = ({
  salesData,
  calculateSubTotal,
  subTotal,
  tax,
  tempo,
  loading,
  unloading,
  other,
  other1,
  roundOff,
  grandTotal,
  autoGst,
  amountToBeCollected,
  handleDownloadPDF,
  tableRef,
  navigate,
  id,
}) => {
  if (!salesData) return null;

  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/sales")}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">Sales Details</CardTitle>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/sales/edit/${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
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
                documentTitle="Sales Report"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div ref={tableRef} className="overflow-x-auto print:p-4">
            <div className="text-center border-l border-t border-r p-4 space-y-1">
              <h3 className="text-2xl font-semibold">JAJU'S ESTIMATE</h3>
            </div>

            <div className="grid grid-cols-2 border m-0">
              <div className="flex items-center justify-center border-r border-gray-300 py-2 px-3">
                <span className="font-medium">Date:</span>
                <span className="ml-1">
                  {moment(salesData?.sales?.sales_date).format("DD-MMM-YYYY")}
                </span>
              </div>
              <div className="flex items-center justify-center py-2 px-3">
                <span className="font-medium">Bill No:</span>
                <span className="ml-1">{salesData?.sales?.sales_no}</span>
              </div>
            </div>

            <div className="border-l border-r p-2 flex justify-between items-center">
              <div>
                <span className="font-semibold">Customer:</span>{" "}
                <span>{salesData?.sales?.sales_customer}</span>
              </div>
              <div>
                <span className="font-semibold">Phone:</span>{" "}
                <span>{salesData?.sales?.sales_mobile}</span>
              </div>
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
                    Qnty (pcs/box)
                  </TableHead>
                  <TableHead className="text-center text-black font-bold border-r">
                    Qnty (sqft)
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
                {salesData?.salesSub?.map((item, index) => (
                  <TableRow key={index} className="bg-white">
                    <TableCell className="text-left border-r pl-4">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-left border-r pl-4">
                      {item.sales_sub_item}
                    </TableCell>
                    <TableCell className="text-right border-r pr-4">
                      {item.sales_sub_pcs}
                    </TableCell>
                    <TableCell className="text-right border-r pr-4">
                      {parseFloat(item.sales_sub_qnty_sqr) ||
                        item.sales_sub_qnty_sqr ||
                        0}
                    </TableCell>
                    <TableCell className="text-right border-r pr-4">
                      {Number(item.sales_sub_rate).toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      {Number(item.sales_sub_amount).toFixed(0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right border-r font-medium">
                    Sub-Total
                  </TableCell>
                  <TableCell className="text-right bg-white border-b pr-4 font-bold">
                    {Number(subTotal).toFixed(0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-right bg-white font-medium border-r border-b"
                  >
                    Tempo Charges
                  </TableCell>
                  <TableCell className="text-right bg-white border-b pr-4">
                    {Number(tempo).toFixed(0)}
                  </TableCell>
                </TableRow>
                {Number(loading) > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right bg-white font-medium border-r border-b"
                    >
                      Loading Only
                    </TableCell>
                    <TableCell className="text-right bg-white border-b pr-4">
                      {Number(loading).toFixed(0)}
                    </TableCell>
                  </TableRow>
                )}
                {Number(unloading) > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right bg-white font-medium border-r border-b"
                    >
                      Loading & Unloading
                    </TableCell>
                    <TableCell className="text-right bg-white border-b pr-4">
                      {Number(unloading).toFixed(0)}
                    </TableCell>
                  </TableRow>
                )}
                {salesData?.sales?.sales_other_label && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right bg-white font-medium border-r border-b"
                    >
                      {salesData.sales.sales_other_label}
                    </TableCell>
                    <TableCell className="text-right bg-white border-b pr-4">
                      {Number(other).toFixed(0)}
                    </TableCell>
                  </TableRow>
                )}
                {salesData?.sales?.sales_other1_label && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right bg-white font-medium border-r border-b"
                    >
                      {salesData.sales.sales_other1_label}
                    </TableCell>
                    <TableCell className="text-right bg-white border-b pr-4">
                      {Number(other1).toFixed(0)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-right bg-white font-medium border-r border-b"
                  >
                    Gross Total
                  </TableCell>
                  <TableCell className="text-right bg-white border-b pr-4 font-semibold">
                    {Number(grandTotal).toFixed(0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-right bg-white font-medium border-r border-b"
                  >
                    Tax (GST {salesData?.sales?.sales_gst_percentage || 18}% ={" "}
                    {Number(autoGst).toFixed(2)})
                  </TableCell>
                  <TableCell className="text-right bg-white border-b pr-4 font-semibold">
                    {Number(tax).toFixed(2)}
                  </TableCell>
                </TableRow>
                {Math.abs(Math.round(roundOff)) > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right bg-white font-medium border-r border-b"
                    >
                      Round Off
                    </TableCell>
                    <TableCell className="text-right bg-white border-b pr-4">
                      {Math.round(roundOff) > 0
                        ? `+${Math.round(roundOff)}`
                        : Math.round(roundOff)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="font-bold">
                  <TableCell colSpan={5} className="text-right bg-white border-r border-b">
                    Amount to be Collected
                  </TableCell>
                  <TableCell className="text-right bg-white border-b pr-4">
                    {Number(salesData?.sales?.sales_gross).toFixed(0)}
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

export default DesktopSalesView;
