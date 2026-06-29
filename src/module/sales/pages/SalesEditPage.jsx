import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import useNumericInput from "@/hooks/useNumericInput";
import {
  useCurrentYear,
  useProductTypeGroupNew,
  useSalesById,
  useDeleteSalesSubItem,
  useUpdateSalesDirect,
} from "../hooks/useSales";
import MobileSalesForm from "../components/MobileSalesForm";
import DesktopSalesForm from "../components/DesktopSalesForm";

const formSchema = z.object({
  sales_date: z.string(),
  sales_year: z.string(),
  sales_customer: z.string().min(1, "Customer name is required"),
  sales_address: z.string(),
  sales_mobile: z.string(),
  sales_no: z.string(),
  sales_item_type: z.string(),
  sales_tax: z.string(),
  sales_tempo: z.string(),
  sales_loading: z.string(),
  sales_unloading: z.string(),
  sales_other: z.string(),
  sales_other1: z.string(),
  sales_other_label: z.string().optional(),
  sales_other1_label: z.string().optional(),
  sales_gross: z.string(),
  sales_advance: z.string(),
  sales_balance: z.string(),
  sales_temp_amount: z.string(),
  sales_amount_round: z.string().optional(),
  sales_amount_received: z.string(),
});

const SalesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingType, setLoadingType] = useState("");
  const [gstEdited, setGstEdited] = useState(false);
  const [autoGst18, setAutoGst18] = useState(0);
  const [roundOffEdited, setRoundOffEdited] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data: currentYear } = useCurrentYear();
  const { data: salesId, isLoading: isSalesLoading } = useSalesById(id);
  const { data: product = [], isLoading: isProductLoading } = useProductTypeGroupNew();

  const deleteSubMutation = useDeleteSalesSubItem();
  const updateMutation = useUpdateSalesDirect(id);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sales_date: moment().format("YYYY-MM-DD"),
      sales_year: "",
      sales_customer: "",
      sales_address: "",
      sales_mobile: "",
      sales_no: "",
      sales_item_type: "",
      sales_tax: "",
      sales_tempo: "",
      sales_loading: "",
      sales_unloading: "",
      sales_other: "",
      sales_other1: "",
      sales_other_label: "",
      sales_other1_label: "",
      sales_gross: "",
      sales_advance: "",
      sales_balance: "",
      sales_temp_amount: "",
      sales_amount_round: "",
      sales_amount_received: "",
    },
  });

  const [itemEntries, setItemEntries] = useState([
    {
      id: "",
      sales_sub_type: "",
      sales_sub_item: "",
      sales_sub_qnty: "",
      sales_sub_qnty_sqr: "",
      sales_sub_rate: "",
      sales_sub_amount: "",
      sales_sub_item_original: "",
    },
  ]);
  const [customItems, setCustomItems] = useState({});
  const [isCustomItem, setIsCustomItem] = useState({});

  const handleCustomItemChange = (index, value) => {
    setCustomItems((prev) => ({ ...prev, [index]: value }));
  };

  const handleToggleCustomItem = (index) => {
    const isCurrentlyCustom = isCustomItem[index];
    if (isCurrentlyCustom) {
      setCustomItems((prev) => ({ ...prev, [index]: "" }));
    } else {
      const selectedItem = itemEntries[index]?.sales_sub_item || "";
      setCustomItems((prev) => ({ ...prev, [index]: selectedItem }));
    }
    setIsCustomItem((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const productOptions = useMemo(() => {
    return product.map((item) => {
      const name = item.item_name || item.product_type_group || item.product_type;
      return { value: name, label: name };
    });
  }, [product]);

  // Load existing data
  useEffect(() => {
    if (salesId?.sales && salesId?.salesSub) {
      const { sales, salesSub } = salesId;

      const formatToInteger = (val) => {
        if (val === undefined || val === null || val === "") return "";
        const parsed = parseFloat(val);
        return isNaN(parsed) ? "" : Math.round(parsed).toString();
      };

      const savedGross = parseFloat(sales.sales_gross || 0);
      const savedTempAmount = parseFloat(sales.sales_temp_amount || sales.sales_gross || 0);
      const savedRoundOff =
        sales.sales_amount_round !== undefined && sales.sales_amount_round !== null
          ? Math.round(parseFloat(sales.sales_amount_round))
          : Math.round(savedGross - savedTempAmount);

      if (sales.sales_unloading && parseFloat(sales.sales_unloading) > 0) {
        setLoadingType("Loading & Unloading");
      } else {
        setLoadingType("Loading Only");
      }

      form.reset({
        sales_date: moment(sales.sales_date).format("YYYY-MM-DD"),
        sales_year: sales.sales_year || currentYear || "",
        sales_item_type: sales.sales_item_type || "Granites",
        sales_customer: sales.sales_customer || "",
        sales_address: sales.sales_address || "",
        sales_mobile: sales.sales_mobile || "",
        sales_no: sales.sales_no || "",
        sales_other: formatToInteger(sales.sales_other),
        sales_other1: formatToInteger(sales.sales_other1),
        sales_other_label: sales.sales_other_label || "",
        sales_other1_label: sales.sales_other1_label || "",
        sales_tempo: formatToInteger(sales.sales_tempo),
        sales_tax: formatToInteger(sales.sales_tax),
        sales_gross: formatToInteger(sales.sales_gross),
        sales_loading: formatToInteger(sales.sales_loading),
        sales_unloading: formatToInteger(sales.sales_unloading),
        sales_advance: formatToInteger(sales.sales_advance),
        sales_balance: formatToInteger(sales.sales_balance),
        sales_no_of_count: sales.sales_no_of_count?.toString() || "1",
        sales_temp_amount: formatToInteger(savedTempAmount),
        sales_amount_round: savedRoundOff === 0 ? "" : savedRoundOff.toString(),
        sales_amount_received: formatToInteger(sales.sales_amount_received),
      });

      if (salesSub?.length > 0) {
        const mappedSub = salesSub.map((sub) => ({
          id: sub.id || "",
          sales_sub_type: sub.sales_sub_type || "",
          sales_sub_item: sub.sales_sub_item || "",
          sales_sub_qnty: sub.sales_sub_pcs?.toString() || sub.sales_sub_qnty?.toString() || "",
          sales_sub_qnty_sqr: sub.sales_sub_qnty_sqr?.toString() || "",
          sales_sub_rate: formatToInteger(sub.sales_sub_rate),
          sales_sub_amount: formatToInteger(sub.sales_sub_amount),
          sales_sub_item_original: sub.sales_sub_item_original || "",
        }));
        setItemEntries(mappedSub);
        setTimeout(() => {
          calculateAndSetTotals(mappedSub);
        }, 100);
      }
      setIsInitialLoading(false);
    }
  }, [salesId, currentYear]);

  useEffect(() => {
    if (salesId?.salesSub && product && product.length > 0) {
      const { salesSub } = salesId;
      if (salesSub && salesSub.length > 0) {
        const newIsCustomItem = {};
        const newCustomItems = {};
        salesSub.forEach((sub, index) => {
          const itemName = sub.sales_sub_item || "";
          if (itemName) {
            const exists = product.some((item) => {
              const name = item.item_name || item.product_type_group || item.product_type;
              return name === itemName;
            });
            if (!exists) {
              newIsCustomItem[index] = true;
              newCustomItems[index] = itemName;
            }
          }
        });
        setIsCustomItem(newIsCustomItem);
        setCustomItems(newCustomItems);
      }
    }
  }, [salesId, product]);

  const calculateAndSetTotals = (entries, skipGst = false) => {
    const itemsTotal = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.sales_sub_amount || 0),
      0
    );
    const tempo = parseFloat(form.getValues("sales_tempo") || 0);
    const loading = parseFloat(form.getValues("sales_loading") || 0);
    const unloading = parseFloat(form.getValues("sales_unloading") || 0);
    const other = parseFloat(form.getValues("sales_other") || 0);
    const other1 = parseFloat(form.getValues("sales_other1") || 0);

    const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
    setAutoGst18(grandTotal * 0.18);

    const currentGst = parseFloat(form.getValues("sales_tax") || 0);
    const netTotal = grandTotal + currentGst;

    form.setValue("sales_temp_amount", netTotal.toFixed(2));

    const roundOff = parseFloat(form.getValues("sales_amount_round") || 0);
    const finalAmount = netTotal - roundOff;

    form.setValue("sales_gross", finalAmount.toString());
    form.setValue("sales_balance", finalAmount.toString());
    form.setValue("sales_advance", "0");
  };

  const itemsTotal = itemEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.sales_sub_amount || 0),
    0
  );
  const watchTempo = parseFloat(form.watch("sales_tempo") || 0);
  const watchLoading = parseFloat(form.watch("sales_loading") || 0);
  const watchUnloading = parseFloat(form.watch("sales_unloading") || 0);
  const watchOther = parseFloat(form.watch("sales_other") || 0);
  const watchOther1 = parseFloat(form.watch("sales_other1") || 0);

  const displayGrandTotal =
    itemsTotal + watchTempo + watchLoading + watchUnloading + watchOther + watchOther1;
  const displayGst = parseFloat(form.watch("sales_tax") || 0);
  const displayNetTotal = displayGrandTotal + displayGst;

  const roundOff = parseFloat(form.watch("sales_amount_round") || 0);
  const amountToBeCollected = displayNetTotal - roundOff;

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "sales_sub_qnty_sqr" || field === "sales_sub_rate") &&
      updatedEntries[index].sales_sub_qnty_sqr &&
      updatedEntries[index].sales_sub_rate
    ) {
      updatedEntries[index].sales_sub_amount = Math.round(
        parseFloat(updatedEntries[index].sales_sub_qnty_sqr || 0) *
          parseFloat(updatedEntries[index].sales_sub_rate || 0)
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
    form.setValue("sales_tax", value);
    setGstEdited(true);
    calculateAndSetTotals(itemEntries, true);
  };

  const handleRoundOffChange = (e) => {
    const value = e.target.value;
    const roundOffVal = parseFloat(value) || 0;
    form.setValue("sales_amount_round", roundOffVal.toString());
    setRoundOffEdited(true);

    const netTotal = parseFloat(form.getValues("sales_temp_amount") || 0);
    const finalAmount = netTotal - roundOffVal;
    form.setValue("sales_gross", finalAmount.toString());
    form.setValue("sales_balance", finalAmount.toString());
  };

  const addItemEntry = () => {
    const updated = [
      ...itemEntries,
      {
        id: "",
        sales_sub_type: "",
        sales_sub_item: "",
        sales_sub_qnty: "",
        sales_sub_qnty_sqr: "",
        sales_sub_rate: "",
        sales_sub_amount: "",
        sales_sub_item_original: "",
      },
    ];
    setItemEntries(updated);
    calculateAndSetTotals(updated);
  };

  const removeItemEntry = async (index, subId) => {
    if (subId) {
      try {
        await deleteSubMutation.mutateAsync(subId);
      } catch (error) {
        console.error("Failed to delete sub item from database", error);
        return;
      }
    }

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

    calculateAndSetTotals(updatedEntries);
  };

  const validateForm = (data) => {
    const formErrors = {
      date: !data.sales_date ? "Date is required" : "",
      customer: !data.sales_customer ? "Customer name is required" : "",
    };

    const itemErrors = itemEntries.map((entry, index) => ({
      item: isCustomItem[index]
        ? (!customItems[index] ? "required" : "")
        : (!entry.sales_sub_item ? "required" : ""),
      qnty:
        entry.sales_sub_qnty !== "" && entry.sales_sub_qnty != null && isNaN(entry.sales_sub_qnty)
          ? "Quantity must be a number"
          : "",
      rate: !entry.sales_sub_rate
        ? "required"
        : isNaN(entry.sales_sub_rate)
        ? "Rate must be a number"
        : "",
    }));

    const hasFormErrors = Object.values(formErrors).some((err) => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.item || err.qnty || err.rate
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
                        <td className="px-2 py-1.5 text-red-600 border-b border-red-200 break-all">
                          {formErrors.date}
                        </td>
                      </tr>
                    )}
                    {formErrors.customer && (
                      <tr className="bg-white hover:bg-gray-50">
                        <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                          Customer
                        </td>
                        <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                          {formErrors.customer}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {hasItemErrors && (
              <div className="w-full">
                <div className="font-medium mb-2 text-white">Item Errors</div>
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
                        Qty
                      </th>
                      <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemErrors.map(
                      (error, i) =>
                        (error.item || error.qnty || error.rate) && (
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
                              {error.rate}
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
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
      const { sales_amount_round, ...restData } = data;
      const formattedItemEntries = itemEntries.map((entry, index) => ({
        id: entry.id || "",
        sales_sub_pcs: entry.sales_sub_qnty || "0",
        sales_sub_item: isCustomItem[index] ? customItems[index] : entry.sales_sub_item,
        sales_sub_type: entry.sales_sub_type || "",
        sales_sub_qnty: entry.sales_sub_qnty || "0",
        sales_sub_qnty_sqr: entry.sales_sub_qnty_sqr || "0",
        sales_sub_rate: entry.sales_sub_rate || "0",
        sales_sub_amount: entry.sales_sub_amount || "0",
        sales_sub_item_original: entry.sales_sub_item_original || "",
      }));

      const itemsTotal = itemEntries.reduce(
        (sum, entry) => sum + parseFloat(entry.sales_sub_amount || 0),
        0
      );
      const tempo = parseFloat(form.watch("sales_tempo") || 0);
      const loading = parseFloat(form.watch("sales_loading") || 0);
      const unloading = parseFloat(form.watch("sales_unloading") || 0);
      const other = parseFloat(form.watch("sales_other") || 0);
      const other1 = parseFloat(form.watch("sales_other1") || 0);

      const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
      const gstAmount = parseFloat(form.watch("sales_tax") || 0);
      const netTotal = grandTotal + gstAmount;
      const roundOff = parseFloat(form.watch("sales_amount_round") || 0);
      const finalAmount = netTotal - roundOff;

      const payload = {
        ...restData,
        sales_tempo: tempo.toString(),
        sales_loading: loading.toString(),
        sales_unloading: unloading.toString(),
        sales_other: other.toString(),
        sales_other1: other1.toString(),
        sales_tax: gstAmount.toString(),
        sales_temp_amount: netTotal.toString(),
        sales_gross: restData.sales_amount_received || "0",
        sales_balance: finalAmount.toString(),
        sales_amount_round: roundOff.toString(),
        sales_advance: "0",
        sales_amount_received: restData.sales_amount_received || "0",
        sales_no_of_count: formattedItemEntries.length,
        sales_sub_data: formattedItemEntries,
      };

      await updateMutation.mutateAsync(payload);
      navigate("/sales");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update sales",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/sales");
  };

  if (isSalesLoading || isProductLoading || isInitialLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-screen">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Page>
    );
  }

  const commonProps = {
    form,
    itemEntries,
    handleItemChange,
    addItemEntry,
    removeItemEntry,
    handleChargeChange,
    handleTaxChange,
    handleRoundOffChange,
    handleCancel,
    handleFormSubmit,
    productOptions,
    handleKeyDown,
    loadingType,
    setLoadingType,
    calculateAndSetTotals,
    amountToBeCollected,
    displayGrandTotal,
    autoGst18,
    customItems,
    isCustomItem,
    handleCustomItemChange,
    handleToggleCustomItem,
    isSubmitting,
    title: "Edit Sales",
  };

  return (
    <Page>
      <MobileSalesForm {...commonProps} />
      <DesktopSalesForm {...commonProps} />
    </Page>
  );
};

export default SalesEditPage;
