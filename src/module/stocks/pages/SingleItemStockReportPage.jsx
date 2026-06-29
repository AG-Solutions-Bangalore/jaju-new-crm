import React, { useRef, useState, useMemo } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import Cookies from "js-cookie";
import html2pdf from "html2pdf.js";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import {
  useStocksReportByItem,
  useProductTypes,
  useProductGroups,
  useCreateProductType,
  useUpdateProductType,
} from "../hooks/useStocks";
import MobileSingleItemStockReport from "../components/MobileSingleItemStockReport";
import DesktopSingleItemStockReport from "../components/DesktopSingleItemStockReport";
import NewItemDialog from "../components/NewItemDialog";
import EditItemDialog from "../components/EditItemDialog";

const formSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const SingleItemStockReportPage = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState("");
  const [searchParams, setSearchParams] = useState(null);

  // New Item dialog
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemGroup, setNewItemGroup] = useState("");

  // Edit Item dialog
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [editItemName, setEditItemName] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  const formatCellValue = (value) => {
    if (value === undefined || value === null || value === "") return "";
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

  const { data: stocksData, isLoading } = useStocksReportByItem(searchParams);
  const { data: productTypes } = useProductTypes();
  const { data: productGroups = [] } = useProductGroups();

  const createProductMutation = useCreateProductType();
  const updateProductMutation = useUpdateProductType();

  const itemOptions = useMemo(() => {
    return (productGroups || [])
      .map((item) => {
        const name = item.item_name || item.product_type_group || item.product_type || "";
        return { value: name, label: name };
      })
      .filter((opt) => opt.value !== "");
  }, [productGroups]);

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

  const handleEditItem = () => {
    if (!selectedItem) {
      toast({
        title: "Validation Error",
        description: "Please select an item to rename.",
        variant: "destructive",
      });
      return;
    }
    const productItem = productTypes?.find(
      (p) =>
        (p.product_type || p.item_name || "").toLowerCase() ===
        selectedItem.toLowerCase()
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
    if (!selectedItem) {
      toast({
        title: "Validation Error",
        description: "Please select an item from the dropdown.",
        variant: "destructive",
      });
      return;
    }

    const params = {
      ...data,
      item_name: selectedItem,
    };

    if (searchParams && JSON.stringify(searchParams) === JSON.stringify(params)) {
      toast({
        title: "Same search parameters",
        description: "You're already viewing results for these search criteria",
        variant: "default",
      });
      return;
    }
    setSearchParams(params);
  };

  // Balance memo
  const {
    normalizedTxs,
    openingPieces,
    openingSqft,
    closingPieces,
    closingSqft,
    lastTxDate,
  } = useMemo(() => {
    const stockItem = stocksData?.stocks?.[0] || {};

    const opPieces = Number(stockItem.openpurch_pcs || 0) - Number(stockItem.closesale_pcs || 0);
    const opSqft = Number(stockItem.openpurch_sqr || 0) - Number(stockItem.closesale_sqr || 0);

    const clPieces = opPieces + Number(stockItem.purch_pcs || 0) - Number(stockItem.sale_pcs || 0);
    const clSqft = opSqft + Number(stockItem.purch_sqr || 0) - Number(stockItem.sale_sqr || 0);

    const purchaseList = Array.isArray(stocksData?.purchase) ? stocksData.purchase : [];
    const saleList = Array.isArray(stocksData?.sale) ? stocksData.sale : [];

    const combined = [
      ...purchaseList.map((p) => ({
        ...p,
        type: "purchase",
        date: p.purchase_sub_date || "",
      })),
      ...saleList.map((s) => ({
        ...s,
        type: "sale",
        date: s.sales_sub_date || "",
      })),
    ];

    combined.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    let runningPieces = opPieces;
    let runningSqft = opSqft;

    const normalized = combined.map((t) => {
      if (t.type === "purchase") {
        const inward_pcs = Number(t.purchase_sub_pcs || 0);
        const inward_sqft = Number(t.purchase_sub_qnty_sqr || 0);

        runningPieces += inward_pcs;
        runningSqft += inward_sqft;

        return {
          date: t.purchase_sub_date,
          reference: t.purchase_ref || "",
          inward_pieces: inward_pcs,
          inward_sqft: inward_sqft,
          outward_pieces: null,
          outward_sqft: null,
          balance_pieces: runningPieces,
          balance_sqft: runningSqft,
        };
      } else {
        const outward_pcs = Number(t.sales_sub_pcs || 0);
        const outward_sqft = Number(t.sales_sub_qnty_sqr || 0);

        runningPieces -= outward_pcs;
        runningSqft -= outward_sqft;

        return {
          date: t.sales_sub_date,
          reference: t.sales_ref || "",
          inward_pieces: null,
          inward_sqft: null,
          outward_pieces: outward_pcs,
          outward_sqft: outward_sqft,
          balance_pieces: runningPieces,
          balance_sqft: runningSqft,
        };
      }
    });

    if (searchParams) {
      normalized.unshift({
        date: searchParams.from_date || "",
        reference: "Opening Balance",
        isOpening: true,
        inward_pieces: null,
        inward_sqft: null,
        outward_pieces: null,
        outward_sqft: null,
        balance_pieces: opPieces,
        balance_sqft: opSqft,
      });
    }

    const lastDate =
      normalized.length > 0 ? normalized[normalized.length - 1].date : searchParams?.to_date || "";

    return {
      normalizedTxs: normalized,
      openingPieces: opPieces,
      openingSqft: opSqft,
      closingPieces: clPieces,
      closingSqft: clSqft,
      lastTxDate: lastDate,
    };
  }, [stocksData, searchParams]);

  const formatClosingBalanceText = (pcs, sqr) => {
    const p = parseFloat(pcs || 0);
    const s = parseFloat(sqr || 0);

    if (p === 0 && s === 0) {
      return "Zero Pieces and Zero SQFT";
    }

    const pcsText = p === 0 ? "Zero Pieces" : `${p} Pieces`;
    const sqftText = s === 0 ? "Zero SQFT" : `${s} SQFT`;

    return `${pcsText} and ${sqftText}`;
  };

  const handleDownloadCsv = () => {
    try {
      if (normalizedTxs.length === 0) {
        toast({
          title: "No Data",
          description: "There is no stock data to download",
          variant: "destructive",
        });
        return;
      }

      const headers = [
        "Date",
        "Reference",
        "Inward Piece/Box",
        "Inward SQFT",
        "Outward Piece/Box",
        "Outward SQFT",
        "Balance Piece/Box",
        "Balance SQFT",
      ];

      const rows = normalizedTxs.map((t) => [
        t.date ? moment(t.date).format("DD MMMM YYYY") : "",
        `"${t.reference}"`,
        t.inward_pieces ?? "",
        t.inward_sqft ?? "",
        t.outward_pieces ?? "",
        t.outward_sqft ?? "",
        t.balance_pieces ?? "",
        t.balance_sqft ?? "",
      ]);

      rows.push([
        lastTxDate ? moment(lastTxDate).format("DD MMMM YYYY") : "",
        `"Closing: ${formatClosingBalanceText(closingPieces, closingSqft)}"`,
        "",
        "",
        "",
        "",
        closingPieces,
        closingSqft,
      ]);

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
        `single_item_stock_${selectedItem}_${searchParams?.from_date}_to_${searchParams?.to_date}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Successful",
        description: "Transaction History downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download CSV",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    if (!input) return;

    const options = {
      margin: [5, 5, 5, 5],
      filename: `single_item_stock_${selectedItem}.pdf`,
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
          description: "Transaction History saved as PDF",
        });
      });
  };

  const commonProps = {
    form,
    isLoading,
    selectedItem,
    setSelectedItem,
    itemOptions,
    searchParams,
    normalizedTxs,
    openingPieces,
    openingSqft,
    closingPieces,
    closingSqft,
    lastTxDate,
    handleDownloadCsv,
    handleDownloadPDF,
    onSubmit,
    handleEditItem,
    setShowNewItemDialog,
    tableRef,
    formatCellValue,
    formatClosingBalanceText,
  };

  return (
    <Page>
      <MobileSingleItemStockReport {...commonProps} />
      <DesktopSingleItemStockReport {...commonProps} />

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

export default SingleItemStockReportPage;
