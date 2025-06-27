import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Printer, FileText, FileDown } from "lucide-react";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import moment from "moment";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import BASE_URL from "@/config/BaseUrl";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import { ButtonConfig } from "@/config/ButtonConfig";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import Cookies from "js-cookie";

const DayBookReport = () => {
  const tableRef = useRef(null);
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const [date, setDate] = useState(moment().format('YYYY-MMM-DD'));
  
    const { data: dayBookData, isLoading, isError, refetch } = useQuery({
      queryKey: ["daybook", date],
      queryFn: async () => {
        const token = Cookies.get("token");
        const response = await axios.post(
          `${BASE_URL}/api/web-fetch-daybook-report`,
          { from_date: date },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      },
    });
   console.log("total_received_amount",dayBookData)
    const handleSavePDF = () => {
      const input = tableRef.current;
      const options = {
        margin: [5, 5, 5, 5],
        filename: "day-book-report.pdf",
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
            description: "Day book report saved as PDF",
          });
        });
    };
   
    const handleDownload = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/web-download-daybook-report`,
          { from_date: date },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            responseType: "blob",
          }
        );
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "day_book.csv");
        document.body.appendChild(link);
        link.click();
  
        toast({
          title: "Download Successful",
          description: "Day book report downloaded as CSV",
        });
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Failed to download day book report",
          variant: "destructive",
        });
      }
    };
  
    const formatDisplayDate = (dateStr) => {
      return moment(dateStr).format('DD-MMM-YYYY');
    };
    const handlePrintPdf = useReactToPrint({
      content: () => tableRef.current,
      documentTitle: `Day-Book-Report-${formatDisplayDate(date)}`,
      pageStyle: `
         @page {
                      size: auto;
                      margin: 5mm;
                    }
                    @media print {
                      body { 
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                      }
                      .hidden.sm\\:block {
                        display: block !important;
                      }
                      .flex-col.md\\:flex-row {
                        display: flex !important;
                        flex-direction: row !important;
                        width: 100% !important;
                        gap: 16px !important;
                      }
                      .flex-1 {
                        flex: 1 1 0% !important;
                        width: 50% !important;
                      }
                      table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 10pt !important;
                      }
                      th, td {
                        border: 1px solid #ddd !important;
                        padding: 4px !important;
                        text-align: center !important;
                      }
                      .bg-blue-50 {
                        background-color: rgba(239, 246, 255, 1) !important;
                      }
                      .bg-blue-50\\/30 {
                        background-color: rgba(239, 246, 255, 0.3) !important;
                      }
                      .bg-gray-100 {
                        background-color: rgba(243, 244, 246, 1) !important;
                      }
                      .bg-gray-50\\/30 {
                        background-color: rgba(249, 250, 251, 0.3) !important;
                      }
                    }
      `,
    });
 
  return (
       <Page>
          <div className="w-full p-0 md:p-0 grid grid-cols-1">
            <div className="sm:hidden">
             <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              {/* Title + Print Button */}
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-gray-800 px-2">
                  Day Book Report
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handleDownload}
                  >
                    <FaRegFileWord className="h-4 w-4" />
                  </button>
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handleSavePDF}
                  >
                    <FaRegFilePdf className="h-4 w-4" />
                  </button>
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                   onClick={handlePrintPdf}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white p-2 rounded-md shadow-xs">
                <div className="grid grid-cols-1 gap-2 mb-2">
                  <div className="space-y-1">
                    <Label htmlFor="mobile-report-date" className="text-xs">
                      Date:
                    </Label>
                    <Input
                      id="mobile-report-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="text-xs h-7"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Table */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          )}
          {isError && (
            <div className="text-center text-red-500 p-4">
              <p>Error Fetching day book report</p>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </div>
          )}
          {!isLoading && !isError && (
            <div ref={tableRef} className="p-2">
              <div className="text-center mb-2 font-semibold text-sm">
                Day Book Report - {formatDisplayDate(date)}
              </div>
              
              {/* Credit Section */}
              <div className="mb-4">
                <div className="text-sm font-medium bg-green-50 p-1 text-center border">
                  Credit Transactions
                </div>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-1 w-8">#</th>
                      <th className="border p-1 text-left">Credit By</th>
                      <th className="border p-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayBookData?.received?.length ? (
                      dayBookData.received.map((item, index) => (
                        <tr
                          key={`credit-${index}`}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}
                        >
                          <td className="border p-1 text-center">{index + 1}</td>
                          <td className="border p-1 text-left">{item.received_about}</td>
                          <td className="border p-1 text-center">{item.received_amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border p-2 text-center text-gray-500">
                          No credit transactions
                        </td>
                      </tr>
                    )}
                    {dayBookData?.total_received_amount && (
                      <tr className="bg-green-50 font-medium">
                        <td colSpan={2} className="border p-1 text-center">
                          Total
                        </td>
                        <td className="border p-1 text-center">
                          {dayBookData.total_received_amount.total_received_amount}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Debit Section */}
              <div className="mb-4">
                <div className="text-sm font-medium bg-red-50 p-1 text-center border">
                  Debit Transactions
                </div>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-1 w-8">#</th>
                      <th className="border p-1 text-left">Debit By</th>
                      <th className="border p-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayBookData?.payment?.length ? (
                      dayBookData.payment.map((item, index) => (
                        <tr
                          key={`debit-${index}`}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-red-50'}
                        >
                          <td className="border p-1 text-center">{index + 1}</td>
                          <td className="border p-1 text-left">{item.payment_about}</td>
                          <td className="border p-1 text-center">{item.payment_amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border p-2 text-center text-gray-500">
                          No debit transactions
                        </td>
                      </tr>
                    )}
                    {dayBookData?.total_payment_amount && (
                      <tr className="bg-red-50 font-medium">
                        <td colSpan={2} className="border p-1 text-center">
                          Total
                        </td>
                        <td className="border p-1 text-center">
                          {dayBookData.total_payment_amount.total_payment_amount}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
            </div>
    
            <div className="hidden sm:block">
            <Card className="shadow-sm">
              
          {/* <CardHeader className="">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-lg flex flex-row items-center gap-2">
                  <span>Day Book Report</span>
                  {dayBookData && (
                    <span className="text-blue-800 text-xs">
                      {formatDisplayDate(date)}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="report-date" className="text-sm">
                    Date:
                  </Label>
                  <Input
                    id="report-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-8 w-[150px]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePDF}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300" onClick={handlePrintPdf}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                
              </div>
            </div>
          </CardHeader> */}
          <CardHeader className={`p-4 ${ButtonConfig.cardheaderColor} rounded-t-lg shadow-sm mb-4`}>
  <div className="flex flex-col gap-2">
   
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <CardTitle className="text-lg font-bold text-gray-800">
          Day Book Report
        </CardTitle>
        {dayBookData && (
          <span className="text-blue-800 text-xs">
            {formatDisplayDate(date)}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          onClick={handleDownload}
        >
          <FaRegFileWord className="h-3 w-3" />
          CSV
        </Button>
        <Button
          size="sm"
          className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          onClick={handleSavePDF}
        >
          <FaRegFilePdf className="h-3 w-3" />
          PDF
        </Button>
        <Button
          size="sm"
          className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          onClick={handlePrintPdf}
        >
          <Printer className="h-3 w-3" />
          Print
        </Button>
      </div>
    </div>

 
    <div className="bg-white p-2 rounded-md shadow-xs">
      <div className="flex items-center space-x-2">
        <Label htmlFor="report-date" className="text-sm">
          Date:
        </Label>
        <Input
          id="report-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
    </div>
  </div>
</CardHeader>


          <CardContent>
          {isLoading && (
                <div className="flex justify-center items-center">
                  <Loader />
                </div>
              )}
              {isError && (
                <div className="text-center text-red-500">
                  <p>Error Fetching day book report</p>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}
              {!isLoading && !isError && (
            <div ref={tableRef} className="overflow-x-auto">
              <div className="text-center mb-4 font-semibold">
                Day Book Report - {formatDisplayDate(date)}
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Credit Table */}
                <div className="flex-1">
                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-green-100 hover:bg-green-100">
                        <TableHead colSpan={3} className="text-center text-black bg-green-50">
                          Credit Transactions
                        </TableHead>
                      </TableRow>
                      <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableHead className="text-center w-10">#</TableHead>
                        <TableHead className="text-center">Credit By</TableHead>
                        <TableHead className="text-center">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dayBookData?.received?.length ? (
                        dayBookData.received.map((item, index) => (
                          <TableRow
                            key={`credit-${index}`}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-green-50/30'}
                          >
                            <TableCell className="text-center border-r">{index + 1}</TableCell>
                            <TableCell className="text-left border-r">{item.received_about}</TableCell>
                            <TableCell className="text-center">{item.received_amount}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            No credit transactions found
                          </TableCell>
                        </TableRow>
                      )}
                      {dayBookData?.total_received_amount && (
                        <TableRow className="bg-green-50/30 font-medium">
                          <TableCell colSpan={2} className="text-center border-r">
                            Total
                          </TableCell>
                          <TableCell className="text-center">
                            {dayBookData.total_received_amount.total_received_amount}
                          </TableCell>
                        </TableRow>
                     )} 
                    </TableBody>
                  </Table>
                </div>

                {/* Debit Table */}
                <div className="flex-1">
                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-red-100 hover:bg-red-100">
                        <TableHead colSpan={3} className="text-center text-black bg-red-50">
                          Debit Transactions
                        </TableHead>
                      </TableRow>
                      <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableHead className="text-center w-10">#</TableHead>
                        <TableHead className="text-center">Debit By</TableHead>
                        <TableHead className="text-center">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dayBookData?.payment?.length ? (
                        dayBookData.payment.map((item, index) => (
                          <TableRow
                            key={`debit-${index}`}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-red-50/30'}
                          >
                            <TableCell className="text-center border-r">{index + 1}</TableCell>
                            <TableCell className="text-left border-r">{item.payment_about}</TableCell>
                            <TableCell className="text-center">{item.payment_amount}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            No debit transactions found
                          </TableCell>
                        </TableRow>
                      )}
                      {dayBookData?.total_payment_amount && (
                        <TableRow className="bg-red-50/30 font-medium">
                          <TableCell colSpan={2} className="text-center border-r">
                            Total
                          </TableCell>
                          <TableCell className="text-center">
                            {dayBookData.total_payment_amount.total_payment_amount}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
               )}
          </CardContent>
        </Card>
            </div>
          </div>
         
        </Page>
  )
}

export default DayBookReport