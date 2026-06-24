import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import Page from "../dashboard/page";
import Loader from "@/components/loader/Loader";
import Cookies from "js-cookie";
import useNumericInput from "@/hooks/useNumericInput";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const formSchema = z.object({
  sales_date: z.string(),
  sales_year: z.string(),
  sales_customer: z.string(),
  sales_address: z.string(),
  sales_mobile: z.string(),
  sales_item_type: z.string(),
  sales_no: z.string(),
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

const SalesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
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
      sales_date: moment().format("YYYY-MM-DD"),
      sales_year: currentYear,
      sales_customer: "",
      sales_address: "",
      sales_mobile: "",
      sales_item_type: "",
      sales_no: "",
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
  const [loadingType, setLoadingType] = useState("Loading Only");
  const [customItems, setCustomItems] = useState({});
  const [isCustomItem, setIsCustomItem] = useState({});

  const handleCustomItemChange = (index, value) => {
    setCustomItems((prev) => ({ ...prev, [index]: value }));
  };

  const handleToggleCustomItem = (index) => {
    const isCurrentlyCustom = isCustomItem[index];

    if (isCurrentlyCustom) {
      // Switching from custom mode back to select dropdown
      // Clear the custom input so it's not submitted or validated
      setCustomItems((prev) => ({ ...prev, [index]: "" }));
    } else {
      // Switching from select dropdown to custom mode
      // Prefill the custom input with the selected item name so it's not lost
      const selectedItem = itemEntries[index]?.sales_sub_item || "";
      setCustomItems((prev) => ({ ...prev, [index]: selectedItem }));
    }

    // Toggle the flag
    setIsCustomItem((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const {
    data: salesId,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["salesId", id],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-sales-by-id/${id}`,
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

  // -------- Load existing data ----------
  useEffect(() => {
    if (salesId?.sales && salesId?.salesSub) {
      setIsInitialLoading(true);

      const { sales, salesSub } = salesId;

      const formatToInteger = (val) => {
        if (val === undefined || val === null || val === "") return "";
        const parsed = parseFloat(val);
        return isNaN(parsed) ? "" : Math.round(parsed).toString();
      };

      const savedGross = parseFloat(sales.sales_gross || 0);
      const savedTempAmount = parseFloat(
        sales.sales_temp_amount || sales.sales_gross || 0,
      );
      const savedRoundOff =
        sales.sales_amount_round !== undefined &&
        sales.sales_amount_round !== null
          ? Math.round(parseFloat(sales.sales_amount_round))
          : Math.round(savedGross - savedTempAmount);

      form.reset({
        sales_date: moment(sales.sales_date).format("YYYY-MM-DD"),
        sales_year: sales.sales_year || currentYear,
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
          sales_sub_qnty: sub.sales_sub_pcs?.toString() || "",
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
  }, [salesId, form, currentYear]);

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


  // -------- Calculate totals (unchanged net total, round‑off subtracts) ----------
  const calculateAndSetTotals = (entries, skipGst = false) => {
    const itemsTotal = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.sales_sub_amount || 0),
      0,
    );
    const tempo = parseFloat(form.getValues("sales_tempo") || 0);
    const loading = parseFloat(form.getValues("sales_loading") || 0);
    const unloading = parseFloat(form.getValues("sales_unloading") || 0);
    const other = parseFloat(form.getValues("sales_other") || 0);
    const other1 = parseFloat(form.getValues("sales_other1") || 0);

    const grandTotal =
      itemsTotal + tempo + loading + unloading + other + other1;

    // Always compute auto GST at 18% for reference display
    const autoGst = grandTotal * 0.18;
    setAutoGst18(autoGst);

    const currentGst = parseFloat(form.getValues("sales_tax") || 0);
    const netTotal = grandTotal + currentGst;

    // Net total (sales_temp_amount) is always the sum, never modified by round-off
    form.setValue("sales_temp_amount", netTotal.toFixed(2));

    // Compute final payable amount = netTotal - roundOff
    const roundOff = parseFloat(form.getValues("sales_amount_round") || 0);
    const finalAmount = netTotal - roundOff;

    form.setValue("sales_gross", finalAmount.toString());
    form.setValue("sales_balance", finalAmount.toString());
    form.setValue("sales_advance", "0");
  };

  // -------- Remove the previous auto‑roundoff useEffect (deleted) ----------

  // -------- Watched values for display ----------
  const itemsTotal = itemEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.sales_sub_amount || 0),
    0,
  );
  const watchTempo = parseFloat(form.watch("sales_tempo") || 0);
  const watchLoading = parseFloat(form.watch("sales_loading") || 0);
  const watchUnloading = parseFloat(form.watch("sales_unloading") || 0);
  const watchOther = parseFloat(form.watch("sales_other") || 0);
  const watchOther1 = parseFloat(form.watch("sales_other1") || 0);

  const displayGrandTotal =
    itemsTotal +
    watchTempo +
    watchLoading +
    watchUnloading +
    watchOther +
    watchOther1;
  const displayGst = parseFloat(form.watch("sales_tax") || 0);
  const displayNetTotal = displayGrandTotal + displayGst;

  const roundOff = parseFloat(form.watch("sales_amount_round") || 0);
  const amountToBeCollected = displayNetTotal - roundOff;

  // -------- Handlers ----------
  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "sales_sub_qnty_sqr" || field === "sales_sub_rate") &&
      updatedEntries[index].sales_sub_qnty_sqr !== "" &&
      updatedEntries[index].sales_sub_qnty_sqr != null &&
      updatedEntries[index].sales_sub_rate !== "" &&
      updatedEntries[index].sales_sub_rate != null
    ) {
      updatedEntries[index].sales_sub_amount = Math.round(
        parseFloat(updatedEntries[index].sales_sub_qnty_sqr || 0) *
          parseFloat(updatedEntries[index].sales_sub_rate || 0),
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

  // Round‑off handler: only updates the round‑off value and recomputes final amount
  const handleRoundOffChange = (e) => {
    const value = e.target.value;
    const roundOffVal = parseFloat(value) || 0;
    form.setValue("sales_amount_round", roundOffVal);
    setRoundOffEdited(true);

    // Recompute final amounts without changing net total
    const netTotal = parseFloat(form.getValues("sales_temp_amount") || 0);
    const finalAmount = netTotal - roundOffVal;
    form.setValue("sales_gross", finalAmount.toString());
    form.setValue("sales_balance", finalAmount.toString());
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
        .delete(`${BASE_URL}/api/web-delete-sales-sub/${entry.id}`, {
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
      sales_sub_type: "",
      sales_sub_item: "",
      sales_sub_qnty: "",
      sales_sub_qnty_sqr: "",
      sales_sub_rate: "",
      sales_sub_amount: "",
      sales_sub_item_original: "",
    };
    const updated = [...itemEntries, newEntry];
    setItemEntries(updated);
    calculateAndSetTotals(updated);
  };

  // -------- Update mutation ----------
  const updateSalesMutation = useMutation({
    mutationFn: async (payload) => {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/web-update-sales-direct/${id}`,
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
      navigate("/sales");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update sales",
        variant: "destructive",
      });
    },
  });

  // -------- Validation ----------
  const validateForm = (data) => {
    const formErrors = {
      date: !data.sales_date ? "Date is required" : "",
      customer: !data.sales_customer ? "Customer name is required" : "",
      itemType: !data.sales_item_type ? "Item type is required" : "",
    };

    const itemErrors = itemEntries.map((entry, index) => ({
      item:
        isCustomItem[index]
          ? (!customItems[index] ? "required" : "")
          : (!entry.sales_sub_item ? "required" : ""),
      qnty:
        entry.sales_sub_qnty !== "" &&
        entry.sales_sub_qnty != null &&
        isNaN(entry.sales_sub_qnty)
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
      (err) =>
        err.type ||
        err.item ||
        err.qnty ||
        err.qntySqr ||
        err.rate ||
        err.originalItem,
    );

    return { formErrors, itemErrors, hasFormErrors, hasItemErrors };
  };

  // -------- Submit ----------
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
                      {formErrors.address && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Address
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.address}
                          </td>
                        </tr>
                      )}
                      {formErrors.mobile && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Mobile
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {formErrors.mobile}
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
                          Type
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Item
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Original Item
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Qty
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Qty (sqr)
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemErrors.map(
                        (error, i) =>
                          (error.type ||
                            error.item ||
                            error.originalItem ||
                            error.qnty ||
                            error.qntySqr ||
                            error.rate) && (
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
      const { sales_amount_round, ...restData } = data;
      const formattedItemEntries = itemEntries.map((entry, index) => ({
        ...entry,
        sales_sub_pcs: entry.sales_sub_qnty,
        sales_sub_item: isCustomItem[index]
          ? customItems[index]
          : entry.sales_sub_item,
      }));

      const itemsTotal = itemEntries.reduce(
        (sum, entry) => sum + parseFloat(entry.sales_sub_amount || 0),
        0,
      );
      const tempo = parseFloat(form.watch("sales_tempo") || 0);
      const loading = parseFloat(form.watch("sales_loading") || 0);
      const unloading = parseFloat(form.watch("sales_unloading") || 0);
      const other = parseFloat(form.watch("sales_other") || 0);
      const other1 = parseFloat(form.watch("sales_other1") || 0);

      const grandTotal =
        itemsTotal + tempo + loading + unloading + other + other1;
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
        sales_temp_amount: netTotal.toString(), // unchanged net total
        sales_gross: restData.sales_amount_received || "0", // reduced by round-off
        sales_balance: finalAmount.toString(),
        sales_amount_round: roundOff.toString(),
        sales_advance: "0",
        sales_amount_received: restData.sales_amount_received || "0",
        sales_no: restData.sales_no,
        sales_year: currentYear,
        sales_no_of_count: formattedItemEntries.length,
        sales_sub_data: formattedItemEntries,
      };

      updateSalesMutation.mutate(payload);
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

  // -------- Render ----------
  if (isFetching || isInitialLoading) {
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
              Error Fetching Sales
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
        {/* ====== MOBILE VIEW ====== */}
        <div className="sm:hidden">
          <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-2 mb-2">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={handleCancel}
                className="flex items-center text-blue-800"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <h1 className="text-base font-bold">Edit Sales</h1>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 border border-green-100 rounded-md p-2">
                <p className="text-xs text-green-800 font-medium">Gross</p>
                <p className="text-sm font-bold">
                  {form.watch("sales_gross") || 0}
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-md p-2">
                <p className="text-xs text-red-800 font-medium">Balance</p>
                <p className="text-sm font-bold">
                  {form.watch("sales_balance") || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-14">
            <form
              id="purchase-edit-form"
              onSubmit={handleFormSubmit}
              className="space-y-4"
            >
              {/* Customer Info */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="sales_no">JFC Bill No</Label>
                    <Input
                      id="sales_no"
                      {...form.register("sales_no")}
                      className="mt-1 placeholder:normal-case"
                      placeholder="Enter Bill Number"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_date">Date</Label>
                    <Input
                      id="sales_date"
                      type="date"
                      {...form.register("sales_date")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_customer">Customer Name</Label>
                    <Input
                      id="sales_customer"
                      {...form.register("sales_customer")}
                      className="mt-1 placeholder:normal-case"
                      placeholder="Enter Customer Name"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_mobile">Mobile No</Label>
                    <Input
                      id="sales_mobile"
                      {...form.register("sales_mobile")}
                      className="mt-1 placeholder:normal-case"
                      placeholder="Enter Mobile Number"
                      maxLength={10}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_address">Address</Label>
                    <Textarea
                      id="sales_address"
                      {...form.register("sales_address")}
                      className="mt-1 placeholder:normal-case"
                      placeholder="Enter Address"
                      maxLength={200}
                      rows={2}
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
                                  className="h-8 text-sm uppercase"
                                  placeholder="Enter item name"
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
                              <div className="flex-1 min-w-0">
                                <MemoizedProductSelect
                                  value={entry.sales_sub_item}
                                  onChange={(value) =>
                                    handleItemChange(
                                      index,
                                      "sales_sub_item",
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
                              value={entry.sales_sub_qnty}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "sales_sub_qnty",
                                  e.target.value,
                                )
                              }
                              maxLength={10}
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm text-right"
                              placeholder="Qnty (pcs)"
                            />
                          </div>
                          <div>
                            <Input
                              type="tel"
                              value={entry.sales_sub_qnty_sqr}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "sales_sub_qnty_sqr",
                                  e.target.value,
                                )
                              }
                              maxLength={10}
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm text-right"
                              placeholder="Qnty (sqr)"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 mt-1 gap-1">
                          <div>
                            <Input
                              type="tel"
                              value={entry.sales_sub_rate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "sales_sub_rate",
                                  e.target.value,
                                )
                              }
                              maxLength={10}
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm text-right"
                              placeholder="Rate"
                            />
                          </div>
                          <div>
                            <Input
                              type="tel"
                              value={entry.sales_sub_amount}
                              disabled
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm bg-gray-100 text-right"
                              placeholder="Amount"
                            />
                          </div>
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
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-xs h-8 mt-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Charges and Totals */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-medium">Charges & Totals</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Labour Charges</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <SelectShadcn
                        value={loadingType}
                        onValueChange={(val) => {
                          setLoadingType(val);
                          if (val === "Loading Only") {
                            form.setValue("sales_unloading", "");
                          } else {
                            form.setValue("sales_loading", "");
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
                            ? "sales_loading"
                            : "sales_unloading"
                        }
                        type="tel"
                        value={
                          form.watch(
                            loadingType === "Loading Only"
                              ? "sales_loading"
                              : "sales_unloading",
                          ) || ""
                        }
                        onChange={(e) => {
                          handleChargeChange(
                            loadingType === "Loading Only"
                              ? "sales_loading"
                              : "sales_unloading",
                            e.target.value,
                          );
                        }}
                        maxLength={10}
                        onKeyDown={handleKeyDown}
                        className="text-right"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sales_tempo">Tempo Charges</Label>
                    <Input
                      id="sales_tempo"
                      type="tel"
                      {...form.register("sales_tempo")}
                      onChange={(e) =>
                        handleChargeChange("sales_tempo", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1 text-right"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Other Charges 1</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        placeholder="Custom label 1"
                        {...form.register("sales_other_label")}
                      />
                      <Input
                        id="sales_other"
                        type="tel"
                        {...form.register("sales_other")}
                        onChange={(e) =>
                          handleChargeChange("sales_other", e.target.value)
                        }
                        maxLength={10}
                        onKeyDown={handleKeyDown}
                        className="text-right"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Other Charges 2</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        placeholder="Custom label 2"
                        {...form.register("sales_other1_label")}
                      />
                      <Input
                        id="sales_other1"
                        type="tel"
                        {...form.register("sales_other1")}
                        onChange={(e) =>
                          handleChargeChange("sales_other1", e.target.value)
                        }
                        maxLength={10}
                        onKeyDown={handleKeyDown}
                        className="text-right"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Gross Total</Label>
                    <Input
                      type="text"
                      value={Number(displayGrandTotal).toFixed(0)}
                      disabled
                      className="mt-1 bg-gray-100 font-medium text-right"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">
                      Auto GST @ 18% = {Number(autoGst18).toFixed(2)}
                    </Label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>
                        Tax (GST 18% = {Number(autoGst18).toFixed(2)})
                      </Label>
                    </div>
                    <Input
                      type="tel"
                      {...form.register("sales_tax")}
                      onChange={handleTaxChange}
                      className="mt-1 text-right"
                      maxLength={10}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Net Total</Label>
                    <Input
                      type="tel"
                      {...form.register("sales_temp_amount")}
                      onKeyDown={handleKeyDown}
                      className="mt-1 text-right font-medium"
                      maxLength={10}
                      placeholder="0"
                    />
                  </div>

                  {/* Round Off - now editable */}
                  <div>
                    <Label>Round Off</Label>
                    <Input
                      type="text"
                      {...form.register("sales_amount_round", {
                        onChange: handleRoundOffChange,
                      })}
                      className="mt-1 text-right font-medium bg-gray-100"
                      maxLength={10}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label className="font-semibold text-blue-900">
                      Amount to be Collected
                    </Label>
                    <Input
                      type="text"
                      value={Number(amountToBeCollected).toFixed(0)}
                      disabled
                      className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md"
                    />
                  </div>

                  <div>
                    <Label>Final Amount Received</Label>
                    <Input
                      type="tel"
                      {...form.register("sales_amount_received")}
                      onKeyDown={handleKeyDown}
                      className="mt-1 text-right"
                      maxLength={10}
                      placeholder="0"
                    />
                  </div>
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

        {/* ====== DESKTOP VIEW ====== */}
        <div className="hidden sm:block">
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
                  <CardTitle>Edit Sales</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form
                id="purchase-edit-form"
                onSubmit={handleFormSubmit}
                className="space-y-2"
              >
                {/* Customer Information */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="sales_no">
                      JFC Bill No
                      <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="sales_no"
                      {...form.register("sales_no")}
                      className="bg-white"
                      placeholder="Enter bill number"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_date">
                      Date <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="sales_date"
                      type="date"
                      {...form.register("sales_date")}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_customer">
                      Customer Name{" "}
                      <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="sales_customer"
                      {...form.register("sales_customer")}
                      className="bg-white"
                      placeholder="Enter customer name"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_mobile">Mobile No</Label>
                    <Input
                      id="sales_mobile"
                      {...form.register("sales_mobile")}
                      className="bg-white"
                      placeholder="Enter mobile number"
                      maxLength={10}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div className="space-y-2 col-span-full">
                    <Label htmlFor="sales_address">Address</Label>
                    <Textarea
                      id="sales_address"
                      {...form.register("sales_address")}
                      className="bg-white"
                      placeholder="Enter address"
                      maxLength={200}
                      rows={2}
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
                            Qnty (pcs)
                          </th>
                          <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                            Qnty (sqft)
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
                                <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
                              ) : (
                                <div className="flex gap-2 items-start">
                                  {isCustomItem[index] ? (
                                    <div className="flex-1 min-w-0 flex gap-2">
                                      <Input
                                        type="text"
                                        className="h-9 uppercase"
                                        placeholder="Enter item name"
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
                                          value={entry.sales_sub_item}
                                          onChange={(value) =>
                                            handleItemChange(
                                              index,
                                              "sales_sub_item",
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
                                value={entry.sales_sub_qnty}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "sales_sub_qnty",
                                    e.target.value,
                                  )
                                }
                                maxLength={10}
                                onKeyDown={handleKeyDown}
                                className="h-9 text-right"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.sales_sub_qnty_sqr}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "sales_sub_qnty_sqr",
                                    e.target.value,
                                  )
                                }
                                maxLength={10}
                                onKeyDown={handleKeyDown}
                                className="h-9 text-right"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.sales_sub_rate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "sales_sub_rate",
                                    e.target.value,
                                  )
                                }
                                maxLength={10}
                                onKeyDown={handleKeyDown}
                                className="h-9 text-right"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.sales_sub_amount}
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

                {/* Charges and Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div></div>
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="grid grid-cols-1 gap-2">
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
                                form.setValue("sales_unloading", "");
                              } else {
                                form.setValue("sales_loading", "");
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
                              ? "sales_loading"
                              : "sales_unloading"
                          }
                          type="tel"
                          value={
                            form.watch(
                              loadingType === "Loading Only"
                                ? "sales_loading"
                                : "sales_unloading",
                            ) || ""
                          }
                          onChange={(e) =>
                            handleChargeChange(
                              loadingType === "Loading Only"
                                ? "sales_loading"
                                : "sales_unloading",
                              e.target.value,
                            )
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="sales_tempo">Tempo Charges</Label>
                        <Input
                          className="w-[150px] text-right shrink-0"
                          id="sales_tempo"
                          type="tel"
                          {...form.register("sales_tempo")}
                          onChange={(e) =>
                            handleChargeChange("sales_tempo", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          placeholder="Other Label 1"
                          className="flex-1 h-9"
                          {...form.register("sales_other_label")}
                        />
                        <Input
                          className="w-[150px] h-9 text-right shrink-0"
                          id="sales_other"
                          type="tel"
                          {...form.register("sales_other")}
                          onChange={(e) =>
                            handleChargeChange("sales_other", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          placeholder="Other Label 2"
                          className="flex-1 h-9"
                          {...form.register("sales_other1_label")}
                        />
                        <Input
                          className="w-[150px] h-9 text-right shrink-0"
                          id="sales_other1"
                          type="tel"
                          {...form.register("sales_other1")}
                          onChange={(e) =>
                            handleChargeChange("sales_other1", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Gross Total</Label>
                        <Input
                          className="w-[150px] bg-gray-100 font-medium text-right shrink-0"
                          type="text"
                          value={Number(displayGrandTotal).toFixed(0)}
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Tax Amount</Label>
                        <Input
                          className="w-[150px] text-right shrink-0"
                          type="tel"
                          {...form.register("sales_tax")}
                          onChange={handleTaxChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 -mt-5">
                        <Label className="font-medium text-xs text-gray-500">
                          GST @ 18% = {Number(autoGst18).toFixed(2)}
                        </Label>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Net Total</Label>
                        <Input
                          className="w-[150px] text-right font-medium shrink-0"
                          type="tel"
                          {...form.register("sales_temp_amount")}
                          onKeyDown={handleKeyDown}
                          maxLength={10}
                          placeholder="0"
                        />
                      </div>

                      {/* Round Off - editable */}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">Round Off</Label>
                        <Input
                          className="w-[150px] text-right font-medium bg-gray-100 shrink-0"
                          type="text"
                          {...form.register("sales_amount_round", {
                            onChange: handleRoundOffChange,
                          })}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-semibold text-blue-900">
                          Amount to be Collected
                        </Label>
                        <Input
                          className="w-[150px] bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md shrink-0"
                          type="text"
                          value={Number(amountToBeCollected).toFixed(0)}
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-medium">
                          Final Amount Received
                        </Label>
                        <Input
                          className="w-[150px] text-right shrink-0"
                          type="tel"
                          {...form.register("sales_amount_received")}
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
                        document.getElementById("purchase-edit-form");
                      if (formElement) {
                        formElement.requestSubmit();
                      }
                    }}
                    className="border-gray-300 hover:bg-gray-50"
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

export default SalesEdit;
