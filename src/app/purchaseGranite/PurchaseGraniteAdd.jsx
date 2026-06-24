import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import NotInListIcon from "@/components/common/NotInListIcon";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  Select as SelectShadcn,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import useNumericInput from "@/hooks/useNumericInput";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const formSchema = z.object({
  purchase_date: z.string(),
  purchase_year: z.string(),
  purchase_type: z.string(),
  purchase_item_type: z.string(),
  purchase_supplier: z.string().min(1, "Supplier is required"),
  purchase_bill_no: z.string().min(1, "Bill number is required"),
  purchase_amount: z.string().min(1, "Total Amount is required"),
  purchase_other: z.string().optional(),
  purchase_other1: z.string().optional(),
  purchase_other_label: z.string().optional(),
  purchase_other1_label: z.string().optional(),
  purchase_amount_round: z.string().optional(),
  purchase_tempo: z.string().optional(),
  purchase_loading: z.string().optional(),
  purchase_unloading: z.string().optional(),
  purchase_tax: z.string().optional(),
  purchase_gross: z.string().optional(),
  purchase_advance: z.string().optional(),
  purchase_balance: z.string().optional(),
  purchase_amount_received: z.string().optional(),
  purchase_temp_amount: z.string().optional(),
  purchase_estimate_ref: z.string(),
  purchase_no_of_count: z.string(),
});

