import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
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
  JFCBILLNO: z.string(),
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
      JFCBILLNO: "",

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
  const [loadingType, setLoadingType] = useState("Loading");
  const [customItems, setCustomItems] = useState({});
  const [isCustomItem, setIsCustomItem] = useState({});

  const handleCustomItemChange = (index, value) => {
    setCustomItems((prev) => ({ ...prev, [index]: value }));
  };

  const handleToggleCustomItem = (index) => {
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

  useEffect(() => {
    if (salesId?.sales && salesId?.salesSub) {
      setIsInitialLoading(true);

      const { sales, salesSub } = salesId;

      form.reset({
        sales_date: moment(sales.sales_date).format("YYYY-MM-DD"),
        sales_year: sales.sales_year || currentYear,
        sales_item_type: sales.sales_item_type || "Granites",
        sales_customer: sales.sales_customer || "",
        sales_address: sales.sales_address || "",
        sales_mobile: sales.sales_mobile || "",
        JFCBILLNO: sales.JFCBILLNO || "",
        sales_other: sales.sales_other?.toString() || "",
        sales_other1: sales.sales_other1?.toString() || "",
        sales_other_label: sales.sales_other_label || "",
        sales_other1_label: sales.sales_other1_label || "",
        sales_tempo: sales.sales_tempo?.toString() || "",
        sales_tax: sales.sales_tax?.toString() || "",
        sales_gross: sales.sales_gross?.toString() || "",
        sales_loading: sales.sales_loading || "",
        sales_unloading: sales.sales_unloading || "",
        sales_advance: sales.sales_advance || "",
        sales_balance: sales.sales_balance || "",
        sales_no_of_count: sales.sales_no_of_count?.toString() || "1",
        sales_temp_amount: sales.sales_temp_amount?.toString() || "",
        sales_amount_received: sales.sales_amount_received?.toString() || "",
      });

      if (sales.sales_gst_percentage) {
        setGstEdited(true);
      }

      // setTimeout(() => {
      if (salesSub?.length > 0) {
        const mappedSub = salesSub.map((sub) => ({
          id: sub.id || "",
          sales_sub_type: sub.sales_sub_type || "",
          sales_sub_item: sub.sales_sub_item || "",
          sales_sub_qnty: sub.sales_sub_pcs?.toString() || "",
          sales_sub_qnty_sqr: sub.sales_sub_qnty_sqr?.toString() || "",
          sales_sub_rate: sub.sales_sub_rate?.toString() || "",
          sales_sub_amount: sub.sales_sub_amount?.toString() || "",
          sales_sub_item_original: sub.sales_sub_item_original || "",
        }));
        setItemEntries(mappedSub);
        setTimeout(() => {
          calculateAndSetTotals(mappedSub);
        }, 100);
      }
      setIsInitialLoading(false);
      // }, 100);
    }
  }, [salesId, form, currentYear]);

  const calculateAndSetTotals = (entries) => {
    const itemsTotal = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.sales_sub_amount || 0),
      0,
    );
    const tempo = parseFloat(form.watch("sales_tempo") || 0);
    const loading = parseFloat(form.watch("sales_loading") || 0);
    const unloading = parseFloat(form.watch("sales_unloading") || 0);
    const other = parseFloat(form.watch("sales_other") || 0);
    const other1 = parseFloat(form.watch("sales_other1") || 0);

    const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
    if (!gstEdited) {
      const gstAmount = parseFloat((grandTotal * 0.18).toFixed(2));
      form.setValue("sales_tax", gstAmount.toString());
    }
    const currentGst = parseFloat(form.watch("sales_tax") || 0);
    const finalTotal = parseFloat((grandTotal + currentGst).toFixed(2));

    form.setValue("sales_gross", finalTotal.toString());
    form.setValue("sales_balance", finalTotal.toString());
    form.setValue("sales_advance", "0");
  };

  useEffect(() => {
    if (!gstEdited) {
      calculateAndSetTotals(itemEntries);
    }
  }, [gstEdited]);

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "sales_sub_qnty_sqr" || field === "sales_sub_rate") &&
      updatedEntries[index].sales_sub_qnty_sqr &&
      updatedEntries[index].sales_sub_rate
    ) {
      updatedEntries[index].sales_sub_amount = (
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
  const validateForm = (data) => {
    const formErrors = {
      date: !data.sales_date ? "Date is required" : "",
      customer: !data.sales_customer ? "Customer name is required" : "",
      itemType: !data.sales_item_type ? "Item type is required" : "",
    };

    const itemErrors = itemEntries.map((entry, index) => ({
      item:
        !entry.sales_sub_item ||
        (isCustomItem[index] && !customItems[index])
          ? "required"
          : "",
      qnty: !entry.sales_sub_qnty
        ? "required"
        : isNaN(entry.sales_sub_qnty)
          ? "Quantity must be a number"
          : "",
      qntySqr: !entry.sales_sub_qnty_sqr
        ? "required"
        : isNaN(entry.sales_sub_qnty_sqr)
          ? "Quantity (sqr) must be a number"
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
      const formattedItemEntries = itemEntries.map((entry, index) => ({
        ...entry,
        sales_sub_pcs: entry.sales_sub_qnty,
        sales_sub_item:
          isCustomItem[index]
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

      const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
      const gstAmount = parseFloat(form.watch("sales_tax") || 0);
      const finalTotal = parseFloat((grandTotal + gstAmount).toFixed(2));

      const payload = {
        ...data,
        sales_tempo: tempo.toString(),
        sales_loading: loading.toString(),
        sales_unloading: unloading.toString(),
        sales_other: other.toString(),
        sales_other1: other1.toString(),
        sales_tax: gstAmount.toString(),
        sales_gross: finalTotal.toString(),
        sales_balance: finalTotal.toString(),
        sales_advance: "0",
        sales_amount_received: data.sales_amount_received,
        JFCBILLNO: data.JFCBILLNO,
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
    itemsTotal + watchTempo + watchLoading + watchUnloading + watchOther + watchOther1;
  const displayGst = parseFloat(form.watch("sales_tax") || 0);
  const displayFinalTotal = parseFloat(
    (displayGrandTotal + displayGst).toFixed(2),
  );

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
            <form id="purchase-edit-form" onSubmit={handleFormSubmit} className="space-y-4">
              {/* Customer Info */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="JFCBILLNO">JFC Bill No</Label>
                    <Input
                      id="JFCBILLNO"
                      {...form.register("JFCBILLNO")}
                      className="mt-1"
                      placeholder="Enter bill number"
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
                      className="mt-1"
                      placeholder="Enter customer name"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_mobile">Mobile No</Label>
                    <Input
                      id="sales_mobile"
                      {...form.register("sales_mobile")}
                      className="mt-1"
                      placeholder="Enter mobile number"
                      maxLength={10}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_address">Address</Label>
                    <Input
                      id="sales_address"
                      {...form.register("sales_address")}
                      className="mt-1"
                      placeholder="Enter address"
                      maxLength={200}
                    />
                  </div>
                  {/* <div>
                    <Label htmlFor="sales_item_type">Item Type</Label>

                    <SelectShadcn
                      id="sales_item_type"
                      value={form.watch("sales_item_type")}
                      onValueChange={(value) => {
                        form.setValue("sales_item_type", value);
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
                           handleItemChange(index, "sales_sub_item", value)
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
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                         <path d="M8.7 7.3a3 3 0 0 1 4.2 4.2L12 14l-1.3 1.3a1 1 0 0 1-1.4 0L9 13.4l-1.3 1.3a1 1 0 0 1-1.4-1.4L10.6 12 9.3 10.7a1 1 0 0 1 0-1.4Z"/>
                       </svg>
                     </Button>
                   </>
                 )}
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                          {/* <div>
                            {isLoadingItems || !product.length ? (
                              <div className="h-9 bg-gray-200 rounded animate-pulse w-[4rem]"></div>
                            ) : (
                              <SelectShadcn
                                value={entry.sales_sub_item_original}
                                onValueChange={(value) =>
                                  handleItemChange(
                                    index,
                                    "sales_sub_item_original",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Original Item..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Original Items</SelectLabel>
                                    {product.map((item) => (
                                      <SelectItem
                                        key={item.product_type}
                                        value={item.product_type}
                                      >
                                        {item.product_type}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </SelectShadcn>
                            )}
                          </div> */}
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
                  {/* Tempo Charges */}
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

                  {/* Loading/Unloading */}
                  <div>
                    <Label>Labour Charges</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <SelectShadcn
                        value={loadingType}
                        onValueChange={setLoadingType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Loading Only">Loading Only</SelectItem>
                          <SelectItem value="Loading and Unloading">Loading and Unloading</SelectItem>
                        </SelectContent>
                      </SelectShadcn>
                      <Input
                        id={loadingType === "Loading Only" ? "sales_loading" : loadingType === "Loading and Unloading" ? "sales_unloading" : "sales_loading"}
                        type="tel"
                        value={form.watch(loadingType === "Loading Only" ? "sales_loading" : loadingType === "Loading and Unloading" ? "sales_unloading" : "sales_loading") || ""}
                        onChange={(e) => {
                          handleChargeChange(
                            loadingType === "Loading Only" ? "sales_loading" : loadingType === "Loading and Unloading" ? "sales_unloading" : "sales_loading",
                            e.target.value,
                          )
                        }}
                        maxLength={10}
                        onKeyDown={handleKeyDown}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Other 1 */}
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

                  {/* Other 2 */}
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
                      <Label>GST 18% ({Number(displayGst).toFixed(0)})</Label>
                    </div>
                    <Input
                      type="tel"
                      value={Number(displayGst).toFixed(0)}
                      onChange={(e) => {
                        setGstEdited(true);
                        form.setValue("sales_tax", e.target.value);
                      }}
                      onKeyDown={handleKeyDown}
                      className="mt-1 text-right"
                      maxLength={10}
                      placeholder="0"
                    />
                  </div>

                  {/* Spacer */}
                  <div className="h-8 bg-gray-100 rounded-md w-full"></div>

                  {/* Net Total */}
                  <div>
                    <Label className="font-semibold text-blue-900">
                      Net Total
                    </Label>
                    <Input
                      type="text"
                      value={Number(displayFinalTotal).toFixed(0)}
                      disabled
                      className="mt-1 bg-blue-50 font-bold border-blue-200 text-blue-900 text-right"
                    />
                  </div>

                  {/* Final Amount Received */}
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
                  <CardTitle>Edit Sales</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form id="purchase-edit-form" onSubmit={handleFormSubmit} className="space-y-2">
                {/* Customer Information */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="JFCBILLNO">
                      JFC Bill No
                      <span className="text-xs text-red-400 ">*</span>
                    </Label>
                    <Input
                      id="JFCBILLNO"
                      {...form.register("JFCBILLNO")}
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

                  {/* <div className="space-y-2">
                    <Label htmlFor="sales_item_type">
                      Item Type <span className="text-xs text-red-400 ">*</span>
                    </Label>

                    <SelectShadcn
                      id="sales_item_type"
                      value={form.watch("sales_item_type")}
                      onValueChange={(value) => {
                        form.setValue("sales_item_type", value);
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
                  <div className="space-y-2 col-span-2 lg:col-span-3">
                    <Label htmlFor="sales_address">Address</Label>
                    <Input
                      id="sales_address"
                      {...form.register("sales_address")}
                      className="bg-white"
                      placeholder="Enter address"
                      maxLength={200}
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
                          {/* <th className="text-left p-2 font-medium text-sm">
                            Original Item{" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th> */}
                          <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                            Qnty (pcs){" "}
                            <span className="text-xs text-red-400 ">*</span>
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
                                          handleCustomItemChange(index, e.target.value.toUpperCase())
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 whitespace-nowrap shrink-0"
                                        onClick={() => handleToggleCustomItem(index)}
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
                                         onClick={() => handleToggleCustomItem(index)}
                                       >
                                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                           <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                                           <path d="M8.7 7.3a3 3 0 0 1 4.2 4.2L12 14l-1.3 1.3a1 1 0 0 1-1.4 0L9 13.4l-1.3 1.3a1 1 0 0 1-1.4-1.4L10.6 12 9.3 10.7a1 1 0 0 1 0-1.4Z"/>
                                         </svg>
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
                      {/* Tempo Charges */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sales_tempo">Tempo Charges</Label>
                        <Input
                          className="w-1/2 text-right"
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

                      {/* Loading/Unloading */}
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Labour Charges</Label>
                        <div className="flex w-1/2 gap-1">
                          <SelectShadcn
                            value={loadingType}
                            onValueChange={setLoadingType}
                          >
                            <SelectTrigger className="w-1/2 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Loading">Loading</SelectItem>
                              <SelectItem value="Unloading">Unloading</SelectItem>
                            </SelectContent>
                          </SelectShadcn>
                          <Input
                            className="w-1/2 h-9 text-right"
                            id={loadingType === "Loading" ? "sales_loading" : "sales_unloading"}
                            type="tel"
                            value={form.watch(loadingType === "Loading" ? "sales_loading" : "sales_unloading") || ""}
                            onChange={(e) =>
                              handleChargeChange(
                                loadingType === "Loading" ? "sales_loading" : "sales_unloading",
                                e.target.value,
                              )
                            }
                            maxLength={10}
                            onKeyDown={handleKeyDown}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Other 1 */}
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          placeholder="Other Label 1"
                          className="w-1/2 h-9"
                          {...form.register("sales_other_label")}
                        />
                        <Input
                          className="w-1/2 h-9 text-right"
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

                      {/* Other 2 */}
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          placeholder="Other Label 2"
                          className="w-1/2 h-9"
                          {...form.register("sales_other1_label")}
                        />
                        <Input
                          className="w-1/2 h-9 text-right"
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

                      {/* Gross Total */}
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Gross Total</Label>
                        <Input
                          className="w-1/2 bg-gray-100 font-medium text-right"
                          type="text"
                          value={Number(displayGrandTotal).toFixed(0)}
                          disabled
                        />
                      </div>

                      {/* GST Amount */}
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">GST 18% ({Number(displayGst).toFixed(0)})</Label>
                        <Input
                          className="w-1/2 text-right"
                          type="tel"
                          value={Number(displayGst).toFixed(0)}
                          onChange={(e) => {
                            setGstEdited(true);
                            form.setValue("sales_tax", e.target.value);
                          }}
                          onKeyDown={handleKeyDown}
                          maxLength={10}
                          placeholder="0"
                        />
                      </div>

                      {/* Spacer */}
                      {/* <div className="flex items-center justify-between h-9">
                        <div className="w-1/2"></div>
                        <div className="w-1/2 h-8 bg-gray-100 rounded-md"></div>
                      </div> */}

                      {/* Net Total */}
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-blue-900">
                          Net Total
                        </Label>
                        <Input
                          className="w-1/2 bg-blue-50 font-bold border-blue-200 text-blue-900 text-right"
                          type="text"
                          value={Number(displayFinalTotal).toFixed(0)}
                          disabled
                        />
                      </div>

                      {/* Final Amount Received */}
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Final Amount Received</Label>
                        <Input
                          className="w-1/2 text-right"
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
                      const formElement = document.getElementById('purchase-edit-form');
                      if (formElement) {
                        formElement.requestSubmit();
                      }
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Save and Close
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isSubmitting ? "Saving..." : "Update"}
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
