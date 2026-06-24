import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { Printer, FileText, ChevronLeft, Edit } from "lucide-react";
import html2pdf from "html2pdf.js";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";

import ReactToPrint from "react-to-print";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/loader/Loader";
import { FaRegFilePdf } from "react-icons/fa";
import Cookies from "js-cookie";

const SalesView = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales", id],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-sales-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5],
      filename: `sales-${salesData?.sales?.sales_no}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowHeight: input.scrollHeight,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: "avoid-all" },
    };

    html2pdf()
      .from(input)
      .set(options)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 20,
            pdf.internal.pageSize.getHeight() - 10,
          );
        }
      })
      .save()
      .then(() => {
        toast({
          title: "PDF Generated",
          description: "Sales saved as PDF",
        });
      });
  };

  const calculateSubTotal = (items) => {
    return items?.reduce(
      (total, item) => total + (parseFloat(item.sales_sub_amount) || 0),
      0,
    );
  };

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-screen">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Page>
    );
  }

  const subTotal = calculateSubTotal(salesData?.salesSub);
  const tax = parseFloat(salesData?.sales?.sales_tax || 0);
  const tempo = parseFloat(salesData?.sales?.sales_tempo || 0);
  const loading = parseFloat(salesData?.sales?.sales_loading || 0);
  const unloading = parseFloat(salesData?.sales?.sales_unloading || 0);
  const other = parseFloat(salesData?.sales?.sales_other || 0);
  const other1 = parseFloat(salesData?.sales?.sales_other1 || 0);
  const gross = parseFloat(salesData?.sales?.sales_gross || 0);

  const unroundedTotal =
    subTotal + tax + tempo + loading + unloading + other + other1;

  const grandTotal = subTotal + tempo + loading + unloading + other + other1;
  const autoGst = grandTotal * 0.18;

  const roundOff =
    salesData?.sales?.sales_amount_round !== undefined &&
    salesData?.sales?.sales_amount_round !== null
      ? parseFloat(salesData.sales.sales_amount_round)
      : gross -
        parseFloat(salesData?.sales?.sales_temp_amount || unroundedTotal);

  const displayNetTotal = grandTotal + tax;
  const amountToBeCollected = displayNetTotal - roundOff;
  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        <div className="sm:hidden">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              {/* Title + Print/PDF Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => navigate("/sales")}
                    className="rounded-full p-1"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h1 className="text-base font-bold text-gray-800">
                    Sales Details
                  </h1>
                </div>
                <div className="flex gap-[2px]">
                  <button
                    className={`sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm p-3 rounded-b-md`}
                    onClick={() => navigate(`/sales/edit/${id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className={`sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm p-3 rounded-b-md`}
                    onClick={handleDownloadPDF}
                  >
                    <FaRegFilePdf className="h-4 w-4" />
                  </button>
                  <ReactToPrint
                    trigger={() => (
                      <button
                        className={`sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm p-3 rounded-b-md`}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    )}
                    content={() => tableRef.current}
                    documentTitle="Sales Report"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sales Details */}
          {salesData && (
            <div className="p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="text-center border p-2 space-y-1 mb-3 text-xs">
                    <h3 className="text-sm font-semibold">JAJU'S ESTIMATE</h3>
                    {/* <p className="text-xs">New 80 ft Sompura, Sriniwaspura Road</p>
            <p className="text-xs">Bengaluru, Karnataka 560098</p>
            <p className="text-xs">Phone: 097420 42097</p> */}
                    <h4 className="text-sm font-semibold mt-1">SALES</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex justify-center border p-1">
                      <span className="font-medium">Date:</span>{" "}
                      <span className="ml-1">
                        {moment(salesData?.sales?.sales_date).format(
                          "DD-MMM-YYYY",
                        )}
                      </span>
                    </div>
                    <div className="flex justify-center border p-1">
                      <span className="font-medium"> JFC Bill No:</span>{" "}
                      <span className="ml-1">{salesData?.sales?.sales_no}</span>
                    </div>
                  </div>

                  <div className="border p-2 text-xs mb-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold">Customer:</span>{" "}
                      <span>{salesData?.sales?.sales_customer}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Phone:</span>{" "}
                      <span>{salesData?.sales?.sales_mobile}</span>
                    </div>
                  </div>

                  <table className="w-full border-collapse text-xs mb-3">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-1 text-left">Sl No</th>
                        <th className="border p-1 text-left">Item</th>
                        <th className="border p-1 text-right">Qty (pcs/box)</th>
                        <th className="border p-1 text-right">Qty (sqft)</th>
                        <th className="border p-1 text-right">Rate</th>
                        <th className="border p-1 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData?.salesSub?.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border p-1 text-left">{index + 1}</td>
                          <td className="border p-1 text-left">
                            {item.sales_sub_item}
                          </td>
                          <td className="border p-1 text-right">
                            {item.sales_sub_pcs}
                          </td>
                          <td className="border p-1 text-right">
                            {parseFloat(item.sales_sub_qnty_sqr) ||
                              item.sales_sub_qnty_sqr ||
                              0}
                          </td>
                          <td className="border p-1 text-right">
                            {Number(item.sales_sub_rate).toFixed(0)}
                          </td>
                          <td className="border p-1 text-right">
                            {Number(item.sales_sub_amount).toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Table */}
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Sub-Total
                        </td>
                        <td className="border p-1 text-right">
                          {Number(
                            calculateSubTotal(salesData?.salesSub),
                          ).toFixed(0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Tax (GST{" "}
                          {salesData?.sales?.sales_gst_percentage || 18}% ={" "}
                          {Number(salesData?.sales?.sales_tax).toFixed(0)})
                        </td>
                        <td className="border p-1 text-right">
                          {Number(salesData?.sales?.sales_tax).toFixed(0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Tempo Charges
                        </td>
                        <td className="border p-1 text-right">
                          {Number(salesData?.sales?.sales_tempo).toFixed(0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Loading
                        </td>
                        <td className="border p-1 text-right">
                          {Number(salesData?.sales?.sales_loading).toFixed(0)}
                        </td>
                      </tr>
                      {Number(salesData?.sales?.sales_unloading || 0) > 0 && (
                        <tr>
                          <td className="border p-1 text-right font-medium">
                            Unloading
                          </td>
                          <td className="border p-1 text-right">
                            {Number(salesData?.sales?.sales_unloading).toFixed(
                              0,
                            )}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Other Charges
                        </td>
                        <td className="border p-1 text-right">
                          {Number(salesData?.sales?.sales_other).toFixed(0)}
                        </td>
                      </tr>
                      {Number(salesData?.sales?.sales_other1 || 0) > 0 && (
                        <tr>
                          <td className="border p-1 text-right font-medium">
                            {salesData?.sales?.sales_other1_label ||
                              "Other Charges 2"}
                          </td>
                          <td className="border p-1 text-right">
                            {Number(salesData?.sales?.sales_other1).toFixed(0)}
                          </td>
                        </tr>
                      )}
                      {Math.abs(Math.round(roundOff)) > 0 && (
                        <tr>
                          <td className="border p-1 text-right font-medium">
                            Round Off
                          </td>
                          <td className="border p-1 text-right">
                            {Math.round(roundOff) > 0
                              ? `+${Math.round(roundOff)}`
                              : Math.round(roundOff)}
                          </td>
                        </tr>
                      )}
                      <tr className="font-bold">
                        <td className="border p-1 text-right">
                          Amount to be Collected
                        </td>
                        <td className="border p-1 text-right">
                          {Number(amountToBeCollected).toFixed(0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
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
                <div className="flex justify-end gap-2 ">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/sales/edit/${id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
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
                    documentTitle="Sales Report"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div ref={tableRef} className="overflow-x-auto print:p-4">
                <div className="text-center border-l border-t border-r p-4 space-y-1">
                  <h3 className="text-2xl font-semibold">JAJU'S ESTIMATE</h3>
                  {/* <p className="text-sm">New 80 ft Sompura, Sriniwaspura Road, Banakshankari 6th Stage 11th Block, Srinivaspura, Bengaluru, Karnataka 560098</p>
                <p className="text-sm">Phone: 097420 42097</p>
                <h4 className="text-xl font-semibold mt-2">SALES</h4> */}
                </div>

                <div className="grid grid-cols-2 border  m-0">
                  <div className="flex items-center justify-center border-r border-gray-300 py-2 px-3">
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">
                      {moment(salesData?.sales?.sales_date).format(
                        "DD-MMM-YYYY",
                      )}
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
                      <TableHead className="text-center text-black font-bold   border-r">
                        Sl No
                      </TableHead>
                      <TableHead className="text-center text-black font-bold  border-r">
                        Item Name
                      </TableHead>
                      <TableHead className="text-center text-black font-bold  border-r">
                        Qnty (pcs/box)
                      </TableHead>
                      <TableHead className="text-center text-black font-bold  border-r">
                        Qnty (sqft)
                      </TableHead>
                      <TableHead className="text-center text-black font-bold  border-r">
                        Rate{" "}
                      </TableHead>
                      <TableHead className="text-center text-black font-bold ">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData?.salesSub?.map((item, index) => (
                      <TableRow
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-white"}
                      >
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
                      <TableCell
                        colSpan={5}
                        className="text-right bg-white font-medium border-r border-b"
                      >
                        Sub-Total
                      </TableCell>
                      <TableCell className="text-right  bg-white border-b pr-4">
                        {Number(calculateSubTotal(salesData?.salesSub)).toFixed(
                          0,
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-right  bg-white font-medium border-r border-b"
                      >
                        Tempo Charges
                      </TableCell>
                      <TableCell className="text-right  bg-white border-b pr-4">
                        {Number(salesData?.sales?.sales_tempo).toFixed(0)}
                      </TableCell>
                    </TableRow>
                    {Number(salesData?.sales?.sales_loading || 0) > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-right bg-white font-medium border-r border-b"
                        >
                          Loading
                        </TableCell>
                        <TableCell className="text-right bg-white border-b pr-4">
                          {Number(salesData?.sales?.sales_loading).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    )}
                    {Number(salesData?.sales?.sales_unloading || 0) > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-right bg-white font-medium border-r border-b"
                        >
                          Unloading
                        </TableCell>
                        <TableCell className="text-right bg-white border-b pr-4">
                          {Number(salesData?.sales?.sales_unloading).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    )}
                    {salesData?.sales_other_label && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-right bg-white font-medium border-r border-b"
                        >
                          {salesData.sales_other_label}
                        </TableCell>
                        <TableCell className="text-right bg-white border-b pr-4">
                          {Number(salesData?.sales?.sales_other).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    )}
                    {salesData.sales_other1_label && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-right bg-white font-medium border-r border-b"
                        >
                          {salesData.sales_other1_label}
                        </TableCell>
                        <TableCell className="text-right bg-white border-b pr-4">
                          {Number(salesData?.sales?.sales_other1).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-right bg-white  font-medium border-r border-b"
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
                        className="text-right bg-white  font-medium border-r border-b"
                      >
                        Tax (GST {salesData?.sales?.sales_gst_percentage || 18}%
                        = {Number(autoGst).toFixed(2)})
                      </TableCell>
                      <TableCell className="text-right bg-white border-b pr-4">
                        {Number(salesData?.sales?.sales_tax).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {Number(salesData?.sales?.sales_other1 || 0) > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-right bg-white font-medium border-r border-b"
                        >
                          {salesData?.sales?.sales_other1_label ||
                            "Other Charges 2"}
                        </TableCell>
                        <TableCell className="text-right bg-white border-b pr-4">
                          {Number(salesData?.sales?.sales_other1).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    )}
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
                      <TableCell
                        colSpan={5}
                        className="text-right bg-white border-r border-b"
                      >
                        Amount to be Collected
                      </TableCell>
                      <TableCell className="text-right  bg-white border-b pr-4">
                        {Number(salesData?.sales?.sales_gross).toFixed(0)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default SalesView;
