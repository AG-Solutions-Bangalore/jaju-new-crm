import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Printer, FileText, FileDown } from "lucide-react";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";

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

const DayBookReport = () => {
  const tableRef = useRef(null);
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
    const { data: dayBookData, isLoading, isError, refetch } = useQuery({
      queryKey: ["daybook", date],
      queryFn: async () => {
        const token = localStorage.getItem("token");
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
              Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      return format(new Date(dateStr), 'dd-MM-yyyy');
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
             <p>
               mobile day book
             </p>
            </div>
    
            <div className="hidden sm:block">
            <Card className="shadow-sm">
          <CardHeader className="">
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
                      <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableHead colSpan={3} className="text-center bg-blue-50">
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
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
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
                        <TableRow className="bg-blue-50/30 font-medium">
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
                      <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableHead colSpan={3} className="text-center bg-blue-50">
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
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
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
                        <TableRow className="bg-blue-50/30 font-medium">
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