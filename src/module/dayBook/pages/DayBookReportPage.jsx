import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import moment from "moment";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import {
  useDayBookReport,
  useDownloadDayBookReport,
} from "../hooks/useDayBook";
import DayBookReportHeader from "../components/DayBookReportHeader";
import TransactionTable from "../components/TransactionTable";

const DayBookReportPage = () => {
  const tableRef = useRef(null);
  const { toast } = useToast();
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));

  const {
    data: dayBookData,
    isLoading,
    isError,
    refetch,
  } = useDayBookReport(date);
  const downloadMutation = useDownloadDayBookReport();

  const formatDisplayDate = (dateStr) => moment(dateStr).format("DD-MMM-YYYY");

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
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
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
          description: "Day book report saved as PDF",
        });
      });
  };

  const handleDownload = () => {
    downloadMutation.mutate({ from_date: date });
  };

  const handlePrintPdf = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `Day-Book-Report-${formatDisplayDate(date)}`,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        .hidden.sm\\:block { display: block !important; }
        .flex-col.md\\:flex-row { display: flex !important; flex-direction: row !important; width: 100% !important; gap: 16px !important; }
        .flex-1 { flex: 1 1 0% !important; width: 50% !important; }
        table { width: 100% !important; border-collapse: collapse !important; font-size: 10pt !important; }
        th, td { border: 1px solid #ddd !important; padding: 4px !important; text-align: center !important; }
        .bg-blue-50 { background-color: rgba(239, 246, 255, 1) !important; }
        .bg-blue-50\\/30 { background-color: rgba(239, 246, 255, 0.3) !important; }
        .bg-gray-100 { background-color: rgba(243, 244, 246, 1) !important; }
        .bg-gray-50\\/30 { background-color: rgba(249, 250, 251, 0.3) !important; }
      }
    `,
  });

  const headerProps = {
    date,
    onDateChange: setDate,
    onDownload: handleDownload,
    onSavePDF: handleSavePDF,
    onPrint: handlePrintPdf,
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center text-red-500 p-4">
          <p>Error Fetching day book report</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <div ref={tableRef} className="p-2">
        <div className="text-center mb-2 font-semibold text-sm">
          Day Book Report - {formatDisplayDate(date)}
        </div>
        <TransactionTable
          type="credit"
          items={dayBookData?.received}
          total={dayBookData?.total_received_amount}
        />
        <TransactionTable
          type="debit"
          items={dayBookData?.payment}
          total={dayBookData?.total_payment_amount}
        />
      </div>
    );
  };

  const renderDesktopContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center text-red-500">
          <p>Error Fetching day book report</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <div ref={tableRef} className="overflow-x-auto">
        <div className="text-center mb-4 font-semibold">
          Day Book Report - {formatDisplayDate(date)}
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <TransactionTable
            type="credit"
            items={dayBookData?.received}
            total={dayBookData?.total_received_amount}
            variant="desktop"
          />
          <TransactionTable
            type="debit"
            items={dayBookData?.payment}
            total={dayBookData?.total_payment_amount}
            variant="desktop"
          />
        </div>
      </div>
    );
  };

  return (
    <Page>
      <div className="w-full p-0 md:p-0 grid grid-cols-1">
        {/* Mobile */}
        <div className="sm:hidden">
          <DayBookReportHeader {...headerProps} variant="mobile" />
          {renderContent()}
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <Card className="shadow-sm">
            <DayBookReportHeader {...headerProps} variant="desktop" />
            <CardContent>{renderDesktopContent()}</CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default DayBookReportPage;
