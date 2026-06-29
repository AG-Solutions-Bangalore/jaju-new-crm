import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  useProductTypeGroup,
  useProductTypeGroupNew,
  useCreatePurchase,
} from "../hooks/usePurchase";
import MobilePurchaseForm from "../components/MobilePurchaseForm";
import DesktopPurchaseForm from "../components/DesktopPurchaseForm";

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

const PurchaseAddPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingType, setLoadingType] = useState("");
  const [gstEdited, setGstEdited] = useState(false);
  const [autoGst18, setAutoGst18] = useState(0);
  const [roundOffEdited, setRoundOffEdited] = useState(false);

  const { data: currentYear, isLoading: isYearLoading } = useCurrentYear();
  const { data: productTypeGroup = [] } = useProductTypeGroup();
  const { data: product = [], isLoading: isProductLoading } = useProductTypeGroupNew();
  const createMutation = useCreatePurchase();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchase_date: moment().format("YYYY-MM-DD"),
      purchase_year: "",
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

  useEffect(() => {
    if (currentYear) {
      form.setValue("purchase_year", currentYear);
    }
  }, [currentYear, form]);

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

  const handleToggleCustomItem = (index) => {
    const isCurrentlyCustom = isCustomItem[index];
    if (isCurrentlyCustom) {
      setCustomItems((prev) => ({ ...prev, [index]: "" }));
    } else {
      const selectedItem = itemEntries[index]?.purchase_sub_item || "";
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

  const calculateAndSetTotals = (entries, skipGst = false) => {
    const itemsTotal = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
      0
    );
    const tempo = parseFloat(form.getValues("purchase_tempo") || 0);
    const loading = parseFloat(form.getValues("purchase_loading") || 0);
    const unloading = parseFloat(form.getValues("purchase_unloading") || 0);
    const other = parseFloat(form.getValues("purchase_other") || 0);
    const other1 = parseFloat(form.getValues("purchase_other1") || 0);

    const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
    setAutoGst18(grandTotal * 0.18);

    if (!skipGst && !gstEdited) {
      const gstAmount = grandTotal * 0.18;
      form.setValue("purchase_tax", gstAmount.toFixed(2));
    }
    const currentGst = parseFloat(form.getValues("purchase_tax") || 0);
    const netTotal = grandTotal + currentGst;

    form.setValue("purchase_temp_amount", netTotal.toFixed(2));

    const roundOff = parseFloat(form.getValues("purchase_amount_round") || 0);
    const finalAmount = netTotal - roundOff;

    form.setValue("purchase_gross", finalAmount.toString());
    form.setValue("purchase_balance", finalAmount.toString());
    form.setValue("purchase_advance", "0");
  };

  const itemsTotal = itemEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
    0
  );
  const watchTempo = parseFloat(form.watch("purchase_tempo") || 0);
  const watchLoading = parseFloat(form.watch("purchase_loading") || 0);
  const watchUnloading = parseFloat(form.watch("purchase_unloading") || 0);
  const watchOther = parseFloat(form.watch("purchase_other") || 0);
  const watchOther1 = parseFloat(form.watch("purchase_other1") || 0);

  const displayGrandTotal =
    itemsTotal + watchTempo + watchLoading + watchUnloading + watchOther + watchOther1;
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
          parseFloat(updatedEntries[index].purchase_sub_rate || 0)
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

  const handleRoundOffChange = (e) => {
    const value = e.target.value;
    const roundOffVal = parseFloat(value) || 0;
    form.setValue("purchase_amount_round", roundOffVal.toString());
    setRoundOffEdited(true);

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

  const validateForm = (data) => {
    const formErrors = {
      date: !data.purchase_date ? "Date is required" : "",
      supplier: !data.purchase_supplier ? "Supplier is required" : "",
      billNo: !data.purchase_bill_no ? "Bill number is required" : "",
    };

    const itemErrors = itemEntries.map((entry, index) => ({
      item: isCustomItem[index]
        ? (!customItems[index] ? "required" : "")
        : (!entry.purchase_sub_item ? "required" : ""),
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
      (err) => err.item || err.qntySqr || err.rate
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
                        (error.item || error.qntySqr || error.rate) && (
                          <tr key={i} className="bg-white hover:bg-gray-50">
                            <td className="px-1.5 py-1.5 text-center text-gray-600 border-b border-gray-200 font-medium">
                              {i + 1}
                            </td>
                            <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200 break-all">
                              {error.item}
                            </td>
                            <td className="px-1.5 py-1.5 text-red-600 font-mono text-right border-b border-gray-200 break-all">
                              {error.qntySqr}
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
      const formattedItemEntries = itemEntries.map((entry, index) => {
        return {
          ...entry,
          purchase_sub_pcs: entry.purchase_sub_qnty || "0",
          purchase_sub_item: isCustomItem[index] ? customItems[index] : entry.purchase_sub_item,
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
        0
      );
      const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
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
        purchase_temp_amount: netTotal.toString(),
        purchase_gross: finalAmount.toString(),
        purchase_balance: finalAmount.toString(),
        purchase_amount_round: roundOff.toString(),
        purchase_advance: "0",
        purchase_amount_received: restData.purchase_amount_received || "0",
        purchase_amount: restData.purchase_amount_received || "0",
        purchase_year: currentYear || "",
        purchase_no_of_count: formattedItemEntries.length,
        purchase_sub_data: formattedItemEntries,
      };

      await createMutation.mutateAsync(payload);
      navigate("/purchase");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create Purchase",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/purchase");
  };

  if (isYearLoading || isProductLoading) {
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
    amountToBePaid,
    displayGrandTotal,
    autoGst18,
    customItems,
    isCustomItem,
    handleCustomItemChange,
    handleToggleCustomItem,
    isSubmitting,
    title: "Add Purchases",
  };

  return (
    <Page>
      <MobilePurchaseForm {...commonProps} />
      <DesktopPurchaseForm {...commonProps} />
    </Page>
  );
};

export default PurchaseAddPage;
