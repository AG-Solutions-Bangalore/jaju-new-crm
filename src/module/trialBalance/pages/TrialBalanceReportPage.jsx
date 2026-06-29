import React, { useRef, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import BASE_URL from "@/config/BaseUrl";
import { useTrialBalanceReport } from "../hooks/useTrialBalance";
import MobileTrialBalanceReport from "../components/MobileTrialBalanceReport";
import DesktopTrialBalanceReport from "../components/DesktopTrialBalanceReport";

const formSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const TrialBalanceReportPage = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useState(null);
  const [hideZeroEntries, setHideZeroEntries] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: "2025-04-01",
      to_date: getTodayDate(),
    },
  });

  const { data: trialBalanceData, isLoading } = useTrialBalanceReport(searchParams);

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
            Authorization: `Bearer ${Cookies.get("token")}`,
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
      document.body.removeChild(link);

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
    if (!input) return;

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

  const filteredPayments =
    trialBalanceData?.payment?.filter((item) => {
      if (hideZeroEntries) {
        return parseFloat(item.balance) !== 0;
      }
      return true;
    }) || [];

  const positiveValues =
    filteredPayments.filter((item) => !item.balance.toString().startsWith("-")) || [];

  const positiveSum = positiveValues.reduce(
    (total, item) => total + parseFloat(item.balance),
    0
  );

  const negativeValues =
    filteredPayments.filter((item) => item.balance.toString().startsWith("-")) || [];

  const negativeSum = negativeValues.reduce(
    (total, item) => total + parseFloat(item.balance),
    0
  );

  const commonProps = {
    form,
    isLoading,
    searchParams,
    hideZeroEntries,
    setHideZeroEntries,
    positiveValues,
    positiveSum,
    negativeValues,
    negativeSum,
    handleDownloadCsv,
    handleDownloadPDF,
    handlePrintPdf,
    onSubmit,
    tableRef,
  };

  return (
    <Page>
      <MobileTrialBalanceReport {...commonProps} />
      <DesktopTrialBalanceReport {...commonProps} />
    </Page>
  );
};

export default TrialBalanceReportPage;
