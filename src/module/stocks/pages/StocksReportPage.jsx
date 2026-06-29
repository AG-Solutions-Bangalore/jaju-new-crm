import React, { useRef, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import html2pdf from "html2pdf.js";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import {
  useStocksReport,
  useProductTypes,
  useProductGroups,
  useCreateProductType,
  useUpdateProductType,
} from "../hooks/useStocks";
import MobileStocksReport from "../components/MobileStocksReport";
import DesktopStocksReport from "../components/DesktopStocksReport";
import NewItemDialog from "../components/NewItemDialog";
import EditItemDialog from "../components/EditItemDialog";

const formSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const StocksReportPage = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const [selectedUnits, setSelectedUnits] = useState({
    box: true,
    sqft: true,
  });
  const [searchParams, setSearchParams] = useState(null);

  // New Item dialog
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemGroup, setNewItemGroup] = useState("");

  // Edit Item dialog
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [editItemName, setEditItemName] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  const formatStockValue = (value) => {
    if (value === undefined || value === null || value === "") return "0";
    const num = parseFloat(value);
    return isNaN(num) ? value : parseFloat(num.toFixed(4));
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: "2026-04-01",
      to_date: getTodayDate(),
    },
  });

  const handleUnitToggle = (unit) => {
    setSelectedUnits((prev) => {
      if (prev[unit] && !prev[unit === "box" ? "sqft" : "box"]) {
        return prev;
      }
      return { ...prev, [unit]: !prev[unit] };
    });
  };

  const { data: stocksData, isLoading } = useStocksReport(searchParams);
  const { data: productTypes } = useProductTypes();
  const { data: productGroups } = useProductGroups();

  const createProductMutation = useCreateProductType();
  const updateProductMutation = useUpdateProductType();

  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate(
      {
        product_type: newItemName.trim(),
        product_type_group: newItemGroup || "",
      },
      {
        onSuccess: () => {
          setShowNewItemDialog(false);
          setNewItemName("");
          setNewItemGroup("");
        },
      }
    );
  };

  const handleEditItem = (itemName) => {
    const productItem = productTypes?.find(
      (p) =>
        (p.product_type || p.item_name || "").toLowerCase() ===
        itemName.toLowerCase()
    );
    if (!productItem) {
      toast({
        title: "Not Found",
        description: "Item not found in product master. Create it first.",
        variant: "destructive",
      });
      return;
    }
    setEditingProductId(productItem.id);
    setEditItemName(productItem.product_type || productItem.item_name);
    setShowEditItemDialog(true);
  };

  const handleUpdateItem = () => {
    if (!editItemName.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }
    updateProductMutation.mutate(
      {
        id: editingProductId,
        data: { product_type: editItemName.trim() },
      },
      {
        onSuccess: () => {
          setShowEditItemDialog(false);
          setEditItemName("");
          setEditingProductId(null);
        },
      }
    );
  };

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

  const handleDownloadCsv = () => {
    try {
      if (!stocksData || !stocksData.stocks || stocksData.stocks.length === 0) {
        toast({
          title: "No Data",
          description: "There is no stock data to download",
          variant: "destructive",
        });
        return;
      }

      const headers = [
        "Item Name",
        "Open Balance",
        "Purchase",
        "Sale",
        "Close Balance",
      ];

      const rows = stocksData.stocks.map((item) => {
        let openBal = "";
        let purchaseVal = "";
        let saleVal = "";
        let closeBal = "";

        if (selectedUnits.box && selectedUnits.sqft) {
          openBal = `"${formatStockValue(item.openpurch_pcs - item.closesale_pcs)} Pcs , ${formatStockValue(item.openpurch_sqr - item.closesale_sqr)} Sqft"`;
          purchaseVal = `"${formatStockValue(item.purch_pcs)} Pcs , ${formatStockValue(item.purch_sqr)} Sqft"`;
          saleVal = `"${formatStockValue(item.sale_pcs)} Pcs , ${formatStockValue(item.sale_sqr)} Sqft"`;
          closeBal = `"${formatStockValue(item.openpurch_pcs - item.closesale_pcs + (item.purch_pcs - item.sale_pcs))} Pcs , ${formatStockValue(item.openpurch_sqr - item.closesale_sqr + (item.purch_sqr - item.sale_sqr))} Sqft"`;
        } else if (selectedUnits.box) {
          openBal = `"${formatStockValue(item.openpurch_pcs - item.closesale_pcs)} Pcs"`;
          purchaseVal = `"${formatStockValue(item.purch_pcs)} Pcs"`;
          saleVal = `"${formatStockValue(item.sale_pcs)} Pcs"`;
          closeBal = `"${formatStockValue(item.openpurch_pcs - item.closesale_pcs + (item.purch_pcs - item.sale_pcs))} Pcs"`;
        } else if (selectedUnits.sqft) {
          openBal = `"${formatStockValue(item.openpurch_sqr - item.closesale_sqr)} Sqft"`;
          purchaseVal = `"${formatStockValue(item.purch_sqr)} Sqft"`;
          saleVal = `"${formatStockValue(item.sale_sqr)} Sqft"`;
          closeBal = `"${formatStockValue(item.openpurch_sqr - item.closesale_sqr + (item.purch_sqr - item.sale_sqr))} Sqft"`;
        }

        return [`"${item.item_name}"`, openBal, purchaseVal, saleVal, closeBal];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((e) => e.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `stocks_report_${searchParams?.from_date}_to_${searchParams?.to_date}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
    if (!input) return;

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

  const commonProps = {
    form,
    isLoading,
    stocksData,
    searchParams,
    selectedUnits,
    handleUnitToggle,
    handleDownloadCsv,
    handleDownloadPDF,
    onSubmit,
    handleEditItem,
    setShowNewItemDialog,
    tableRef,
    formatStockValue,
  };

  return (
    <Page>
      <MobileStocksReport {...commonProps} />
      <DesktopStocksReport {...commonProps} />

      <NewItemDialog
        open={showNewItemDialog}
        onOpenChange={setShowNewItemDialog}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemGroup={newItemGroup}
        setNewItemGroup={setNewItemGroup}
        handleCreateItem={handleCreateItem}
        isPending={createProductMutation.isPending}
      />

      <EditItemDialog
        open={showEditItemDialog}
        onOpenChange={setShowEditItemDialog}
        editItemName={editItemName}
        setEditItemName={setEditItemName}
        handleUpdateItem={handleUpdateItem}
        isPending={updateProductMutation.isPending}
      />
    </Page>
  );
};

export default StocksReportPage;
