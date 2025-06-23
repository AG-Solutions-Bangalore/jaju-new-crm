import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Printer, FileText, FileDown, Search, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import BASE_URL from "@/config/BaseUrl";
import html2pdf from "html2pdf.js";
import { ButtonConfig } from "@/config/ButtonConfig";

const formSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const TrialBalanceReport = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: "" ,
      to_date:  getTodayDate(),
    },
  });

  const { data: trialBalanceData, isLoading } = useQuery({
    queryKey: ["trialBalanceReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return { payment: [] };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-fetch-trialBalance-report`,
        searchParams,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
    enabled: !!searchParams,
  });

  const onSubmit = (data) => {
    if (searchParams && JSON.stringify(searchParams) === JSON.stringify(data)) {
      toast({
        title: "Same search parameters",
        description: "You're already viewing results for these search criteria",
        variant: "default",
      });
      return;
    }
    setSearchParams(data);
  };

  const handleDownloadCsv = async () => {
    try {
      if (!searchParams) return;

      const response = await axios.post(
        `${BASE_URL}/api/web-download-trialBalance-report`,
        searchParams,
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
      link.setAttribute("download", "trialBalance.csv");
      document.body.appendChild(link);
      link.click();

      toast({
        title: "Download Successful",
        description: "Trial Balance report downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download trial balance report",
        variant: "destructive",
      });
    }
  };
 const handlePrintPdf = useReactToPrint({
    content: () => tableRef.current,
      documentTitle: `Trial-Balance-Report`,
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
  const handleDownloadPDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5],
      filename: "trial-balance-report.pdf",
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
          description: "Trial balance report saved as PDF",
        });
      });
  };

  const positiveValues = trialBalanceData?.payment?.filter(
    (item) => !item.balance.toString().startsWith("-")
  ) || [];

  const positiveSum = positiveValues.reduce(
    (total, item) => total + parseFloat(item.balance),
    0
  );

  const negativeValues = trialBalanceData?.payment?.filter((item) =>
    item.balance.toString().startsWith("-")
  ) || [];

  const negativeSum = negativeValues.reduce(
    (total, item) => total + parseFloat(item.balance),
    0
  );

  return (
    <Page>
       <div className="w-full p-0 md:p-0">
               <div className="sm:hidden">
                        <div
                          className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
                        >
                          <div className="flex flex-col gap-2">
                            {/* Title + Print Button */}
                            <div className="flex justify-between items-center">
                              <h1 className="text-base font-bold text-gray-800 px-2">
                                Trial Balance Report
                              </h1>
                              <div className="flex gap-[2px]">
                                <button
                                  className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                                  onClick={handleDownloadCsv}
                                >
                                  <FileDown className="h-3 w-3" />
                                </button>
                                <button
                                  className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                                  onClick={handleDownloadPDF}
                                >
                                  <FileText className="h-3 w-3" />
                                </button>
                                <button
                                  className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                              onClick={handlePrintPdf}
                                >
                                  <Printer className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
              
                            {/* Form */}
                  {/* Form */}
<div className="bg-white p-2 rounded-md shadow-xs">
  <div className="grid grid-cols-2 gap-2 mb-2">
    <div className="space-y-1">
      <Label htmlFor="from_date_mobile" className="text-xs">
        From Date
      </Label>
      <Input
        id="from_date_mobile"
        type="date"
        {...form.register("from_date")}
        className="text-xs h-8"
        value={form.watch("from_date")}
        onChange={(e) => form.setValue("from_date", e.target.value)}
      />
      {form.formState.errors.from_date && (
        <p className="text-xs text-red-500">
          {form.formState.errors.from_date.message}
        </p>
      )}
    </div>

    <div className="space-y-1">
      <Label htmlFor="to_date_mobile" className="text-xs">
        To Date
      </Label>
      <Input
        id="to_date_mobile"
        type="date"
        {...form.register("to_date")}
        className="text-xs h-8"
        value={form.watch("to_date")}
        onChange={(e) => form.setValue("to_date", e.target.value)}
      />
      {form.formState.errors.to_date && (
        <p className="text-xs text-red-500">
          {form.formState.errors.to_date.message}
        </p>
      )}
    </div>
  </div>
  <div className="pt-1">
    <Button
      type="button"
      onClick={form.handleSubmit(onSubmit)}
      disabled={isLoading}
      className={`w-full h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Generating...
        </>
      ) : (
        <>
          <Search className="h-3 w-3 mr-1" />
          Generate Report
        </>
      )}
    </Button>
  </div>
</div>
                          </div>
                        </div>
              
                        {/* Mobile Results */}
                        {searchParams && (
                          <div ref={tableRef} className="p-2">
                            {isLoading ? (
                              <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
                            ) : (
                              <>
                                <div className="text-center font-semibold text-sm mb-2">
                                  Trial Balance Report
                                </div>
                                <div className="text-center text-xs mb-3">
                                  From {moment(searchParams.from_date).format("DD-MM-YYYY")} to {moment(searchParams.to_date).format("DD-MM-YYYY")}
                                </div>
              
                                {/* Debit Section */}
                                <div className="mb-4">
                                  <div className="text-xs font-medium bg-blue-50 p-1 text-center border">
                                    Debit Transactions
                                  </div>
                                  <table className="w-full border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="border p-1 text-left">Account</th>
                                        <th className="border p-1 text-right">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {negativeValues.length ? (
                                        negativeValues.map((item, index) => (
                                          <tr
                                            key={`debit-${index}`}
                                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                          >
                                            <td className="border p-1 text-left">
                                              {item.payment_about}
                                            </td>
                                            <td className="border p-1 text-right">
                                              {(item.balance * -1)}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={2} className="border p-2 text-center text-gray-500">
                                            No debit transactions
                                          </td>
                                        </tr>
                                      )}
                                      <tr className="bg-blue-50 font-medium">
                                        <td className="border p-1 text-left">Total</td>
                                        <td className="border p-1 text-right">
                                          {(negativeSum * -1)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
              
                                {/* Credit Section */}
                                <div className="mb-4">
                                  <div className="text-xs font-medium bg-blue-50 p-1 text-center border">
                                    Credit Transactions
                                  </div>
                                  <table className="w-full border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="border p-1 text-left">Account</th>
                                        <th className="border p-1 text-right">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {positiveValues.length ? (
                                        positiveValues.map((item, index) => (
                                          <tr
                                            key={`credit-${index}`}
                                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                          >
                                            <td className="border p-1 text-left">
                                              {item.payment_about}
                                            </td>
                                            <td className="border p-1 text-right">
                                              {item.balance}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={2} className="border p-2 text-center text-gray-500">
                                            No credit transactions
                                          </td>
                                        </tr>
                                      )}
                                      <tr className="bg-blue-50 font-medium">
                                        <td className="border p-1 text-left">Total</td>
                                        <td className="border p-1 text-right">
                                          {positiveSum}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
       
               <div className="hidden sm:block">



        <Card className="shadow-sm">
          <CardHeader>
         
             
              <CardTitle className="text-xl">Trial Balance Report</CardTitle>
     
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="from_date">From Date</Label>
                <Input
                  id="from_date"
                  type="date"
                  {...form.register("from_date")}
                />
                {form.formState.errors.from_date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.from_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="to_date">To Date</Label>
                <Input
                  id="to_date"
                  type="date"
                  {...form.register("to_date")}
                />
                {form.formState.errors.to_date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.to_date.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          {searchParams && (
            <>
              <CardHeader className="border-t">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
                  <CardTitle className="text-lg flex flex-row items-center gap-2">
                    <span>Report Results</span>
                    <span className="text-blue-800 text-xs">
                      {} to {moment(searchParams.to_date).format("DD-MM-YYYY")}
                    </span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCsv}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPDF}
                    >
                      <FileText className="mr-2 h-4 w-4" />
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
                    From {moment(searchParams.from_date).format("DD-MM-YYYY")} to {moment(searchParams.to_date).format("DD-MM-YYYY")}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Debit Table */}
                    <div className="flex-1">
                      <Table className="border">
                        <TableHeader>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead colSpan={2} className="text-center bg-blue-50">
                              Debit Transactions
                            </TableHead>
                          </TableRow>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead className="text-center border-r">Account</TableHead>
                            <TableHead className="text-center">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {negativeValues.length ? (
                            negativeValues.map((item, index) => (
                              <TableRow
                                key={`debit-${index}`}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                              >
                                <TableCell className="text-left border-r">
                                  {item.payment_about}
                                </TableCell>
                                <TableCell className="text-right">
                                  {(item.balance * -1)}
                                  {/* {(item.balance * -1).toFixed(2)} */}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                                No debit transactions found
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="bg-blue-50/30 font-medium">
                            <TableCell className="text-left border-r">Total</TableCell>
                            <TableCell className="text-right">
                              {(negativeSum * -1)}
                              {/* {(negativeSum * -1).toFixed(2)} */}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Credit Table */}
                    <div className="flex-1">
                      <Table className="border">
                        <TableHeader>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead colSpan={2} className="text-center bg-blue-50">
                              Credit Transactions
                            </TableHead>
                          </TableRow>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead className="text-center border-r">Account</TableHead>
                            <TableHead className="text-center">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {positiveValues.length ? (
                            positiveValues.map((item, index) => (
                              <TableRow
                                key={`credit-${index}`}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                              >
                                <TableCell className="text-left border-r">
                                  {item.payment_about}
                                </TableCell>
                                <TableCell className="text-right">
                                  {/* {item.balance.toFixed(2)} */}
                                  {item.balance}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                                No credit transactions found
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="bg-blue-50/30 font-medium">
                            <TableCell className="text-left border-r">Total</TableCell>
                            <TableCell className="text-right">
                              {positiveSum}
                              {/* {positiveSum.toFixed(2)} */}
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
      </div>
    </Page>
  );
};

export default TrialBalanceReport;