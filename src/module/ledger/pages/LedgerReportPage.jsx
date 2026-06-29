import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import { getFirstDayOfMonth } from "@/utils/getFirstDayOfMonth";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Card } from "@/components/ui/card";
import { Loader2, Printer } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";
import Page from "@/app/dashboard/page";
import {
  useAccountNames,
  useLedgerReport,
  useDownloadLedgerReport,
} from "../hooks/useLedger";
import LedgerForm from "../components/LedgerForm";
import LedgerReportTable from "../components/LedgerReportTable";

const formSchema = z.object({
  account_name: z.string().min(1, "Account name is required"),
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const LedgerReportPage = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_name: "",
      from_date: getFirstDayOfMonth(),
      to_date: getTodayDate(),
    },
  });

  // Queries & Mutations
  const { data: accountNames = [] } = useAccountNames();
  const { data: ledgerData, isLoading } = useLedgerReport(searchParams);
  const downloadMutation = useDownloadLedgerReport();

  const handleDownloadCsv = () => {
    if (!searchParams) return;
    downloadMutation.mutate(searchParams);
  };

  const handlePrintPdf = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `Ledger-Report-${searchParams?.account_name}`,
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
    if (!input) return;

    const options = {
      margin: [5, 5, 5, 5],
      filename: "ledger-report.pdf",
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
          description: "Ledger report saved as PDF",
        });
      });
  };

  const calculateTotalPayment = () => {
    if (!ledgerData?.payment) return 0;
    return ledgerData.payment.reduce(
      (total, item) => total + (Number(item.payment_amount) || 0),
      0
    );
  };

  const calculateTotalReceived = () => {
    if (!ledgerData?.received) return 0;
    return ledgerData.received.reduce(
      (total, item) => total + (Number(item.received_amount) || 0),
      0
    );
  };

  const onSubmit = (data, e) => {
    e.preventDefault();
    if (searchParams && JSON.stringify(searchParams) === JSON.stringify(data)) {
      toast({
        title: "Same search parameters",
        description: "You're already viewing results for these search criteria",
      });
      return;
    }
    setSearchParams(data);
  };

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        {/* Mobile View */}
        <div className="sm:hidden">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-gray-800 px-2">
                  Ledger Report
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handleDownloadCsv}
                    disabled={!searchParams}
                  >
                    <FaRegFileExcel className="h-4 w-4" />
                  </button>
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handleDownloadPDF}
                    disabled={!searchParams}
                  >
                    <FaRegFilePdf className="h-4 w-4" />
                  </button>
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handlePrintPdf}
                    disabled={!searchParams}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <LedgerForm
                form={form}
                onSubmit={onSubmit}
                accountNames={accountNames}
                isLoading={isLoading}
                layout="mobile"
              />
            </div>
          </div>

          {searchParams && (
            <LedgerReportTable
              searchParams={searchParams}
              ledgerData={ledgerData}
              tableRef={tableRef}
              calculateTotalPayment={calculateTotalPayment}
              calculateTotalReceived={calculateTotalReceived}
              handleDownloadCsv={handleDownloadCsv}
              handleDownloadPDF={handleDownloadPDF}
              handlePrintPdf={handlePrintPdf}
              layout="mobile"
            />
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <Card className="shadow-sm">
            <div
              className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="w-[30%] shrink-0">
                  <h1 className="text-xl font-bold text-gray-800 truncate">
                    Ledger Report
                  </h1>
                  {searchParams && (
                    <p className="text-md text-gray-500 truncate">
                      {searchParams.account_name || "All Accounts"}
                    </p>
                  )}
                </div>

                <div className="bg-white w-full lg:w-[70%] p-3 rounded-md shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                    <LedgerForm
                      form={form}
                      onSubmit={onSubmit}
                      accountNames={accountNames}
                      isLoading={isLoading}
                      layout="desktop"
                    />
                  </div>
                </div>
              </div>
            </div>

            {searchParams && (
              <LedgerReportTable
                searchParams={searchParams}
                ledgerData={ledgerData}
                tableRef={tableRef}
                calculateTotalPayment={calculateTotalPayment}
                calculateTotalReceived={calculateTotalReceived}
                handleDownloadCsv={handleDownloadCsv}
                handleDownloadPDF={handleDownloadPDF}
                handlePrintPdf={handlePrintPdf}
                layout="desktop"
              />
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default LedgerReportPage;
