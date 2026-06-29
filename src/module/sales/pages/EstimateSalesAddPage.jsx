import React, { useState, useMemo, useEffect } from "react";
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
  useProductTypeGroup,
  useProductTypesByGroup,
  useEstimateById,
  useCreateSales,
} from "../hooks/useSales";
import MobileEstimateSalesForm from "../components/MobileEstimateSalesForm";
import DesktopEstimateSalesForm from "../components/DesktopEstimateSalesForm";

const typeOptions = [
  { value: "Granites", label: "Granites" },
  { value: "Tiles", label: "Tiles" },
];

const formSchema = z.object({
  sales_date: z.string(),
  sales_year: z.string(),
  sales_customer: z.string(),
  sales_address: z.string(),
  sales_mobile: z.string(),
  sales_item_type: z.string(),
  sales_tax: z.string(),
  sales_tempo: z.string(),
  sales_loading: z.string(),
  sales_unloading: z.string(),
  sales_other: z.string(),
  sales_gross: z.string(),
  sales_advance: z.string(),
  sales_balance: z.string(),
});

const EstimateSalesAddPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data: currentYear } = useCurrentYear();
  const { data: salesEstimateId, isLoading: isEstimateLoading } = useEstimateById(id);
  const { data: productTypeGroup = [] } = useProductTypeGroup();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sales_date: moment().format("YYYY-MM-DD"),
      sales_year: "",
      sales_customer: "",
      sales_address: "",
      sales_mobile: "",
      sales_item_type: "",
      sales_tax: "",
      sales_tempo: "",
      sales_loading: "",
      sales_unloading: "",
      sales_other: "",
      sales_gross: "",
      sales_advance: "",
      sales_balance: "",
    },
  });

  const selectedItemType = form.watch("sales_item_type");
  const { data: product = [], refetch: refetchProducts, isLoading: isLoadingItems } =
    useProductTypesByGroup(selectedItemType);

  const createSalesMutation = useCreateSales();

  const [itemEntries, setItemEntries] = useState([
    {
      id: "",
      estimate_sub_type: "",
      estimate_sub_item: "",
      estimate_sub_qnty: "",
      estimate_sub_qnty_sqr: "",
      estimate_sub_rate: "",
      estimate_sub_amount: "",
      sales_sub_item_original: "",
    },
  ]);

  const productOptions = useMemo(() => {
    return product.map((item) => ({
      value: item.product_type,
      label: item.product_type,
    }));
  }, [product]);

  // Load existing estimate data
  useEffect(() => {
    if (salesEstimateId) {
      const { estimate: sId, estimateSub: sSub } = salesEstimateId;

      const formatToInteger = (val) => {
        if (val === undefined || val === null || val === "") return "";
        const parsed = parseFloat(val);
        return isNaN(parsed) ? "" : Math.round(parsed).toString();
      };

      const formValues = {
        sales_date: moment(sId.estimate_date).format("YYYY-MM-DD"),
        sales_year: sId.estimate_year || currentYear || "",
        sales_item_type: sId.estimate_item_type || "Granites",
        sales_customer: sId.estimate_customer || "",
        sales_address: sId.estimate_address || "",
        sales_mobile: sId.estimate_mobile || "",
        sales_other: formatToInteger(sId.estimate_other),
        sales_tempo: formatToInteger(sId.estimate_tempo),
        sales_tax: formatToInteger(sId.estimate_tax),
        sales_gross: formatToInteger(sId.estimate_gross),
        sales_loading: formatToInteger(sId.estimate_loading),
        sales_unloading: formatToInteger(sId.estimate_unloading),
        sales_advance: formatToInteger(sId.estimate_advance),
        sales_balance: formatToInteger(sId.estimate_balance),
      };
      form.reset(formValues);

      if (sSub && sSub.length > 0) {
        const mappedData = sSub.map((sub) => ({
          id: sub.id || "",
          estimate_sub_type: sub.estimate_sub_type || "",
          estimate_sub_item: sub.estimate_sub_item || "",
          estimate_sub_qnty: sub.estimate_sub_qnty?.toString() || "",
          estimate_sub_qnty_sqr: sub.estimate_sub_qnty_sqr?.toString() || "",
          estimate_sub_rate: formatToInteger(sub.estimate_sub_rate),
          estimate_sub_amount: formatToInteger(sub.estimate_sub_amount),
          sales_sub_item_original: sub.estimate_sub_item || "",
        }));
        setItemEntries(mappedData);
      }
      setIsInitialLoading(false);
    }
  }, [salesEstimateId, currentYear]);

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "estimate_sub_qnty_sqr" || field === "estimate_sub_rate") &&
      updatedEntries[index].estimate_sub_qnty_sqr &&
      updatedEntries[index].estimate_sub_rate
    ) {
      updatedEntries[index].estimate_sub_amount = Math.round(
        parseFloat(updatedEntries[index].estimate_sub_qnty_sqr || 0) *
          parseFloat(updatedEntries[index].estimate_sub_rate || 0)
      ).toString();
      setItemEntries([...updatedEntries]);
    }

    const itemsTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.estimate_sub_amount || 0),
      0
    );
    const chargesTotal =
      parseFloat(form.watch("sales_tax") || 0) +
      parseFloat(form.watch("sales_tempo") || 0) +
      parseFloat(form.watch("sales_loading") || 0) +
      parseFloat(form.watch("sales_unloading") || 0) +
      parseFloat(form.watch("sales_other") || 0);

    const newGross = Math.round(itemsTotal + chargesTotal);
    form.setValue("sales_gross", newGross.toString());

    const newBalance = Math.round(newGross - parseFloat(form.watch("sales_advance") || 0));
    form.setValue("sales_balance", newBalance.toString());
  };

  const handleChargeChange = (field, value) => {
    form.setValue(field, value);

    const itemsTotal = itemEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.estimate_sub_amount || 0),
      0
    );
    const chargesTotal =
      parseFloat(form.watch("sales_tax") || 0) +
      parseFloat(form.watch("sales_tempo") || 0) +
      parseFloat(form.watch("sales_loading") || 0) +
      parseFloat(form.watch("sales_unloading") || 0) +
      parseFloat(form.watch("sales_other") || 0);

    const newGross = Math.round(itemsTotal + chargesTotal);
    form.setValue("sales_gross", newGross.toString());

    const newBalance = Math.round(newGross - parseFloat(form.watch("sales_advance") || 0));
    form.setValue("sales_balance", newBalance.toString());
  };

  const handleAdvanceChange = (value) => {
    form.setValue("sales_advance", value);
    const newBalance = Math.round(
      parseFloat(form.watch("sales_gross") || 0) - parseFloat(value || 0)
    );
    form.setValue("sales_balance", newBalance.toString());
  };

  const addItemEntry = () => {
    setItemEntries([
      ...itemEntries,
      {
        estimate_sub_type: "",
        estimate_sub_item: "",
        estimate_sub_qnty: "",
        estimate_sub_qnty_sqr: "",
        estimate_sub_rate: "",
        estimate_sub_amount: "",
        sales_sub_item_original: "",
      },
    ]);
  };

  const removeItemEntry = (index) => {
    const updatedEntries = [...itemEntries];
    updatedEntries.splice(index, 1);
    setItemEntries(updatedEntries);

    const itemsTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.estimate_sub_amount || 0),
      0
    );
    const chargesTotal =
      parseFloat(form.watch("sales_tax") || 0) +
      parseFloat(form.watch("sales_tempo") || 0) +
      parseFloat(form.watch("sales_loading") || 0) +
      parseFloat(form.watch("sales_unloading") || 0) +
      parseFloat(form.watch("sales_other") || 0);

    const newGross = Math.round(itemsTotal + chargesTotal);
    form.setValue("sales_gross", newGross.toString());

    const newBalance = Math.round(newGross - parseFloat(form.watch("sales_advance") || 0));
    form.setValue("sales_balance", newBalance.toString());
  };

  const validateForm = (data) => {
    const formErrors = {
      date: !data.sales_date ? "Date is required" : "",
      customer: !data.sales_customer ? "Customer name is required" : "",
      itemType: !data.sales_item_type ? "Item type is required" : "",
    };

    const itemErrors = itemEntries.map((entry) => ({
      type: !entry.estimate_sub_type ? "required" : "",
      originalItem: !entry.sales_sub_item_original ? "required" : "",
      item: !entry.estimate_sub_item ? "required" : "",
      qnty: !entry.estimate_sub_qnty
        ? "required"
        : isNaN(entry.estimate_sub_qnty)
        ? "Quantity must be a number"
        : "",
      qntySqr: !entry.estimate_sub_qnty_sqr
        ? "required"
        : isNaN(entry.estimate_sub_qnty_sqr)
        ? "Quantity (sqr) must be a number"
        : "",
      rate: !entry.estimate_sub_rate
        ? "required"
        : isNaN(entry.estimate_sub_rate)
        ? "Rate must be a number"
        : "",
    }));

    const hasFormErrors = Object.values(formErrors).some((err) => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.type || err.item || err.qnty || err.qntySqr || err.rate || err.originalItem
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
                        Type
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
                        (error.type || error.item || error.qnty || error.qntySqr || error.rate) && (
                          <tr key={i} className="bg-white hover:bg-gray-50">
                            <td className="px-1.5 py-1.5 text-center text-gray-600 border-b border-gray-200 font-medium">
                              {i + 1}
                            </td>
                            <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200 break-all">
                              {error.type}
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
      const payload = {
        ...data,
        sales_year: currentYear || "",
        sales_no_of_count: itemEntries.length,
        sales_sub_data: itemEntries.map((e) => ({
          ...e,
          sales_sub_pcs: e.estimate_sub_qnty || "0",
          sales_sub_item: e.estimate_sub_item || "",
          sales_sub_qnty: e.estimate_sub_qnty || "0",
          sales_sub_qnty_sqr: e.estimate_sub_qnty_sqr || "0",
          sales_sub_rate: e.estimate_sub_rate || "0",
          sales_sub_amount: e.estimate_sub_amount || "0",
        })),
        sales_estimate_ref: id,
      };

      await createSalesMutation.mutateAsync(payload);
      navigate("/sales");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create sales from estimate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/estimate");
  };

  if (isEstimateLoading || isInitialLoading) {
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
    handleAdvanceChange,
    handleCancel,
    handleFormSubmit,
    productTypeGroup,
    productOptions,
    typeOptions,
    handleKeyDown,
    refetchProducts,
    isLoadingItems,
    isSubmitting,
  };

  return (
    <Page>
      <MobileEstimateSalesForm {...commonProps} />
      <DesktopEstimateSalesForm {...commonProps} />
    </Page>
  );
};

export default EstimateSalesAddPage;
