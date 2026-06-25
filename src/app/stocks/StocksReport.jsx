import React, { useRef, useState } from "react";
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
import { getFirstDayOfMonth } from "@/utils/getFirstDayOfMonth";

const formSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});

const StocksReport = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  // Unit selection state
  const [selectedUnits, setSelectedUnits] = useState({
    box: true, // Box/Piece
    sqft: true, // Sqft
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const hello = getTodayDate();
  console.log("stock date ", hello);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_date: "2026-04-01",
      to_date: getTodayDate(),
    },
  });
  const handleUnitToggle = (unit) => {
    setSelectedUnits((prev) => {
      // If this unit is currently true and both are true, toggling off would make both false
      // So we only toggle off if the other unit is true
      if (prev[unit] && !prev[unit === "box" ? "sqft" : "box"]) {
        // This is the only selected one, don't allow unchecking
        return prev;
      }
      return { ...prev, [unit]: !prev[unit] };
    });
  };
  const { data: stocksData, isLoading } = useQuery({
    queryKey: ["stocksReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return { stocks: [] };

      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-fetch-stock-new-report`,
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
      queryClient.invalidateQueries({ queryKey: ["stocksReport"] });
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
      queryClient.invalidateQueries({ queryKey: ["stocksReport"] });
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

  const handleEditItem = (itemName) => {
    const product = productTypes?.find(
      (p) =>
        (p.product_type || p.item_name || "").toLowerCase() ===
        itemName.toLowerCase(),
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

      // Build CSV headers
      const headers = [
        "Item Name",
        "Open Balance",
        "Purchase",
        "Sale",
        "Close Balance"
      ];

      // Build CSV rows
      const rows = stocksData.stocks.map(item => {
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

        return [
          `"${item.item_name}"`,
          openBal,
          purchaseVal,
          saleVal,
          closeBal
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `stocks_report_${searchParams?.from_date}_to_${searchParams?.to_date}.csv`);
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
            pdf.internal.pageSize.getHeight() - 10,
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
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              {/* Title + Print Button */}
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-gray-800 px-2">
                  Stocks
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handleDownloadCsv}
                  >
                    <FaRegFileExcel className="h-4 w-4" />
                  </button>
                  <button
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                    onClick={handleDownloadPDF}
                  >
                    <FaRegFilePdf className="h-4 w-4" />
                  </button>

                  <ReactToPrint
                    trigger={() => (
                      <button
                        className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                      >
                        <Printer className=" h-4 w-4" />
                      </button>
                    )}
                    content={() => tableRef.current}
                    documentTitle="Stock-Report"
                  />
                  <button
                    onClick={() => setShowNewItemDialog(true)}
                    className="sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm p-3 rounded-b-md flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

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
                      onChange={(e) =>
                        form.setValue("from_date", e.target.value)
                      }
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
            <div className="p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="text-center font-semibold text-sm mb-2">
                    Stocks Report
                  </div>
                  <div className="text-center text-xs mb-3">
                    From {moment(searchParams.from_date).format("DD-MMM-YYYY")}{" "}
                    to {moment(searchParams.to_date).format("DD-MMM-YYYY")}
                  </div>

                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-1 text-left">Item Name</th>
                        <th className="border p-1 text-right">Open</th>
                        <th className="border p-1 text-right">Purchase</th>
                        <th className="border p-1 text-right">Sale</th>
                        <th className="border p-1 text-right">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocksData?.stocks?.length ? (
                        stocksData.stocks.map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="border p-1 text-left">
                              <span className="flex items-center gap-1">
                                {item.item_name}
                                <button
                                  onClick={() => handleEditItem(item.item_name)}
                                  className="text-gray-400 hover:text-blue-600"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </span>
                            </td>
                            <td className="border p-1 text-right">
                              {item.openpurch - item.closesale}
                            </td>
                            <td className="border p-1 text-right">
                              {item.purch}
                            </td>
                            <td className="border p-1 text-right">
                              {item.sale}
                            </td>
                            <td className="border p-1 text-right">
                              {item.openpurch -
                                item.closesale +
                                (item.purch - item.sale)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="border p-2 text-center text-gray-500"
                          >
                            No stock data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:block">
          <Card className="shadow-sm">
            <div
              className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Title Section */}
                <div className="w-[30%] shrink-0">
                  <h1 className="text-xl font-bold text-gray-800 truncate">
                    Stocks Report
                  </h1>
                </div>

                {/* Form Section */}
                <div className="bg-white w-full lg:w-[70%] p-3 rounded-md shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full"
                    >
                      {/* From Date */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="from_date"
                          className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
                        >
                          From Date
                        </Label>
                        <Input
                          id="from_date"
                          type="date"
                          {...form.register("from_date")}
                          className="h-8 text-xs"
                        />
                        {form.formState.errors.from_date && (
                          <p className="text-xs text-red-500">
                            {form.formState.errors.from_date.message}
                          </p>
                        )}
                      </div>

                      {/* To Date */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="to_date"
                          className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
                        >
                          To Date
                        </Label>
                        <Input
                          id="to_date"
                          type="date"
                          {...form.register("to_date")}
                          className="h-8 text-xs"
                        />
                        {form.formState.errors.to_date && (
                          <p className="text-xs text-red-500">
                            {form.formState.errors.to_date.message}
                          </p>
                        )}
                      </div>

                      {/* Generate Button */}
                      <div className="md:col-span-3 flex justify-end">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className={`h-8 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Search className="h-3 w-3 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {searchParams && (
              <>
                <CardHeader className="border-t">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
                    <CardTitle className="text-lg flex flex-row items-center gap-2">
                      {/* <span>Stock Report Results</span>
                    <span className="text-blue-800 text-xs">
                      {moment(searchParams.from_date).format("DD-MMM-YYYY")} to {moment(searchParams.to_date).format("DD-MMM-YYYY")}
                    </span> */}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewItemDialog(true)}
                        className="bg-green-50 hover:bg-green-100 border-green-300"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        New Item
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadCsv}
                      >
                        <FaRegFileExcel className="mr-2 h-4 w-4" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPDF}
                      >
                        <FaRegFilePdf className="mr-2 h-4 w-4" />
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
                    <div className="relative text-center mb-6">
                      <div className="font-semibold text-lg">Stocks Report</div>
                      <div className="text-sm text-gray-500 mt-1">
                        From{" "}
                        {moment(searchParams.from_date).format("DD-MMM-YYYY")}{" "}
                        to {moment(searchParams.to_date).format("DD-MMM-YYYY")}
                      </div>
                      <div
                        data-html2canvas-ignore="true"
                        className="absolute right-0 top-1/2 -translate-y-1/2 print:hidden flex items-center gap-4"
                      >
                        <Label className="text-xs font-medium">
                          Show Units:
                        </Label>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedUnits.box}
                              onChange={() => handleUnitToggle("box")}
                            />
                            Box/Piece
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedUnits.sqft}
                              onChange={() => handleUnitToggle("sqft")}
                            />
                            Sqft
                          </label>
                        </div>
                      </div>
                    </div>
                    <Table className="border table-fixed w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-100">
                          <TableHead className="text-center text-black font-bold border-r w-[36%]">
                            Items Name
                          </TableHead>
                          <TableHead className="text-center text-black font-bold border-r w-[16%]">
                            Open Balance
                          </TableHead>
                          <TableHead className="text-center text-black font-bold border-r w-[16%]">
                            Purchase
                          </TableHead>
                          <TableHead className="text-center text-black font-bold border-r w-[16%]">
                            Sale
                          </TableHead>
                          <TableHead className="text-center text-black font-bold w-[16%]">
                            Close Balance
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stocksData?.stocks?.length ? (
                          stocksData.stocks.map((item, index) => (
                            <TableRow
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                              }
                            >
                              <TableCell className="text-left border-r">
                                <span className="flex items-center gap-1">
                                  {item.item_name}
                                  <button
                                    onClick={() =>
                                      handleEditItem(item.item_name)
                                    }
                                    data-html2canvas-ignore="true"
                                    className="text-gray-400 hover:text-blue-600 print:hidden"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </span>
                              </TableCell>
                              <TableCell className="text-center border-r">
                                {selectedUnits.box &&
                                  `${formatStockValue(item.openpurch_pcs - item.closesale_pcs)} Pcs`}
                                {selectedUnits.box &&
                                  selectedUnits.sqft &&
                                  " , "}
                                {selectedUnits.sqft &&
                                  `${formatStockValue(item.openpurch_sqr - item.closesale_sqr)} Sqft`}
                              </TableCell>
                              <TableCell className="text-center border-r">
                                {selectedUnits.box &&
                                  `${formatStockValue(item.purch_pcs)} Pcs`}
                                {selectedUnits.box &&
                                  selectedUnits.sqft &&
                                  " , "}
                                {selectedUnits.sqft &&
                                  `${formatStockValue(item.purch_sqr)} Sqft`}
                              </TableCell>
                              <TableCell className="text-center border-r">
                                {selectedUnits.box &&
                                  `${formatStockValue(item.sale_pcs)} Pcs`}
                                {selectedUnits.box &&
                                  selectedUnits.sqft &&
                                  " , "}
                                {selectedUnits.sqft &&
                                  `${formatStockValue(item.sale_sqr)} Sqft`}
                              </TableCell>
                              <TableCell className="text-center">
                                {selectedUnits.box &&
                                  `${formatStockValue(item.openpurch_pcs - item.closesale_pcs + (item.purch_pcs - item.sale_pcs))} Pcs`}
                                {selectedUnits.box &&
                                  selectedUnits.sqft &&
                                  " , "}
                                {selectedUnits.sqft &&
                                  `${formatStockValue(item.openpurch_sqr - item.closesale_sqr + (item.purch_sqr - item.sale_sqr))} Sqft`}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-12 text-gray-500"
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Loading stock data...
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="text-lg">📋</div>
                                  <div>
                                    No stock data found for the selected
                                    criteria
                                  </div>
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

                    <Table className="border"></Table>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
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
            <div className="space-y-2 ">
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

export default StocksReport;
