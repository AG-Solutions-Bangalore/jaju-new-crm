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
import ReactToPrint from "react-to-print";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import BASE_URL from "@/config/BaseUrl";
import html2pdf from "html2pdf.js";

const formSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const StocksReport = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: "",
      to_date:  getTodayDate(),
    },
  });

  const { data: stocksData, isLoading } = useQuery({
    queryKey: ["stocksReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return { stocks: [] };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-fetch-stock-report`,
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
        `${BASE_URL}/api/web-download-stock-report`,
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
      link.setAttribute("download", "stocks.csv");
      document.body.appendChild(link);
      link.click();

      toast({
        title: "Download Successful",
        description: "Stocks report downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download stocks report",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5],
      filename: "stocks-report.pdf",
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
        orientation: "landscape",
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
          description: "Stocks report saved as PDF",
        });
      });
  };

  return (
    <Page>
       <div className="w-full p-0 md:p-0 ">
            <div className="sm:hidden">
             <p>
               mobile stock
             </p>
            </div>
    
            <div className="hidden sm:block">



        <Card className="shadow-sm">
          <CardHeader>
         
              <CardTitle className="text-xl">Stocks Report</CardTitle>
           
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

              <div className="md:col-span-3 flex justify-end gap-4">
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
                    <span>Stock Report Results</span>
                    <span className="text-blue-800 text-xs">
                      {moment(searchParams.from_date).format("DD-MM-YYYY")} to {moment(searchParams.to_date).format("DD-MM-YYYY")}
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
                    <ReactToPrint
                      trigger={() => (
                        <Button variant="outline" size="sm">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                      )}
                      content={() => tableRef.current}
                      documentTitle="Stock-Report"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div ref={tableRef} className="overflow-x-auto print:p-4">
                  <div className="text-center mb-4 font-semibold">
                    Stocks Report
                  </div>
                  <div className="text-center text-sm mb-6">
                    From {moment(searchParams.from_date).format("DD-MM-YYYY")} to {moment(searchParams.to_date).format("DD-MM-YYYY")}
                  </div>

                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableHead className="text-center border-r">Items Name</TableHead>
                        <TableHead className="text-center border-r">Open Balance</TableHead>
                        <TableHead className="text-center border-r">Received</TableHead>
                        <TableHead className="text-center border-r">Sales</TableHead>
                        <TableHead className="text-center">Close Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocksData?.stocks?.length ? (
                        stocksData.stocks.map((item, index) => (
                          <TableRow
                            key={index}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                          >
                            <TableCell className="text-left border-r">
                              {item.product_type}
                            </TableCell>
                            <TableCell className="text-center border-r">
                              {item.openpurch - item.closesale}
                            </TableCell>
                            <TableCell className="text-center border-r">
                              {item.purch}
                            </TableCell>
                            <TableCell className="text-center border-r">
                              {item.sale}
                            </TableCell>
                            <TableCell className="text-center">
                              {(item.openpurch - item.closesale) + (item.purch - item.sale)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                            {isLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Loading stock data...
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-lg">📋</div>
                                <div>No stock data found for the selected criteria</div>
                                <div className="text-sm text-gray-400">
                                  Try adjusting your date range
                                </div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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

export default StocksReport;