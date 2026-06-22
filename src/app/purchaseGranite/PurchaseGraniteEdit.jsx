import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import NotInListIcon from "@/components/common/NotInListIcon";

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
import Loader from "@/components/loader/Loader";
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

const PurchaseGraniteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [loadingType, setLoadingType] = useState("Loading Only");
  const [gstEdited, setGstEdited] = useState(false);
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
      id: "",
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
    setIsCustomItem((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const {
    data: purchaseByid,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchaseByid", id],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-purchase-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: product = [], refetch: refetchProducts } = useQuery({
    queryKey: ["product"],
    queryFn: async () => {
      setIsLoadingItems(true);
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-type-group-new`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsLoadingItems(false);
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

  useEffect(() => {
    if (purchaseByid) {
      const { purchase: pId, purchaseSub: pSub } = purchaseByid;

      const formatToInteger = (val) => {
        if (val === undefined || val === null || val === "") return "";
        const parsed = parseFloat(val);
        return isNaN(parsed) ? "" : Math.round(parsed).toString();
      };

      const savedGross = parseFloat(
        pId.purchase_gross || pId.purchase_amount || 0,
      );
      const savedTempAmount = parseFloat(
        pId.purchase_temp_amount ||
          pId.purchase_gross ||
          pId.purchase_amount ||
          0,
      );
      const savedRoundOff =
        pId.purchase_amount_round !== undefined &&
        pId.purchase_amount_round !== null
          ? Math.round(parseFloat(pId.purchase_amount_round))
          : Math.round(savedGross - savedTempAmount);

      const formValues = {
        purchase_date: moment(pId.purchase_date).format("YYYY-MM-DD"),
        purchase_year: pId.purchase_year || currentYear,
        purchase_type: pId.purchase_type || "",
        purchase_item_type: pId.purchase_item_type || "",
        purchase_supplier: pId.purchase_supplier || "",
        purchase_bill_no: pId.purchase_bill_no || "",
        purchase_amount: formatToInteger(pId.purchase_amount),
        purchase_other: formatToInteger(pId.purchase_other),
        purchase_other1: formatToInteger(pId.purchase_other1),
        purchase_other_label: pId.purchase_other_label || "",
        purchase_other1_label: pId.purchase_other1_label || "",
        purchase_amount_round:
          savedRoundOff === 0 ? "0" : savedRoundOff.toString(),
        purchase_tempo: formatToInteger(pId.purchase_tempo),
        purchase_loading: formatToInteger(pId.purchase_loading),
        purchase_unloading: formatToInteger(pId.purchase_unloading),
        purchase_tax: formatToInteger(pId.purchase_tax),
        purchase_gross: formatToInteger(pId.purchase_gross),
        purchase_advance: formatToInteger(pId.purchase_advance) || "0",
        purchase_balance: formatToInteger(pId.purchase_balance),
        purchase_amount_received: formatToInteger(pId.purchase_amount_received),
        purchase_temp_amount: formatToInteger(savedTempAmount),
        purchase_estimate_ref: pId.purchase_estimate_ref || "",
        purchase_no_of_count: pId.purchase_no_of_count?.toString() || "1",
      };

      if (pId.purchase_unloading && parseFloat(pId.purchase_unloading) > 0) {
        setLoadingType("Loading & Unloading");
      } else {
        setLoadingType("Loading Only");
      }

      if (pId.purchase_tax && parseFloat(pId.purchase_tax) > 0) {
        setGstEdited(true);
      }

      form.reset(formValues);

      if (pSub && pSub.length > 0) {
        const mappedData = pSub.map((sub) => ({
          id: sub.id || "",
          purchase_sub_item: sub.purchase_sub_item || "",
          purchase_sub_qnty: sub.purchase_sub_qnty?.toString() || "",
          purchase_sub_qnty_sqr: sub.purchase_sub_qnty_sqr?.toString() || "",
          purchase_sub_rate: formatToInteger(sub.purchase_sub_rate),
          purchase_sub_amount: formatToInteger(sub.purchase_sub_amount),
        }));
        setItemEntries(mappedData);
        setTimeout(() => {
          calculateAndSetTotals(mappedData);
        }, 100);
      }
      setIsInitialLoading(false);
    }
  }, [purchaseByid]);

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
    if (!skipGst && !gstEdited) {
      const gstAmount = grandTotal * 0.18;
      form.setValue("purchase_tax", gstAmount.toFixed(2));
    }
    const currentGst = parseFloat(form.getValues("purchase_tax") || 0);
    const unroundedNetTotal = grandTotal + currentGst;
    const roundedNetTotal = Math.ceil(unroundedNetTotal);
    const roundOff = roundedNetTotal - unroundedNetTotal;

    form.setValue("purchase_temp_amount", roundedNetTotal.toString());
    form.setValue("purchase_amount_round", roundOff.toFixed(2));
    form.setValue("purchase_gross", roundedNetTotal.toString());
    form.setValue("purchase_balance", roundedNetTotal.toString());
    form.setValue("purchase_advance", "0");
  };

  useEffect(() => {
    if (!gstEdited) {
      calculateAndSetTotals(itemEntries);
    }
  }, [gstEdited]);
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

  const watchTempAmount = parseFloat(form.watch("purchase_temp_amount") || 0);
  const displayFinalTotal = watchTempAmount;

  const watchTempAmountInput = form.watch("purchase_temp_amount");

  useEffect(() => {
    if (watchTempAmountInput !== undefined && watchTempAmountInput !== "") {
      const tempAmount = parseFloat(watchTempAmountInput || 0);
      const sumOfAmount = displayGrandTotal + displayGst;
      const roundOff = tempAmount - sumOfAmount;
      if (form.getValues("purchase_amount_round") !== roundOff.toFixed(2)) {
        form.setValue("purchase_amount_round", roundOff.toFixed(2));
      }
    }
  }, [watchTempAmountInput, displayGrandTotal, displayGst]);

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

  const removeItemEntry = (index) => {
    const entry = itemEntries[index];
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

    if (entry.id) {
      const token = Cookies.get("token");
      axios
        .delete(`${BASE_URL}/api/web-delete-purchase-sub/${entry.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((error) => {
          toast({
            title: "Error",
            description:
              error.response?.data?.message || "Failed to delete item",
            variant: "destructive",
          });
        });
    }

    calculateAndSetTotals(updatedEntries);
  };

  const addItemEntry = () => {
    const newEntry = {
      purchase_sub_item: "",
      purchase_sub_qnty: "",
      purchase_sub_qnty_sqr: "",
      purchase_sub_rate: "",
      purchase_sub_amount: "",
    };
    const updated = [...itemEntries, newEntry];
    setItemEntries(updated);
    calculateAndSetTotals(updated);
  };

  const updatePurchaseMutation = useMutation({
    mutationFn: async (payload) => {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/web-update-purchase/${id}`,
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
        description: error.response?.data?.message || "Failed to Update",
        variant: "destructive",
      });
    },
  });

  const validateForm = (data) => {
    const formErrors = {
      date: !data.purchase_date ? "Date is required" : "",
      supplier: !data.purchase_supplier ? "Supplier is required" : "",
      billNo: !data.purchase_bill_no ? "Bill number is required" : "",
      otherAmount: !data.purchase_other ? "Other Amount is required" : "",
      totalAmount: !data.purchase_amount ? "Total Amount is required" : "",
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
      (err) => err.item || err.qnty || err.qntySqr || err.rate,
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
      const tempAmount = parseFloat(
        form.watch("purchase_temp_amount") || grandTotal + gstAmount,
      );
      const roundOff = parseFloat(form.watch("purchase_amount_round") || 0);
      const finalTotal = tempAmount;

      const payload = {
        ...restData,
        purchase_tempo: tempo.toString(),
        purchase_loading: loading.toString(),
        purchase_unloading: unloading.toString(),
        purchase_other: other.toString(),
        purchase_other1: other1.toString(),
        purchase_tax: gstAmount.toString(),
        purchase_temp_amount: tempAmount.toString(),
        purchase_gross: finalTotal.toString(),
        purchase_balance: finalTotal.toString(),
        purchase_amount_round: roundOff.toString(),
        purchase_advance: "0",
        purchase_amount_received: restData.purchase_amount_received || "0",
        purchase_amount: finalTotal.toString(),
        purchase_year: currentYear,
        purchase_no_of_count: formattedItemEntries.length,
        purchase_sub_data: formattedItemEntries,
      };

      await updatePurchaseMutation.mutateAsync(payload);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to Update",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/purchase");
  };

  if (isFetching) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Purchase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

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
                <h1 className="text-base font-bold">Edit Purchase </h1>
              </button>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-md p-2">
              <p className="text-xs text-green-800 font-medium">
                Amount to be Paid
              </p>
              <p className="text-sm font-bold text-green-900">
                {displayFinalTotal || 0}
              </p>
            </div>
          </div>

          <div className="mb-14">
            <form onSubmit={handleFormSubmit} className="space-y-4">
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
                      placeholder="Enter JFC Bill Number"
                      maxLength={10}
                    />
                  </div>
                  {/* <div>
                    <Label htmlFor="purchase_item_type">
                      Item Type <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <SelectShadcn
                      id="purchase_item_type"
                      value={form.watch("purchase_item_type")}
                      onValueChange={(value) => {
                        form.setValue("purchase_item_type", value);
                        refetchProducts();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select item type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Item Types</SelectLabel>
                          {productTypeGroup.map((type) => (
                            <SelectItem
                              key={type.product_type_group}
                              value={type.product_type_group}
                            >
                              {type.product_type_group}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </SelectShadcn>
                  </div> */}
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
                                {isLoadingItems ? (
                                  <div className="h-9 bg-gray-200 rounded animate-pulse w-[4rem]"></div>
                                ) : (
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
                                )}
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
                          <Minus className="h-3 w-3" />
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
                    <Label>
                      Tax (GST 18% = {Number(displayGst).toFixed(2)})
                    </Label>
                  </div>
                  <Input
                    type="tel"
                    value={Number(displayGst).toFixed(2)}
                    disabled
                    className="mt-1 text-right bg-gray-100 font-medium"
                    maxLength={10}
                    placeholder="0"
                  />
                </div>

                {/* Net Total */}
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

                {/* Round Off */}
                <div>
                  <Label>Round Off</Label>
                  <Input
                    type="text"
                    {...form.register("purchase_amount_round")}
                    disabled
                    className="mt-1 text-right font-medium bg-gray-100"
                    maxLength={10}
                    placeholder="0"
                  />
                </div>

                {/* Amount to be Paid */}
                <div>
                  <Label className="font-semibold text-blue-900">
                    Amount to be Paid
                  </Label>
                  <Input
                    type="text"
                    value={Number(displayFinalTotal).toFixed(0)}
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
                  {isSubmitting ? "Updating..." : "Update"}
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
                  <CardTitle>Edit Purchase </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form
                id="purchase-edit-form"
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
                  {/* <div className="space-y-2">
                    <Label htmlFor="purchase_item_type">
                      Item Type <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <SelectShadcn
                      id="purchase_item_type"
                      value={form.watch("purchase_item_type")}
                      onValueChange={(value) => {
                        form.setValue("purchase_item_type", value);
                        refetchProducts();
                      }}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select item type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Item Types</SelectLabel>
                          {productTypeGroup.map((type) => (
                            <SelectItem
                              key={type.product_type_group}
                              value={type.product_type_group}
                            >
                              {type.product_type_group}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </SelectShadcn>
                  </div> */}
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
                            Qnty (pcs/box){" "}
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
                              {isLoadingItems ? (
                                <div className="h-9 bg-gray-200 rounded animate-pulse w-[8rem]"></div>
                              ) : (
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
                              )}
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
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "purchase_sub_amount",
                                    e.target.value,
                                  )
                                }
                                className="h-9 text-right"
                                placeholder="0"
                                onKeyDown={handleKeyDown}
                                maxLength={10}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div></div>
                    <div className="space-y-2">
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

                      {/* GST Amount */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">
                          Tax (GST 18% = {Number(displayGst).toFixed(2)})
                        </Label>
                        <Input
                          className="w-[150px] text-right bg-gray-100 font-medium shrink-0"
                          type="tel"
                          value={Number(displayGst).toFixed(2)}
                          disabled
                          placeholder="0"
                        />
                      </div>

                      {/* Net Total */}
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

                      {/* Round Off */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Round Off</Label>
                        <Input
                          className="w-[150px] text-right font-medium bg-gray-100 shrink-0"
                          type="text"
                          {...form.register("purchase_amount_round")}
                          disabled
                          placeholder="0"
                        />
                      </div>

                      {/* Amount to be Paid */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-semibold text-blue-900">
                          Amount to be Paid
                        </Label>
                        <Input
                          className="w-[150px] bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md shrink-0"
                          type="text"
                          value={Number(displayFinalTotal).toFixed(0)}
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
                    onClick={() => {
                      const formElement =
                        document.getElementById("purchase-edit-form");
                      if (formElement) {
                        formElement.requestSubmit();
                      }
                    }}
                    className="border-gray-300 hover:bg-blue-500 text-white bg-blue-600"
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

export default PurchaseGraniteEdit;
