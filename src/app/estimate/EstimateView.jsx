import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { Printer, FileText, ChevronLeft, Loader2 } from "lucide-react";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import Cookies from "js-cookie";

const EstimateView = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const { data: estimateData, isLoading } = useQuery({
    queryKey: ["estimate", id],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-estimate-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
  });

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5],
      filename: `estimate-${estimateData?.estimate?.estimate_no}.pdf`,
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
            pdf.internal.pageSize.getHeight() - 10
          );
        }
      })
      .save()
      .then(() => {
        toast({
          title: "PDF Generated",
          description: "Estimate saved as PDF",
        });
      });
  };

  const calculateTotal = (items) => {
    return items?.reduce(
      (total, item) => total + (parseFloat(item.estimate_sub_amount) || 0),
      0
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

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        <div className="sm:hidden">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              {/* Title + Print/PDF Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => navigate("/estimate")}
                    className="rounded-full p-1"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h1 className="text-base font-bold text-gray-800">
                    Estimate Details
                  </h1>
                </div>
                <div className="flex gap-[2px]">
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handleDownloadPDF}
                  >
                    <FaRegFilePdf className="h-4 w-4" />
                  </button>
                  <ReactToPrint
                    trigger={() => (
                      <button
                        className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    )}
                    content={() => tableRef.current}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Estimate Details */}
          {estimateData && (
            <div className="p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="text-center font-semibold text-sm mb-2">
                    ESTIMATE
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex justify-center border p-1">
                      <span className="font-medium">Date:</span>{" "}
                      <span className="ml-1">
                        {moment(estimateData?.estimate?.estimate_date).format(
                          "DD-MMM-YYYY"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-center border p-1">
                      <span className="font-medium">Estimate No:</span>{" "}
                      <span className="ml-1">
                        {estimateData?.estimate?.estimate_no}
                      </span>
                    </div>
                  </div>

                  <div className="border p-2 text-xs mb-3">
                    <span className="font-semibold">Customer:</span>{" "}
                    <span>{estimateData?.estimate?.estimate_customer}</span>
                  </div>

                  <table className="w-full border-collapse text-xs mb-3">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-1 text-left">Sl No</th>
                        <th className="border p-1 text-left">Item</th>
                        <th className="border p-1 text-right">Qty</th>
                        <th className="border p-1 text-right">Rate</th>
                        <th className="border p-1 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimateData?.estimateSub?.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border p-1 text-left">{index + 1}</td>
                          <td className="border p-1 text-left">
                            {item.estimate_sub_item}
                          </td>
                          <td className="border p-1 text-right">
                            {item.estimate_sub_qnty}
                          </td>
                          <td className="border p-1 text-right">
                            {item.estimate_sub_rate}
                          </td>
                          <td className="border p-1 text-right">
                            {item.estimate_sub_amount}
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
                          {calculateTotal(estimateData?.estimateSub)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Tax
                        </td>
                        <td className="border p-1 text-right">
                          {estimateData?.estimate?.estimate_tax}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Tempo Charges
                        </td>
                        <td className="border p-1 text-right">
                          {estimateData?.estimate?.estimate_tempo}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Loading/Unloading
                        </td>
                        <td className="border p-1 text-right">
                          {estimateData?.estimate?.estimate_loading}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Other Charges
                        </td>
                        <td className="border p-1 text-right">
                          {estimateData?.estimate?.estimate_other}
                        </td>
                      </tr>
                      <tr className="font-bold">
                        <td className="border p-1 text-right">Total</td>
                        <td className="border p-1 text-right">
                          {estimateData?.estimate?.estimate_gross}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 text-right font-medium">
                          Advance Received
                        </td>
                        <td className="border p-1 text-right">
                          {estimateData?.estimate?.estimate_advance}
                        </td>
                      </tr>
                      <tr className="font-bold">
                        <td className="border p-1 text-right">Balance</td>
                        <td className="border p-1 text-right">
                          {estimateData?.estimate?.estimate_balance}
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
                    onClick={() => navigate("/estimate")}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-xl">Estimate Details</CardTitle>
                </div>
                <div className="flex justify-end gap-2 ">
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
                      <TableHead className="text-center text-black font-bold  border-r">
                        Rate (₹)
                      </TableHead>
                      <TableHead className="text-center text-black font-bold">
                        Amount (₹)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimateData?.estimateSub?.map((item, index) => (
                      <TableRow
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-white "}
                      >
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
                        Tax
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
                      <TableCell className="text-right bg-white ">
                        {estimateData?.estimate?.estimate_balance}
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

export default EstimateView;
