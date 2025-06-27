import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { Printer, FileText, ChevronLeft } from "lucide-react";
import html2pdf from "html2pdf.js";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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

const PurchaseGraniteView = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const { data: purchaseData, isLoading } = useQuery({
    queryKey: ["purchase", id],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-purchase-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
  });

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5],
      filename: `purchase-${purchaseData?.purchase?.purchase_no}.pdf`,
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
          description: "Purchase saved as PDF",
        });
      });
  };

  const calculateTotal = (items) => {
    return items?.reduce((total, item) => total + (parseFloat(item.purchase_sub_amount) || 0), 0);
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
            onClick={() => navigate("/purchase-granite")}
            className="rounded-full p-1"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-gray-800">
            Purchase Details
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

  {/* Mobile Purchase Details */}
  {purchaseData && (
    <div className="p-2">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="text-center border p-2 space-y-1 mb-3 text-xs">
            <h3 className="text-sm font-semibold">JAJU'S FLOORING CONCEPTS</h3>
            <p className="text-xs">New 80 ft Sompura, Sriniwaspura Road</p>
            <p className="text-xs">Bengaluru, Karnataka 560098</p>
            <p className="text-xs">Phone: 097420 42097</p>
            <h4 className="text-sm font-semibold mt-1">PURCHASE</h4>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex justify-center border p-1">
              <span className="font-medium">Date:</span>{" "}
              <span className="ml-1">
                {moment(purchaseData?.purchase?.purchase_date).format("DD-MMM-YYYY")}
              </span>
            </div>
            <div className="flex justify-center border p-1">
              <span className="font-medium">Purchase No:</span>{" "}
              <span className="ml-1">
                {purchaseData?.purchase?.purchase_no}
              </span>
            </div>
          </div>

          <div className="border p-2 text-xs mb-3">
            <span className="font-semibold">Supplier:</span>{" "}
            <span>{purchaseData?.purchase?.purchase_supplier}</span>
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
              {purchaseData?.purchaseSub?.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="border p-1 text-left">{index + 1}</td>
                  <td className="border p-1 text-left">
                    {item.purchase_sub_item}
                  </td>
                  <td className="border p-1 text-right">
                    {item.purchase_sub_qnty}
                  </td>
                  <td className="border p-1 text-right">
                    {item.purchase_sub_rate}
                  </td>
                  <td className="border p-1 text-right">
                    {item.purchase_sub_amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Table */}
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr className="font-bold">
                <td className="border p-1 text-right">Total</td>
                <td className="border p-1 text-right">
                  {calculateTotal(purchaseData?.purchaseSub)}
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
                  onClick={() => navigate("/purchase-granite")}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl">Purchase Granite Details</CardTitle>
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
                <h3 className="text-2xl font-semibold">JAJU'S FLOORING CONCEPTS</h3>
                <p className="text-sm">New 80 ft Sompura, Sriniwaspura Road, Banakshankari 6th Stage 11th Block, Srinivaspura, Bengaluru, Karnataka 560098</p>
                <p className="text-sm">Phone: 097420 42097</p>
                <h4 className="text-xl font-semibold mt-2">PURCHASE</h4>
              </div>

              <div className="grid grid-cols-2 border m-0">
  <div className="flex items-center justify-center border-r border-gray-300 py-2 px-3">
    <span className="font-medium">Date:</span>
    <span className="ml-1">
      {moment(purchaseData?.purchase?.purchase_date).format("DD-MMM-YYYY")}
    </span>
  </div>
  <div className="flex items-center justify-center py-2 px-3">
    <span className="font-medium">Purchase No:</span>
    <span className="ml-1">{purchaseData?.purchase?.purchase_no}</span>
  </div>
</div>


              <div className="border-l border-r  p-2">
                <span className="font-semibold">Supplier:</span>{" "}
                <span>{purchaseData?.purchase?.purchase_supplier}</span>
              </div>

              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-white">
                    <TableHead className="text-center text-black  border-r">Sl No</TableHead>
                    <TableHead className="text-center text-black  border-r">Item Name</TableHead>
                    <TableHead className="text-center text-black  border-r">Quantity</TableHead>
                    <TableHead className="text-center text-black  border-r">Rate (₹)</TableHead>
                    <TableHead className="text-center text-black ">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseData?.purchaseSub?.map((item, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-white'}>
                      <TableCell className="text-center border-r">{index + 1}</TableCell>
                      <TableCell className="text-center border-r">{item.purchase_sub_item}</TableCell>
                      <TableCell className="text-center border-r">{item.purchase_sub_qnty}</TableCell>
                      <TableCell className="text-center border-r">{item.purchase_sub_rate}</TableCell>
                      <TableCell className="text-center">{item.purchase_sub_amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-white font-bold">
                    <TableCell colSpan={4} className="text-right border-r">
                      Total
                    </TableCell>
                    <TableCell className="text-right">
                      {calculateTotal(purchaseData?.purchaseSub)}
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

export default PurchaseGraniteView;