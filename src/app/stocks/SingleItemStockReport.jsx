import React, { useRef, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import {
  Printer,
  FileText,
  FileDown,
  Search,
  ChevronLeft,
  Plus,
  Pencil,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import ReactToPrint from "react-to-print";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import BASE_URL from "@/config/BaseUrl";
import html2pdf from "html2pdf.js";
import { ButtonConfig } from "@/config/ButtonConfig";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import Cookies from "js-cookie";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const SingleItemStockReport = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const formatStockValue = (value) => {
    if (value === undefined || value === null || value === "") return "-";
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

  const { data: stocksData, isLoading } = useQuery({
    queryKey: ["stocksReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return null;

      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-fetch-stock-new-report-by-item`,
        searchParams,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    enabled: !!searchParams,
  });

  const { data: productTypes } = useQuery({
    queryKey: ["productTypes"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-type-list`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data?.productType || [];
    },
  });

  const { data: productGroups } = useQuery({
    queryKey: ["productGroups"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-type-group-new`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data?.data || response.data?.product_type_group || [];
    },
  });

  const itemOptions = useMemo(() => {
    return (productGroups || [])
      .map((item) => {
        const name = item.item_name || item.product_type_group || item.product_type || "";
        return { value: name, label: name };
      })
      .filter((opt) => opt.value !== "");
  }, [productGroups]);

  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-create-product-type`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "New item created successfully" });
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["productGroups"] });
      setShowNewItemDialog(false);
      setNewItemName("");
      setNewItemGroup("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/web-update-product-type/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item renamed successfully" });
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["productGroups"] });
      setShowEditItemDialog(false);
      setEditItemName("");
      setEditingProductId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to rename item",
        variant: "destructive",
      });
    },
  });

  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate({
      product_type: newItemName.trim(),
      product_type_group: newItemGroup || "",
    });
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
    const product = productTypes?.find(
      (p) =>
        (p.product_type || p.item_name || "").toLowerCase() ===
        selectedItem.toLowerCase(),
    );
    if (!product) {
      toast({
        title: "Not Found",
        description: "Item not found in product master. Create it first.",
        variant: "destructive",
      });
      return;
    }
    setEditingProductId(product.id);
    setEditItemName(product.product_type || product.item_name);
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
    updateProductMutation.mutate({
      id: editingProductId,
      data: { product_type: editItemName.trim() },
    });
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

  // Normalization and running balance calculations
  const { normalizedTxs, openingBox, openingPc, closingBox, closingPc, lastTxDate } = useMemo(() => {
    const rawTxs = Array.isArray(stocksData) 
      ? stocksData 
      : (stocksData?.stocks || stocksData?.data || []);

    const opBox = stocksData?.opening?.opening_box ?? stocksData?.opening_box ?? stocksData?.open_box ?? 0;
    const opPc = stocksData?.opening?.opening_pc ?? stocksData?.opening?.opening_pcs ?? stocksData?.opening_pcs ?? stocksData?.open_pcs ?? 0;

    const clBox = stocksData?.closing?.closing_box ?? stocksData?.closing_box ?? stocksData?.close_box ?? 0;
    const clPc = stocksData?.closing?.closing_pc ?? stocksData?.closing?.closing_pcs ?? stocksData?.closing_pcs ?? stocksData?.close_pcs ?? 0;

    let runningBox = opBox;
    let runningPc = opPc;

    const normalized = rawTxs.map((t) => {
      const isOpening = t.reference?.toLowerCase().includes("opening balance") || t.ref_no?.toLowerCase().includes("opening balance");

      if (isOpening) {
        runningBox = Number(t.balance_box ?? t.box_balance ?? t.balance_pc_box ?? opBox);
        runningPc = Number(t.balance_pc ?? t.pc_balance ?? t.balance_pcs ?? opPc);
        return {
          date: t.date || t.purch_date || t.created_at || "",
          reference: "Opening Balance",
          isOpening: true,
          inward_box: null,
          inward_pc: null,
          in_return_box: null,
          in_return_pc: null,
          outward_box: null,
          outward_pc: null,
          out_return_box: null,
          out_return_pc: null,
          balance_box: runningBox,
          balance_pc: runningPc,
        };
      }

      const inward_box = t.inward_box !== undefined ? Number(t.inward_box) : (t.inward?.box !== undefined ? Number(t.inward.box) : null);
      const inward_pc = t.inward_pc !== undefined ? Number(t.inward_pc) : (t.inward_pcs !== undefined ? Number(t.inward_pcs) : (t.inward?.pc !== undefined ? Number(t.inward.pc) : null));

      const in_return_box = t.in_return_box !== undefined ? Number(t.in_return_box) : (t.in_return?.box !== undefined ? Number(t.in_return.box) : null);
      const in_return_pc = t.in_return_pc !== undefined ? Number(t.in_return_pc) : (t.in_return_pcs !== undefined ? Number(t.in_return_pcs) : (t.in_return?.pc !== undefined ? Number(t.in_return.pc) : null));

      const outward_box = t.outward_box !== undefined ? Number(t.outward_box) : (t.outward?.box !== undefined ? Number(t.outward.box) : null);
      const outward_pc = t.outward_pc !== undefined ? Number(t.outward_pc) : (t.outward_pcs !== undefined ? Number(t.outward_pcs) : (t.outward?.pc !== undefined ? Number(t.outward.pc) : null));

      const out_return_box = t.out_return_box !== undefined ? Number(t.out_return_box) : (t.out_return?.box !== undefined ? Number(t.out_return.box) : null);
      const out_return_pc = t.out_return_pc !== undefined ? Number(t.out_return_pc) : (t.out_return_pcs !== undefined ? Number(t.out_return_pcs) : (t.out_return?.pc !== undefined ? Number(t.out_return.pc) : null));

      let balance_box = t.balance_box !== undefined ? Number(t.balance_box) : (t.box_balance !== undefined ? Number(t.box_balance) : null);
      let balance_pc = t.balance_pc !== undefined ? Number(t.balance_pc) : (t.pc_balance !== undefined ? Number(t.pc_balance) : (t.balance_pcs !== undefined ? Number(t.balance_pcs) : null));

      if (balance_box === null || balance_pc === null) {
        const pcsPerBox = stocksData?.pcs_per_box ?? stocksData?.pcs_val ?? 2;
        const netBox = (inward_box || 0) + (in_return_box || 0) - (outward_box || 0) - (out_return_box || 0);
        const netPc = (inward_pc || 0) + (in_return_pc || 0) - (outward_pc || 0) - (out_return_pc || 0);

        runningBox += netBox;
        runningPc += netPc;

        if (runningPc < 0) {
          const borrowBoxes = Math.ceil(Math.abs(runningPc) / pcsPerBox);
          runningBox -= borrowBoxes;
          runningPc += borrowBoxes * pcsPerBox;
        } else if (runningPc >= pcsPerBox) {
          const carryBoxes = Math.floor(runningPc / pcsPerBox);
          runningBox += carryBoxes;
          runningPc -= carryBoxes * pcsPerBox;
        }

        balance_box = runningBox;
        balance_pc = runningPc;
      } else {
        runningBox = balance_box;
        runningPc = balance_pc;
      }

      return {
        date: t.date || t.purch_date || t.sales_date || t.created_at || "",
        reference: t.reference || t.ref_no || t.invoice_no || t.challan_no || t.purchase_no || "",
        inward_box,
        inward_pc,
        in_return_box,
        in_return_pc,
        outward_box,
        outward_pc,
        out_return_box,
        out_return_pc,
        balance_box,
        balance_pc,
      };
    });

    const hasOpening = normalized.some((t) => t.isOpening);
    let finalTxs = [...normalized];

    if (!hasOpening && searchParams) {
      finalTxs.unshift({
        date: searchParams.from_date ? moment(searchParams.from_date).format("YYYY-MM-DD") : "",
        reference: "Opening Balance",
        isOpening: true,
        inward_box: null,
        inward_pc: null,
        in_return_box: null,
        in_return_pc: null,
        outward_box: null,
        outward_pc: null,
        out_return_box: null,
        out_return_pc: null,
        balance_box: opBox,
        balance_pc: opPc,
      });
    }

    const lastDate = finalTxs.length > 0 ? finalTxs[finalTxs.length - 1].date : searchParams?.to_date || "";

    return {
      normalizedTxs: finalTxs,
      openingBox: opBox,
      openingPc: opPc,
      closingBox: clBox,
      closingPc: clPc,
      lastTxDate: lastDate,
    };
  }, [stocksData, searchParams]);

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
        "Inward Box",
        "Inward Pc",
        "In Return Box",
        "In Return Pc",
        "Outward Box",
        "Outward Pc",
        "Out Return Box",
        "Out Return Pc",
        "Balance Box",
        "Balance Pc",
      ];

      const rows = normalizedTxs.map((t) => [
        t.date ? moment(t.date).format("DD MMM YYYY") : "",
        `"${t.reference}"`,
        t.inward_box ?? "",
        t.inward_pc ?? "",
        t.in_return_box ?? "",
        t.in_return_pc ?? "",
        t.outward_box ?? "",
        t.outward_pc ?? "",
        t.out_return_box ?? "",
        t.out_return_pc ?? "",
        t.balance_box ?? "",
        t.balance_pc ?? "",
      ]);

      rows.push([
        lastTxDate ? moment(lastTxDate).format("DD MMM YYYY") : "",
        "\"FINAL CLOSING BALANCE\"",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        closingBox,
        closingPc,
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
        `single_item_stock_${selectedItem}_${searchParams?.from_date}_to_${searchParams?.to_date}.csv`,
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
            pdf.internal.pageSize.getHeight() - 10,
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

  return (
    <Page>
      <div className="w-full p-2 md:p-4 space-y-4">
        {/* Title and Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Single Item Stock</h1>
            <p className="text-xs text-gray-500">View detailed stock transaction history by item</p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Button
              onClick={() => setShowNewItemDialog(true)}
              className="flex-1 sm:flex-none h-9 bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Item
            </Button>
            {selectedItem && (
              <Button
                onClick={handleEditItem}
                variant="outline"
                className="flex-1 sm:flex-none h-9 text-xs flex items-center gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename Item
              </Button>
            )}
          </div>
        </div>

        {/* Filter Card */}
        <Card className="shadow-xs border-gray-200">
          <CardContent className="p-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Select Item */}
                <div className="space-y-1.5 md:col-span-1">
                  <Label htmlFor="itemSelect" className="text-xs font-semibold text-gray-700">
                    Select Item
                  </Label>
                  <MemoizedSelect
                    value={selectedItem}
                    onChange={setSelectedItem}
                    options={itemOptions}
                    placeholder="Search / Select Item"
                  />
                </div>

                {/* From Date Picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-left font-normal h-9 text-xs border-gray-300",
                          !form.watch("from_date") && "text-muted-foreground"
                        )}
                      >
                        {form.watch("from_date") ? (
                          moment(form.watch("from_date")).format("DD MMM YYYY")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarDays className="h-4 w-4 opacity-75 text-gray-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.watch("from_date") ? new Date(form.watch("from_date")) : undefined}
                        onSelect={(date) =>
                          form.setValue("from_date", date ? moment(date).format("YYYY-MM-DD") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date Picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-left font-normal h-9 text-xs border-gray-300",
                          !form.watch("to_date") && "text-muted-foreground"
                        )}
                      >
                        {form.watch("to_date") ? (
                          moment(form.watch("to_date")).format("DD MMM YYYY")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarDays className="h-4 w-4 opacity-75 text-gray-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.watch("to_date") ? new Date(form.watch("to_date")) : undefined}
                        onSelect={(date) =>
                          form.setValue("to_date", date ? moment(date).format("YYYY-MM-DD") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Generate Button */}
                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-9 text-xs font-semibold ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5 mr-1.5" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Container */}
        {searchParams && (
          <Card className="shadow-xs border-gray-200">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  {selectedItem}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Report from {moment(searchParams.from_date).format("DD MMM YYYY")} to{" "}
                  {moment(searchParams.to_date).format("DD MMM YYYY")}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 self-stretch sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCsv}
                  className="h-8 text-xs flex-1 sm:flex-none border-gray-300"
                >
                  <FaRegFileExcel className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="h-8 text-xs flex-1 sm:flex-none border-gray-300"
                >
                  <FaRegFilePdf className="mr-1.5 h-3.5 w-3.5 text-red-600" />
                  PDF
                </Button>
                <ReactToPrint
                  trigger={() => (
                    <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none border-gray-300">
                      <Printer className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
                      Print
                    </Button>
                  )}
                  content={() => tableRef.current}
                  documentTitle={`Single-Item-Stock-${selectedItem}`}
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Title and Balance indicators */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
                    <div className="flex gap-2 self-stretch sm:self-auto">
                      <div className="flex-1 sm:flex-none bg-gray-100 border border-gray-200 text-gray-800 px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between sm:justify-start gap-1">
                        <span className="text-gray-500">OPENING:</span>
                        <span className="font-bold">{openingBox} Box {openingPc} Pc</span>
                      </div>
                      <div className="flex-1 sm:flex-none bg-blue-50 border border-blue-100 text-blue-800 px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between sm:justify-start gap-1">
                        <span className="text-blue-500">CLOSING:</span>
                        <span className="font-bold">{closingBox} Box {closingPc} Pc</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History Table */}
                  <div ref={tableRef} className="overflow-x-auto border rounded-lg border-gray-200">
                    <div className="hidden print:block text-center p-4">
                      <h2 className="text-xl font-bold">{selectedItem}</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock Transaction History (From {moment(searchParams.from_date).format("DD MMM YYYY")} to {moment(searchParams.to_date).format("DD MMM YYYY")})
                      </p>
                      <div className="flex justify-center gap-4 mt-2 text-xs">
                        <div>OPENING: <b>{openingBox} Box {openingPc} Pc</b></div>
                        <div>CLOSING: <b>{closingBox} Box {closingPc} Pc</b></div>
                      </div>
                    </div>

                    <Table className="border-collapse w-full text-[11px]">
                      <TableHeader className="bg-gray-100 text-gray-900 sticky top-0">
                        <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                          <TableHead rowSpan={2} className="text-center text-gray-800 font-bold border-r border-gray-200 align-middle w-24">
                            DATE
                          </TableHead>
                          <TableHead rowSpan={2} className="text-left text-gray-800 font-bold border-r border-gray-200 align-middle pl-3 min-w-40">
                            REFERENCE
                          </TableHead>
                          <TableHead colSpan={2} className="text-center text-green-800 font-bold border-r border-gray-200 bg-green-50/50 py-1.5">
                            INWARD
                          </TableHead>
                          <TableHead colSpan={2} className="text-center text-teal-800 font-bold border-r border-gray-200 bg-teal-50/50 py-1.5">
                            IN RETURN
                          </TableHead>
                          <TableHead colSpan={2} className="text-center text-red-800 font-bold border-r border-gray-200 bg-red-50/50 py-1.5">
                            OUTWARD
                          </TableHead>
                          <TableHead colSpan={2} className="text-center text-orange-800 font-bold border-r border-gray-200 bg-orange-50/50 py-1.5">
                            OUT RETURN
                          </TableHead>
                          <TableHead colSpan={2} className="text-center text-blue-800 font-bold bg-blue-50/50 py-1.5">
                            BALANCE
                          </TableHead>
                        </TableRow>
                        <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">BOX</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">PC</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">BOX</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">PC</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">BOX</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">PC</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">BOX</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 py-1 w-12 text-gray-700">PC</TableHead>
                          <TableHead className="text-center font-bold border-r border-gray-200 bg-blue-50/20 py-1 w-14 text-gray-700">BOX</TableHead>
                          <TableHead className="text-center font-bold bg-blue-50/20 py-1 w-14 text-gray-700">PC</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {normalizedTxs.length ? (
                          normalizedTxs.map((t, index) => (
                            <TableRow
                              key={index}
                              className={cn(
                                "border-b border-gray-200 hover:bg-gray-50/50",
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                              )}
                            >
                              <TableCell className="text-center border-r border-gray-200 font-medium py-2">
                                {t.date ? moment(t.date).format("DD MMM YYYY") : ""}
                              </TableCell>
                              <TableCell className="text-left pl-3 border-r border-gray-200 font-medium text-gray-800 py-2">
                                {t.reference}
                              </TableCell>

                              {/* INWARD */}
                              <TableCell className="text-center border-r border-gray-200 text-green-700 font-semibold py-2">
                                {formatStockValue(t.inward_box)}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200 text-green-700 font-semibold py-2">
                                {formatStockValue(t.inward_pc)}
                              </TableCell>

                              {/* IN RETURN */}
                              <TableCell className="text-center border-r border-gray-200 text-teal-700 font-semibold py-2">
                                {formatStockValue(t.in_return_box)}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200 text-teal-700 font-semibold py-2">
                                {formatStockValue(t.in_return_pc)}
                              </TableCell>

                              {/* OUTWARD */}
                              <TableCell className="text-center border-r border-gray-200 text-red-700 font-semibold py-2">
                                {formatStockValue(t.outward_box)}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200 text-red-700 font-semibold py-2">
                                {formatStockValue(t.outward_pc)}
                              </TableCell>

                              {/* OUT RETURN */}
                              <TableCell className="text-center border-r border-gray-200 text-orange-700 font-semibold py-2">
                                {formatStockValue(t.out_return_box)}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200 text-orange-700 font-semibold py-2">
                                {formatStockValue(t.out_return_pc)}
                              </TableCell>

                              {/* BALANCE */}
                              <TableCell className="text-center border-r border-gray-200 bg-blue-50/20 text-gray-800 font-bold py-2">
                                {t.balance_box ?? "-"}
                              </TableCell>
                              <TableCell className="text-center bg-blue-50/20 text-gray-800 font-bold py-2">
                                {t.balance_pc ?? "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <td
                              colSpan={12}
                              className="text-center py-12 text-gray-500 font-medium"
                            >
                              No transaction history found for the selected criteria
                            </td>
                          </TableRow>
                        )}

                        {/* Final Closing Balance Row */}
                        {normalizedTxs.length > 0 && (
                          <TableRow className="bg-slate-900 text-white hover:bg-slate-900 font-bold text-xs">
                            <TableCell className="text-center py-2.5">
                              {lastTxDate ? moment(lastTxDate).format("DD MMM YYYY") : ""}
                            </TableCell>
                            <TableCell className="text-left pl-3 py-2.5">
                              FINAL CLOSING BALANCE
                            </TableCell>
                            <TableCell colSpan={8} className="py-2.5"></TableCell>
                            <TableCell className="text-center border-r border-slate-800 py-2.5">
                              {closingBox}
                            </TableCell>
                            <TableCell className="text-center py-2.5">
                              {closingPc}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new product type to the inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2">
              <Label>Category / Group</Label>
              <Input
                value={newItemGroup}
                onChange={(e) => setNewItemGroup(e.target.value)}
                placeholder="Enter category (e.g. Granites, Tiles)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewItemDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateItem}
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Item</DialogTitle>
            <DialogDescription>Update the product name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                placeholder="Enter new item name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditItemDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateItem}
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default SingleItemStockReport;
