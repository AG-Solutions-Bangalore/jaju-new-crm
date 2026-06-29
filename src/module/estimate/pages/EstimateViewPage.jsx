import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import { useToast } from "@/hooks/use-toast";
import { useEstimateById } from "../hooks/useEstimate";
import MobileEstimateView from "../components/MobileEstimateView";
import DesktopEstimateView from "../components/DesktopEstimateView";

const EstimateViewPage = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const { data: estimateData, isLoading } = useEstimateById(id);

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    if (!input) return;

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

  const commonProps = {
    estimateData,
    calculateTotal,
    isLoading,
    handleDownloadPDF,
    tableRef,
    navigate,
  };

  return (
    <Page>
      <MobileEstimateView {...commonProps} />
      <DesktopEstimateView {...commonProps} />
    </Page>
  );
};

export default EstimateViewPage;