const PurchaseGraniteAdd = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingType, setLoadingType] = useState("");
  const [gstEdited, setGstEdited] = useState(false);
  const [autoGst18, setAutoGst18] = useState(0);
  const [roundOffEdited, setRoundOffEdited] = useState(false);
  const isUpdatingFromRoundOff = useRef(false);

  const { data: currentYear } = useQuery({
    queryKey: ["currentYear"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(`${BASE_URL}/api/web-fetch-year`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.year?.current_year;
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchase_date: moment().format("YYYY-MM-DD"),
      purchase_year: currentYear,
      purchase_type: "",
      purchase_item_type: "",
      purchase_supplier: "",
      purchase_bill_no: "",
      purchase_amount: "",
      purchase_other: "",
      purchase_other1: "",
      purchase_other_label: "",
      purchase_other1_label: "",
      purchase_amount_round: "0",
      purchase_tempo: "",
      purchase_loading: "",
      purchase_unloading: "",
      purchase_tax: "",
      purchase_gross: "",
      purchase_advance: "0",
      purchase_balance: "",
      purchase_amount_received: "",
      purchase_temp_amount: "",
      purchase_estimate_ref: "",
      purchase_no_of_count: "1",
    },
  });

  const [itemEntries, setItemEntries] = useState([
    {
      purchase_sub_item: "",
      purchase_sub_qnty: "",
      purchase_sub_qnty_sqr: "",
      purchase_sub_rate: "",
      purchase_sub_amount: "",
    },
  ]);
  const [customItems, setCustomItems] = useState({});
  const [isCustomItem, setIsCustomItem] = useState({});

  const handleCustomItemChange = (index, value) => {
    setCustomItems((prev) => ({ ...prev, [index]: value }));
  };
  // const handleToggleCustomItem = (index) => {
  //   setIsCustomItem((prev) => ({ ...prev, [index]: !prev[index] }));
  // };
  const handleToggleCustomItem = (index) => {
    const isCurrentlyCustom = isCustomItem[index];

    if (isCurrentlyCustom) {
      // We are switching from custom mode back to the select dropdown
      const customName = customItems[index]?.trim();
      if (customName) {
        // Copy the custom name into the entry so it's not lost
        const updatedEntries = [...itemEntries];
        updatedEntries[index].purchase_sub_item = customName;
        setItemEntries(updatedEntries);
        // Optionally clear the custom input so it's not reused
        setCustomItems((prev) => ({ ...prev, [index]: "" }));
      }
    }

    // Toggle the flag
    setIsCustomItem((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const { data: productTypeGroup = [] } = useQuery({
    queryKey: ["productTypeGroup"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-type-group`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.product_type_group || [];
    },
  });

  const { data: product = [], refetch: refetchProducts } = useQuery({
    queryKey: ["product"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-type-group-new`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return (
        response.data.data ||
        response.data.product_type ||
        response.data.product_type_group ||
        response.data.product_type_group_new ||
        []
      );
    },
  });

  const productOptions = useMemo(
    () => [
      ...product.map((item) => {
        const name =
          item.item_name || item.product_type_group || item.product_type;
        return { value: name, label: name };
      }),
    ],
    [product],
  );

  const calculateAndSetTotals = (entries, skipGst = false) => {
    const itemsTotal = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
      0,
    );
    const tempo = parseFloat(form.getValues("purchase_tempo") || 0);
    const loading = parseFloat(form.getValues("purchase_loading") || 0);
    const unloading = parseFloat(form.getValues("purchase_unloading") || 0);
    const other = parseFloat(form.getValues("purchase_other") || 0);
    const other1 = parseFloat(form.getValues("purchase_other1") || 0);

    const grandTotal =
      itemsTotal + tempo + loading + unloading + other + other1;

    setAutoGst18(grandTotal * 0.18);

    if (!skipGst && !gstEdited) {
      const gstAmount = grandTotal * 0.18;
      form.setValue("purchase_tax", gstAmount.toFixed(2));
    }
    const currentGst = parseFloat(form.getValues("purchase_tax") || 0);
    const netTotal = grandTotal + currentGst;

    // Net total (purchase_temp_amount) is always the sum, never modified by round-off
    form.setValue("purchase_temp_amount", netTotal.toFixed(2));

    // Compute final payable amount = netTotal - roundOff
    const roundOff = parseFloat(form.getValues("purchase_amount_round") || 0);
    const finalAmount = netTotal - roundOff;

    form.setValue("purchase_gross", finalAmount.toString());
    form.setValue("purchase_balance", finalAmount.toString());
    form.setValue("purchase_advance", "0");
  };

  // Remove the previous useEffect that auto‑adjusted roundOff when netTotal changed
  // The effect that was here has been deleted.

  const itemsTotal = itemEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
    0,
  );
  const watchTempo = parseFloat(form.watch("purchase_tempo") || 0);
  const watchLoading = parseFloat(form.watch("purchase_loading") || 0);
  const watchUnloading = parseFloat(form.watch("purchase_unloading") || 0);
  const watchOther = parseFloat(form.watch("purchase_other") || 0);
  const watchOther1 = parseFloat(form.watch("purchase_other1") || 0);

  const displayGrandTotal =
    itemsTotal +
    watchTempo +
    watchLoading +
    watchUnloading +
    watchOther +
    watchOther1;
  const displayGst = parseFloat(form.watch("purchase_tax") || 0);
  const displayNetTotal = displayGrandTotal + displayGst;

  const roundOff = parseFloat(form.watch("purchase_amount_round") || 0);
  const amountToBePaid = displayNetTotal - roundOff;

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "purchase_sub_qnty_sqr" || field === "purchase_sub_rate") &&
      updatedEntries[index].purchase_sub_qnty_sqr &&
      updatedEntries[index].purchase_sub_rate
    ) {
      updatedEntries[index].purchase_sub_amount = Math.round(
        parseFloat(updatedEntries[index].purchase_sub_qnty_sqr || 0) *
          parseFloat(updatedEntries[index].purchase_sub_rate || 0),
      ).toString();
      setItemEntries([...updatedEntries]);
    }

    calculateAndSetTotals(updatedEntries);
  };

  const handleChargeChange = (field, value) => {
    form.setValue(field, value);
    calculateAndSetTotals(itemEntries);
  };

  const handleTaxChange = (e) => {
    const value = e.target.value;
    form.setValue("purchase_tax", value);
    setGstEdited(true);
    calculateAndSetTotals(itemEntries, true);
  };

  // Round‑off handler: only updates the round‑off value and recomputes final amount
  const handleRoundOffChange = (e) => {
    const value = e.target.value;
    const roundOffVal = parseFloat(value) || 0;
    form.setValue("purchase_amount_round", roundOffVal);
    setRoundOffEdited(true);

    // Recompute final amounts without changing net total
    const netTotal = parseFloat(form.getValues("purchase_temp_amount") || 0);
    const finalAmount = netTotal - roundOffVal;
    form.setValue("purchase_gross", finalAmount.toString());
    form.setValue("purchase_balance", finalAmount.toString());
  };

  const addItemEntry = () => {
    const updated = [
      ...itemEntries,
      {
        purchase_sub_item: "",
        purchase_sub_qnty: "",
        purchase_sub_qnty_sqr: "",
        purchase_sub_rate: "",
        purchase_sub_amount: "",
      },
    ];
    setItemEntries(updated);
    form.setValue("purchase_no_of_count", updated.length.toString());
    calculateAndSetTotals(updated);
  };

  const removeItemEntry = (index) => {
    const updatedEntries = [...itemEntries];
    updatedEntries.splice(index, 1);
    setItemEntries(updatedEntries);

    setCustomItems((prev) => {
      const newCustom = { ...prev };
      for (let i = index; i < updatedEntries.length; i++) {
        newCustom[i] = newCustom[i + 1];
      }
      delete newCustom[updatedEntries.length];
      return newCustom;
    });

    setIsCustomItem((prev) => {
      const newCustomFlag = { ...prev };
      for (let i = index; i < updatedEntries.length; i++) {
        newCustomFlag[i] = newCustomFlag[i + 1];
      }
      delete newCustomFlag[updatedEntries.length];
      return newCustomFlag;
    });

    form.setValue("purchase_no_of_count", updatedEntries.length.toString());
    calculateAndSetTotals(updatedEntries);
  };

  const createPurchaseMutation = useMutation({
    mutationFn: async (payload) => {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-create-purchase`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg,
      });
      navigate("/purchase");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create Aaya",
        variant: "destructive",
      });
    },
  });

  const validateForm = (data) => {
    const formErrors = {
      date: !data.purchase_date ? "Date is required" : "",
      supplier: !data.purchase_supplier ? "Supplier is required" : "",
      billNo: !data.purchase_bill_no ? "Bill number is required" : "",
    };

    const itemErrors = itemEntries.map((entry, index) => ({
      item:
        !entry.purchase_sub_item || (isCustomItem[index] && !customItems[index])
          ? "required"
          : "",
      qntySqr: !entry.purchase_sub_qnty_sqr
        ? "required"
        : isNaN(entry.purchase_sub_qnty_sqr)
          ? "Quantity (sqft) must be a number"
          : "",
      rate: !entry.purchase_sub_rate
        ? "required"
        : isNaN(entry.purchase_sub_rate)
          ? "Rate must be a number"
          : "",
    }));

    const hasFormErrors = Object.values(formErrors).some((err) => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.item || err.qntySqr || err.rate,
    );

    return { formErrors, itemErrors, hasFormErrors, hasItemErrors };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = form.getValues();
    const { formErrors, itemErrors, hasFormErrors, hasItemErrors } =
      validateForm(formData);

    if (hasFormErrors || hasItemErrors) {
      toast({
        title: "Validation Errors",
        description: (
          <div className="w-full space-y-3 text-xs max-h-[60vh] overflow-y-auto">
            {hasFormErrors && (
              <div className="w-full">
                <div className="font-medium mb-2 text-white">Form Errors</div>
                <div className="w-full">
                  <table className="w-full border-collapse border border-red-200 rounded-md">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="px-2 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Field
                        </th>
                        <th className="px-2 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formErrors.date && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Date
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.date}
                          </td>
                        </tr>
                      )}
                      {formErrors.supplier && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Supplier
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.supplier}
                          </td>
                        </tr>
                      )}
                      {formErrors.billNo && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            JFC Bill No
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.billNo}
                          </td>
                        </tr>
                      )}
                      {formErrors.itemType && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Item Type
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.itemType}
                          </td>
                        </tr>
                      )}
                      {formErrors.otherAmount && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Other Amount
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.otherAmount}
                          </td>
                        </tr>
                      )}
                      {formErrors.totalAmount && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Total Amount
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.totalAmount}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {hasItemErrors && (
              <div className="w-full">
                <div className="font-medium mb-2 text-white">Item Errors</div>
                <div className="w-full">
                  <table className="w-full border-collapse border border-red-200 rounded-md">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200 w-8">
                          #
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Item
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Qty (pcs/box)
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Qty (sqft)
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemErrors.map(
                        (error, i) =>
                          (error.item ||
                            error.qnty ||
                            error.qntySqr ||
                            error.rate) && (
                            <tr key={i} className="bg-white hover:bg-gray-50">
                              <td className="px-1.5 py-1.5 text-center text-gray-600 border-b border-gray-200 font-medium">
                                {i + 1}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200 break-all">
                                {error.item}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 font-mono text-right border-b border-gray-200 break-all">
                                {error.qnty}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 font-mono text-right border-b border-gray-200 break-all">
                                {error.qntySqr}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 font-mono text-right border-b border-gray-200 break-all">
                                {error.rate}
                              </td>
                            </tr>
                          ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
      setIsSubmitting(false);
      return;
    }

    await onSubmit(formData);
  };

  const onSubmit = async (data) => {
    try {
      const formattedItemEntries = itemEntries.map((entry, index) => {
        return {
          ...entry,
          purchase_sub_pcs: entry.purchase_sub_qnty,
          purchase_sub_item: isCustomItem[index]
            ? customItems[index]
            : entry.purchase_sub_item,
        };
      });

      const { purchase_amount_round, ...restData } = data;
      const tempo = parseFloat(form.watch("purchase_tempo") || 0);
      const loading = parseFloat(form.watch("purchase_loading") || 0);
      const unloading = parseFloat(form.watch("purchase_unloading") || 0);
      const other = parseFloat(form.watch("purchase_other") || 0);
      const other1 = parseFloat(form.watch("purchase_other1") || 0);

      const itemsTotal = itemEntries.reduce(
        (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
        0,
      );
      const grandTotal =
        itemsTotal + tempo + loading + unloading + other + other1;
      const gstAmount = parseFloat(form.watch("purchase_tax") || 0);
      const netTotal = grandTotal + gstAmount;
      const roundOff = parseFloat(form.watch("purchase_amount_round") || 0);
      const finalAmount = netTotal - roundOff;

      const payload = {
        ...restData,
        purchase_tempo: tempo.toString(),
        purchase_loading: loading.toString(),
        purchase_unloading: unloading.toString(),
        purchase_other: other.toString(),
        purchase_other1: other1.toString(),
        purchase_tax: gstAmount.toString(),
        purchase_temp_amount: netTotal.toString(), // unchanged net total
        purchase_gross: finalAmount.toString(), // reduced by round-off
        purchase_balance: finalAmount.toString(),
        purchase_amount_round: roundOff.toString(),
        purchase_advance: "0",
        purchase_amount_received: restData.purchase_amount_received || "0",
        purchase_amount: restData.purchase_amount_received || "0", // final payable amount
        purchase_year: currentYear,
        purchase_no_of_count: formattedItemEntries.length,
        purchase_sub_data: formattedItemEntries,
      };

      await createPurchaseMutation.mutateAsync(payload);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create Aaya",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/purchase");
  };

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        <div className="sm:hidden">
          {/* Mobile View */}
          <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-2 mb-2">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={handleCancel}
                className="flex items-center text-blue-800"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <h1 className="text-base font-bold">Add Purchases</h1>
              </button>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-md p-2">
              <p className="text-xs text-green-800 font-medium">
                Amount to be Paid
              </p>
              <p className="text-sm font-bold text-green-900">
                {Number(amountToBePaid).toFixed(0) || 0}
              </p>
            </div>
          </div>

          <div className="mb-14">
            <form
              id="purchase-form"
              onSubmit={handleFormSubmit}
              className="space-y-4"
            >
              {/* Purchase Info */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Purchase Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="purchase_date">Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      {...form.register("purchase_date")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_supplier">
                      Supplier <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="purchase_supplier"
                      {...form.register("purchase_supplier")}
                      className="mt-1"
                      placeholder="Enter Supplier Name"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_bill_no">
                      JFC Bill No{" "}
                      <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="purchase_bill_no"
                      {...form.register("purchase_bill_no")}
                      className="mt-1"
                      placeholder="Enter Bill Number"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Items</h3>
                </div>
                {itemEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-2 rounded-md border border-gray-200 mb-2"
                  >
                    <div className="grid grid-cols-12 gap-1 items-center">
                      <div className="col-span-11">
                        <div className="flex gap-1 mb-1">
                          {isCustomItem[index] ? (
                            <>
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  className="h-8 text-sm uppercase placeholder:normal-case"
                                  placeholder="Enter Item Name"
                                  value={customItems[index] || ""}
                                  onChange={(e) =>
                                    handleCustomItemChange(
                                      index,
                                      e.target.value.toUpperCase(),
                                    )
                                  }
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs whitespace-nowrap shrink-0"
                                onClick={() => handleToggleCustomItem(index)}
                              >
                                Select
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <MemoizedProductSelect
                                  value={entry.purchase_sub_item}
                                  onChange={(value) =>
                                    handleItemChange(
                                      index,
                                      "purchase_sub_item",
                                      value,
                                    )
                                  }
                                  options={productOptions}
                                  placeholder="Select item..."
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs whitespace-nowrap shrink-0"
                                onClick={() => handleToggleCustomItem(index)}
                              >
                                <NotInListIcon className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div>
                            <Input
                              type="tel"
                              value={entry.purchase_sub_qnty}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "purchase_sub_qnty",
                                  e.target.value,
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm text-right"
                              placeholder="Qnty (pcs/box)"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <Input
                              type="tel"
                              value={entry.purchase_sub_qnty_sqr}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "purchase_sub_qnty_sqr",
                                  e.target.value,
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm text-right"
                              placeholder="Qnty (sqft)"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <Input
                              type="tel"
                              value={entry.purchase_sub_rate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "purchase_sub_rate",
                                  e.target.value,
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm text-right"
                              placeholder="Rate"
                              maxLength={10}
                            />
                          </div>
                        </div>
                        <div className="mt-1">
                          <Input
                            type="tel"
                            value={entry.purchase_sub_amount}
                            disabled
                            onKeyDown={handleKeyDown}
                            className="h-8 text-sm bg-gray-100 text-right"
                            placeholder="Amount"
                          />
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemEntry(index)}
                          disabled={itemEntries.length <= 1}
                          className="h-7 w-7 hover:bg-gray-200 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItemEntry}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-xs h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Other Amount & Total */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                {/* Labour Charges */}
                <div>
                  <Label>Labour Charges</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <SelectShadcn
                      value={loadingType}
                      onValueChange={(val) => {
                        setLoadingType(val);
                        if (val === "Loading Only") {
                          form.setValue("purchase_unloading", "");
                        } else {
                          form.setValue("purchase_loading", "");
                        }
                        calculateAndSetTotals(itemEntries);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Loading Only">
                          Loading Only
                        </SelectItem>
                        <SelectItem value="Loading & Unloading">
                          Loading & Unloading
                        </SelectItem>
                      </SelectContent>
                    </SelectShadcn>
                    <Input
                      id={
                        loadingType === "Loading Only"
                          ? "purchase_loading"
                          : "purchase_unloading"
                      }
                      type="tel"
                      value={
                        form.watch(
                          loadingType === "Loading Only"
                            ? "purchase_loading"
                            : "purchase_unloading",
                        ) || ""
                      }
                      onChange={(e) =>
                        handleChargeChange(
                          loadingType === "Loading Only"
                            ? "purchase_loading"
                            : "purchase_unloading",
                          e.target.value,
                        )
                      }
                      maxLength={10}
                      onKeyDown={handleKeyDown}
                      className="text-right"
                      placeholder="0"
                    />
                  </div>
                </div>
                {/* Tempo Charges */}
                <div>
                  <Label htmlFor="purchase_tempo">Tempo Charges</Label>
                  <Input
                    id="purchase_tempo"
                    type="tel"
                    {...form.register("purchase_tempo")}
                    onChange={(e) =>
                      handleChargeChange("purchase_tempo", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className="mt-1 text-right"
                    placeholder="0"
                  />
                </div>
                {/* Other 1 */}
                <div className="space-y-1">
                  <Label>Other Charges 1</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      placeholder="Other Label 1"
                      {...form.register("purchase_other_label")}
                    />
                    <Input
                      id="purchase_other"
                      type="tel"
                      {...form.register("purchase_other")}
                      onChange={(e) =>
                        handleChargeChange("purchase_other", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="text-right"
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                </div>
                {/* Other 2 */}
                <div className="space-y-1">
                  <Label>Other Charges 2</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      placeholder="Other Label 2"
                      {...form.register("purchase_other1_label")}
                    />
                    <Input
                      id="purchase_other1"
                      type="tel"
                      {...form.register("purchase_other1")}
                      onChange={(e) =>
                        handleChargeChange("purchase_other1", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="text-right"
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                </div>
                {/* Gross Total */}
                <div>
                  <Label>Gross Total</Label>
                  <Input
                    type="text"
                    value={Number(displayGrandTotal).toFixed(0)}
                    disabled
                    className="mt-1 bg-gray-100 font-medium text-right"
                  />
                </div>

                {/* GST Amount */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Tax Amount</Label>
                  </div>
                  <Input
                    type="tel"
                    {...form.register("purchase_tax")}
                    onChange={handleTaxChange}
                    className="mt-1 text-right"
                    maxLength={10}
                    placeholder="0"
                  />
                </div>

                {/* Net Total (unchanged by round-off) */}
                <div>
                  <Label>Net Total</Label>
                  <Input
                    type="tel"
                    {...form.register("purchase_temp_amount")}
                    onKeyDown={handleKeyDown}
                    className="mt-1 text-right font-medium"
                    maxLength={10}
                    placeholder="0"
                  />
                </div>

                {/* Round Off - editable, subtracts from net total */}
                <div>
                  <Label>Round Off</Label>
                  <Input
                    type="text"
                    {...form.register("purchase_amount_round", {
                      onChange: handleRoundOffChange,
                    })}
                    className="mt-1 text-right font-medium bg-gray-100"
                    maxLength={10}
                    placeholder="0"
                  />
                </div>

                {/* Amount to be Paid (Net Total - Round Off) */}
                <div>
                  <Label className="font-semibold text-blue-900">
                    Amount to be Paid
                  </Label>
                  <Input
                    type="text"
                    value={Number(amountToBePaid).toFixed(0)}
                    disabled
                    className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md"
                  />
                </div>

                {/* Final Amount Paid */}
                <div>
                  <Label>Final Amount Paid</Label>
                  <Input
                    type="tel"
                    {...form.register("purchase_amount_received")}
                    onKeyDown={handleKeyDown}
                    className="mt-1 text-right"
                    maxLength={10}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 hover:bg-gray-100 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-xs h-9"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden sm:block">
          {/* Desktop View */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <CardTitle>Add Purchases</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form
                id="purchase-form"
                onSubmit={handleFormSubmit}
                className="space-y-2"
              >
                {/* Purchase Information */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 bg-blue-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      {...form.register("purchase_date")}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_supplier">
                      Supplier <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="purchase_supplier"
                      {...form.register("purchase_supplier")}
                      className="bg-white"
                      placeholder="Enter Supplier Name"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_bill_no">
                      JFC Bill No{" "}
                      <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="purchase_bill_no"
                      {...form.register("purchase_bill_no")}
                      className="bg-white"
                      placeholder="Enter Bill Number"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="border rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Items</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium text-sm w-[200px] min-w-[160px]">
                            Item{" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                            Qnty (pcs/box)
                          </th>
                          <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                            Qnty (sqft){" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                            Rate{" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm w-[110px] min-w-[90px]">
                            Amount
                          </th>
                          <th className="text-left p-2 font-medium text-sm w-[50px]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemEntries.map((entry, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">
                              <div className="flex gap-2 items-start">
                                {isCustomItem[index] ? (
                                  <div className="flex-1 min-w-0 flex gap-2">
                                    <Input
                                      type="text"
                                      className="h-9 uppercase placeholder:normal-case"
                                      placeholder="Enter Item Name"
                                      value={customItems[index] || ""}
                                      onChange={(e) =>
                                        handleCustomItemChange(
                                          index,
                                          e.target.value.toUpperCase(),
                                        )
                                      }
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-9 whitespace-nowrap shrink-0"
                                      onClick={() =>
                                        handleToggleCustomItem(index)
                                      }
                                    >
                                      Select
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex-1 min-w-0">
                                      <MemoizedProductSelect
                                        value={entry.purchase_sub_item}
                                        onChange={(value) =>
                                          handleItemChange(
                                            index,
                                            "purchase_sub_item",
                                            value,
                                          )
                                        }
                                        options={productOptions}
                                        placeholder="Select item"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-9 whitespace-nowrap shrink-0"
                                      onClick={() =>
                                        handleToggleCustomItem(index)
                                      }
                                    >
                                      <NotInListIcon className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.purchase_sub_qnty}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "purchase_sub_qnty",
                                    e.target.value,
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9 text-right"
                                placeholder="0"
                                maxLength={10}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.purchase_sub_qnty_sqr}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "purchase_sub_qnty_sqr",
                                    e.target.value,
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9 text-right"
                                placeholder="0"
                                maxLength={10}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.purchase_sub_rate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "purchase_sub_rate",
                                    e.target.value,
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9 text-right"
                                placeholder="0"
                                maxLength={10}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.purchase_sub_amount}
                                disabled
                                className="h-9 bg-gray-100 text-right"
                                placeholder="0"
                                onKeyDown={handleKeyDown}
                              />
                            </td>
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItemEntry(index)}
                                disabled={itemEntries.length <= 1}
                                className="h-9 w-9 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItemEntry}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
                {/* Other Amount & Total */}
                <div className="border rounded-lg p-3 bg-white">
                  <div className="grid grid-cols-1 space-x-24 md:grid-cols-2 gap-4">
                    <div></div>
                    <div className="space-y-2">
                      {/* Tempo Charges */}
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="purchase_tempo">Tempo Charges</Label>
                        <Input
                          className="w-[150px] text-right shrink-0"
                          id="purchase_tempo"
                          type="tel"
                          {...form.register("purchase_tempo")}
                          onChange={(e) =>
                            handleChargeChange("purchase_tempo", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>
                      {/* Labour Charges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="font-medium shrink-0">
                            Labour Charges
                          </Label>
                          <SelectShadcn
                            value={loadingType}
                            onValueChange={(val) => {
                              setLoadingType(val);
                              if (val === "Loading Only") {
                                form.setValue("purchase_unloading", "");
                              } else {
                                form.setValue("purchase_loading", "");
                              }
                              calculateAndSetTotals(itemEntries);
                            }}
                          >
                            <SelectTrigger className="h-9 w-full min-w-[120px]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Loading Only">
                                Loading Only
                              </SelectItem>
                              <SelectItem value="Loading & Unloading">
                                Loading & Unloading
                              </SelectItem>
                            </SelectContent>
                          </SelectShadcn>
                        </div>
                        <Input
                          className="w-[150px] h-9 text-right shrink-0"
                          id={
                            loadingType === "Loading Only"
                              ? "purchase_loading"
                              : "purchase_unloading"
                          }
                          type="tel"
                          value={
                            form.watch(
                              loadingType === "Loading Only"
                                ? "purchase_loading"
                                : "purchase_unloading",
                            ) || ""
                          }
                          onChange={(e) => {
                            handleChargeChange(
                              loadingType === "Loading Only"
                                ? "purchase_loading"
                                : "purchase_unloading",
                              e.target.value,
                            );
                          }}
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>

                      {/* Other Charges 1 */}
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          placeholder="Other Label 1"
                          className="flex-1 h-9"
                          {...form.register("purchase_other_label")}
                        />
                        <Input
                          className="w-[150px] h-9 text-right shrink-0"
                          id="purchase_other"
                          type="tel"
                          {...form.register("purchase_other")}
                          onChange={(e) =>
                            handleChargeChange("purchase_other", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>

                      {/* Other Charges 2 */}
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          placeholder="Other Label 2"
                          className="flex-1 h-9"
                          {...form.register("purchase_other1_label")}
                        />
                        <Input
                          className="w-[150px] h-9 text-right shrink-0"
                          id="purchase_other1"
                          type="tel"
                          {...form.register("purchase_other1")}
                          onChange={(e) =>
                            handleChargeChange(
                              "purchase_other1",
                              e.target.value,
                            )
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>

                      {/* Gross Total */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Gross Total</Label>
                        <Input
                          className="w-[150px] bg-gray-100 font-medium text-right shrink-0"
                          type="text"
                          value={Number(displayGrandTotal).toFixed(0)}
                          disabled
                        />
                      </div>

                      {/* Tax Amount */}
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">
                          Tax Amount{"    "}
                          <Label className="font-medium text-xs text-gray-500">
                            (GST @ 18% = {Number(autoGst18).toFixed(2)})
                          </Label>
                        </Label>
                        <Input
                          className="w-[150px] text-right"
                          type="tel"
                          {...form.register("purchase_tax")}
                          onChange={handleTaxChange}
                          placeholder="0"
                          maxLength={10}
                        />
                      </div>

                      {/* Net Total (unchanged) */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Net Total</Label>
                        <Input
                          className="w-[150px] text-right font-medium shrink-0"
                          type="tel"
                          {...form.register("purchase_temp_amount")}
                          onKeyDown={handleKeyDown}
                          maxLength={10}
                          placeholder="0"
                        />
                      </div>

                      {/* Round Off - editable, subtracts */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Round Off</Label>
                        <Input
                          className="w-[150px] text-right font-medium bg-gray-100 shrink-0"
                          type="text"
                          {...form.register("purchase_amount_round", {
                            onChange: handleRoundOffChange,
                          })}
                          placeholder="0"
                        />
                      </div>

                      {/* Amount to be Paid (Net Total - Round Off) */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-semibold text-blue-900">
                          Amount to be Paid
                        </Label>
                        <Input
                          className="w-[150px] bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md shrink-0"
                          type="text"
                          value={Number(amountToBePaid).toFixed(0)}
                          disabled
                        />
                      </div>

                      {/* Final Amount Paid */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Final Amount Paid</Label>
                        <Input
                          className="w-[150px] text-right shrink-0"
                          type="tel"
                          {...form.register("purchase_amount_received")}
                          onKeyDown={handleKeyDown}
                          maxLength={10}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const formElement =
                        document.getElementById("purchase-form");
                      if (formElement) {
                        formElement.requestSubmit();
                      }
                    }}
                    className="border-gray-300 bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                  >
                    Save and Close
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default PurchaseGraniteAdd;
