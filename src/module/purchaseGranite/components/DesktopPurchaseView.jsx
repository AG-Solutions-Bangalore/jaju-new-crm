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

const DesktopPurchaseView = ({
  purchaseData,
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
}) => {
  if (!purchaseData) return null;

  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/purchase")}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">Purchase Details</CardTitle>
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
                documentTitle="Purchase Granite Report"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div ref={tableRef} className="overflow-x-auto print:p-4">
            <div className="text-center border-l border-t border-r p-4 space-y-1">
              <h3 className="text-2xl font-semibold">
                JAJU'S FLOORING CONCEPTS
              </h3>
            </div>

            <div className="grid grid-cols-2 border m-0">
              <div className="flex items-center justify-center border-r border-gray-300 py-2 px-3">
                <span className="font-medium">Date:</span>
                <span className="ml-1">
                  {moment(purchaseData?.purchase?.purchase_date).format(
                    "DD-MMM-YYYY"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center py-2 px-3">
                <span className="font-medium">Purchase No:</span>
                <span className="ml-1">
                  {purchaseData?.purchase?.purchase_no}
                </span>
              </div>
            </div>

            <div className="border-l border-r p-2">
              <span className="font-semibold">Supplier:</span>{" "}
              <span>{purchaseData?.purchase?.purchase_supplier}</span>
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
                {purchaseData?.purchaseSub?.map((item, index) => (
                  <TableRow key={index} className="bg-white">
                    <TableCell className="text-center border-r">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {item.purchase_sub_item}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {item.purchase_sub_pcs}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {parseFloat(item.purchase_sub_qnty_sqr) ||
                        item.purchase_sub_qnty_sqr ||
                        0}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {item.purchase_sub_rate}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.purchase_sub_amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-white font-bold">
                  <TableCell colSpan={5} className="text-right border-r">
                    Sub-Total
                  </TableCell>
                  <TableCell className="text-right">
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
                {purchaseData?.purchase?.purchase_other_label && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right bg-white font-medium border-r border-b"
                    >
                      {purchaseData.purchase.purchase_other_label}
                    </TableCell>
                    <TableCell className="text-right bg-white border-b pr-4">
                      {Number(other).toFixed(0)}
                    </TableCell>
                  </TableRow>
                )}
                {purchaseData?.purchase?.purchase_other1_label && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-right bg-white font-medium border-r border-b"
                    >
                      {purchaseData.purchase.purchase_other1_label}
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
                  <TableCell className="text-right bg-white border-b pr-4">
                    {Number(grandTotal).toFixed(0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-right bg-white font-medium border-r border-b"
                  >
                    Tax (GST {purchaseData?.purchase?.purchase_gst_percentage || 18}% ={" "}
                    {Number(autoGst).toFixed(2)})
                  </TableCell>
                  <TableCell className="text-right bg-white border-b pr-4">
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
                    {Number(amountToBeCollected).toFixed(0)}
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

export default DesktopPurchaseView;
