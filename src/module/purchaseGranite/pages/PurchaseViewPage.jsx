import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import { useToast } from "@/hooks/use-toast";
import { usePurchaseById } from "../hooks/usePurchase";
import MobilePurchaseView from "../components/MobilePurchaseView";
import DesktopPurchaseView from "../components/DesktopPurchaseView";

const PurchaseViewPage = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const { data: purchaseData, isLoading } = usePurchaseById(id);

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    if (!input) return;

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

  const calculateSubTotal = (items) => {
    return items?.reduce(
      (total, item) => total + (parseFloat(item.purchase_sub_amount) || 0),
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

  const subTotal = calculateSubTotal(purchaseData?.purchaseSub);
  const tax = parseFloat(purchaseData?.purchase?.purchase_tax || 0);
  const tempo = parseFloat(purchaseData?.purchase?.purchase_tempo || 0);
  const loading = parseFloat(purchaseData?.purchase?.purchase_loading || 0);
  const unloading = parseFloat(purchaseData?.purchase?.purchase_unloading || 0);
  const other = parseFloat(purchaseData?.purchase?.purchase_other || 0);
  const other1 = parseFloat(purchaseData?.purchase?.purchase_other1 || 0);
  const gross = parseFloat(purchaseData?.purchase?.purchase_gross || 0);

  const unroundedTotal = subTotal + tax + tempo + loading + unloading + other + other1;
  const grandTotal = subTotal + tempo + loading + unloading + other + other1;
  const autoGst = grandTotal * 0.18;

  const roundOff =
    purchaseData?.purchase?.purchase_amount_round !== undefined &&
    purchaseData?.purchase?.purchase_amount_round !== null
      ? parseFloat(purchaseData.purchase.purchase_amount_round)
      : gross - parseFloat(purchaseData?.purchase?.purchase_temp_amount || unroundedTotal);

  const displayNetTotal = grandTotal + tax;
  const amountToBeCollected = displayNetTotal - roundOff;

  const commonProps = {
    purchaseData,
    calculateSubTotal,
    subTotal,
    tax,
    tempo,
    loading,
    unloading,
    other,
    other1,
    roundOff,
    grandTotal,
    autoGst,
    amountToBeCollected,
    isLoading,
    handleDownloadPDF,
    tableRef,
    navigate,
  };

  return (
    <Page>
      <MobilePurchaseView {...commonProps} />
      <DesktopPurchaseView {...commonProps} />
    </Page>
  );
};

export default PurchaseViewPage;
