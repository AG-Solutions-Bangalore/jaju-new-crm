import { useEffect, useState } from "react";
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

const EstimateSalesAdd = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
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

  const {
    data: salesEstimateId,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["salesEstimateId", id],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-estimate-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: productTypeGroup = [] } = useQuery({
    queryKey: ["productTypeGroup"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-type-group`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.product_type_group || [];
    },
  });

  const { data: product = [], refetch: refetchProducts } = useQuery({
    queryKey: ["product", form.watch("sales_item_type")],
    queryFn: async () => {
      setIsLoadingItems(true);
      if (!form.watch("sales_item_type")) return [];
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-types/${form.watch(
          "sales_item_type"
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoadingItems(false);
      return response.data.product_type || [];
    },
    enabled: !!form.watch("sales_item_type"),
  });

  useEffect(() => {
    if (salesEstimateId) {
      const { estimate: sId, estimateSub: sSub } = salesEstimateId;
      const formValues = {
        sales_date: moment(sId.estimate_date).format("YYYY-MM-DD"),
        sales_year: sId.estimate_year || currentYear,
        sales_item_type: sId.estimate_item_type || "Granites",
        sales_customer: sId.estimate_customer || "",
        sales_address: sId.estimate_address || "",
        sales_mobile: sId.estimate_mobile || "",
        sales_other: sId.estimate_other?.toString() || "",
        sales_tempo: sId.estimate_tempo?.toString() || "",
        sales_tax: sId.estimate_tax?.toString() || "",
        sales_gross: sId.estimate_gross?.toString() || "",
        sales_loading: sId.estimate_loading || "",
        sales_unloading: sId.estimate_unloading || "",
        sales_advance: sId.estimate_advance || "",
        sales_balance: sId.estimate_balance || "",
        sales_no_of_count: sId.estimate_no_of_count?.toString() || "1",
      };
      form.reset(formValues);

      if (sSub && sSub.length > 0) {
        const mappedData = sSub.map((sub) => ({
          id: sub.id || "",
          estimate_sub_type: sub.estimate_sub_type || "",
          estimate_sub_item: sub.estimate_sub_item || "",
         
          estimate_sub_qnty: sub.estimate_sub_qnty?.toString() || "",
          estimate_sub_qnty_sqr: sub.estimate_sub_qnty_sqr?.toString() || "",
          estimate_sub_rate: sub.estimate_sub_rate?.toString() || "",
          estimate_sub_amount: sub.estimate_sub_amount?.toString() || "",
        }));
        setItemEntries(mappedData);
      }
      setIsInitialLoading(false);
    }
  }, [salesEstimateId]);

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "estimate_sub_qnty_sqr" || field === "estimate_sub_rate") &&
      updatedEntries[index].estimate_sub_qnty_sqr &&
      updatedEntries[index].estimate_sub_rate
    ) {
      updatedEntries[index].estimate_sub_amount = (
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

    const newGross = itemsTotal + chargesTotal;
    form.setValue("sales_gross", newGross.toString());

    const newBalance = newGross - parseFloat(form.watch("sales_advance") || 0);
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

    const newGross = itemsTotal + chargesTotal;
    form.setValue("sales_gross", newGross.toString());

    const newBalance = newGross - parseFloat(form.watch("sales_advance") || 0);
    form.setValue("sales_balance", newBalance.toString());
  };

  const handleAdvanceChange = (value) => {
    form.setValue("sales_advance", value);
    const newBalance =
      parseFloat(form.watch("sales_gross") || 0) - parseFloat(value || 0);
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

    const newGross = itemsTotal + chargesTotal;
    form.setValue("sales_gross", newGross.toString());

    const newBalance = newGross - parseFloat(form.watch("sales_advance") || 0);
    form.setValue("sales_balance", newBalance.toString());
  };


  const createEstimateSalesMutation = useMutation({
    mutationFn: async (payload) => {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-create-sales`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
                        Original  Item
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
                            error.qnty ||
                            error.originalItem ||
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
                                {error.originalItem}
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
                          )
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
      const payload = {
        ...data,
        sales_year: currentYear,
        sales_no_of_count: itemEntries.length,
        sales_sub_data: itemEntries,
        sales_estimate_ref: id,
      };

      createEstimateSalesMutation.mutate(payload);
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
    navigate("/estimate");
  };

  if (isFetching || productTypeGroup.length == 0) {
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
              Error Fetching Estimate Sales
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
                <h1 className="text-base font-bold">Add Estimate Sales</h1>
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
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Customer Info */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Customer Information</h3>
                <div className="space-y-3">
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
                  <div>
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
                        <div className="grid grid-cols-2 gap-1 mb-1">
                          <div className="col-span-1">
                            {/* <Input
                              value={entry.estimate_sub_type}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "estimate_sub_type",
                                  e.target.value
                                )
                              }
                              className="h-8 text-sm"
                              placeholder="Types"
                            /> */}
                            <SelectShadcn
                              value={entry.estimate_sub_type}
                              onValueChange={(value) =>
                                handleItemChange(index, "estimate_sub_type", value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Item Types</SelectLabel>
                                  {typeOptions.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </SelectShadcn>
                          </div>
                          <div className="col-span-1">
                            <Input
                              value={entry.estimate_sub_item}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "estimate_sub_item",
                                  e.target.value
                                )
                              }
                              className="h-8 text-sm"
                              placeholder="Item Name"
                              maxLength={20}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                          <div>
                            {isLoadingItems ? (
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
                          </div>
                          <div>
                            <Input
                              type="tel"
                              value={entry.estimate_sub_qnty}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "estimate_sub_qnty",
                                  e.target.value
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm"
                              placeholder="Qnty (pcs)"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <Input
                              type="tel"
                              value={entry.estimate_sub_qnty_sqr}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "estimate_sub_qnty_sqr",
                                  e.target.value
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm"
                              placeholder="Qnty (sqr)"
                              maxLength={10}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 mt-1 gap-1">
                          <div>
                            <Input
                              type="tel"
                              value={entry.estimate_sub_rate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "estimate_sub_rate",
                                  e.target.value
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm"
                              placeholder="Rate"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <Input
                              type="tel"
                              value={entry.estimate_sub_amount}
                              disabled
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm bg-gray-100"
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
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-xs h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              
              </div> 

              {/* Charges */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Charges</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="sales_tax">Tax</Label>
                    <Input
                      id="sales_tax"
                      type="tel"
                      {...form.register("sales_tax")}
                      onChange={(e) =>
                        handleChargeChange("sales_tax", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                      maxLength={10}
                    />
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
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_loading">Loading Charges</Label>
                    <Input
                      id="sales_loading"
                      type="tel"
                      {...form.register("sales_loading")}
                      onChange={(e) =>
                        handleChargeChange("sales_loading", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_other">Other Charges</Label>
                    <Input
                      id="sales_other"
                      type="tel"
                      {...form.register("sales_other")}
                      onChange={(e) =>
                        handleChargeChange("sales_other", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Totals</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="sales_gross">Gross Total</Label>
                    <Input
                      id="sales_gross"
                      type="tel"
                      {...form.register("sales_gross")}
                      disabled
                      onKeyDown={handleKeyDown}
                      className="mt-1 bg-gray-100"
                      
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_advance">Advance</Label>
                    <Input
                      id="sales_advance"
                      type="tel"
                      onKeyDown={handleKeyDown}
                      {...form.register("sales_advance")}
                      onChange={(e) => handleAdvanceChange(e.target.value)}
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="sales_balance">Balance</Label>
                    <Input
                      id="sales_balance"
                      type="tel"
                      {...form.register("sales_balance")}
                      disabled
                      onKeyDown={handleKeyDown}
                      className="mt-1 bg-gray-100"
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
                  <CardTitle>Add Estimate Sales</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-2">
                {/* Customer Information */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
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

                  <div className="space-y-2">
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
                  </div>
                  <div className="space-y-2 col-span-2 lg:col-span-4">
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
                          <th className="text-left p-2 font-medium text-sm">
                            Type{" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm">
                            Item{" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm">
                            Original Item{" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm">
                            Qnty (pcs){" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm">
                            Qnty (sqr){" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm">
                            Rate{" "}
                            <span className="text-xs text-red-400 ">*</span>
                          </th>
                          <th className="text-left p-2 font-medium text-sm">
                            Amount
                          </th>
                          <th className="text-left p-2 font-medium text-sm"></th>
                        </tr>
                      </thead>
                      <tbody>




                        {itemEntries.map((entry, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">
                              {/* <Input
                                value={entry.estimate_sub_type}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "estimate_sub_type",
                                    e.target.value
                                  )
                                }
                                className="h-9"
                                placeholder="Types"
                              /> */}

                              <SelectShadcn
                                value={entry.estimate_sub_type}
                                onValueChange={(value) =>
                                  handleItemChange(
                                    index,
                                    "estimate_sub_type",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-[8rem]">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Item Types</SelectLabel>
                                    {typeOptions.map((type) => (
                                      <SelectItem
                                        key={type.value}
                                        value={type.value}
                                      >
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </SelectShadcn>
                            </td>
                            <td className="p-2">
                              <Input
                                value={entry.estimate_sub_item}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "estimate_sub_item",
                                    e.target.value
                                  )
                                }
                                className="h-9"
                                placeholder="Item Name"
                              />
                            </td>

                            <td className="p-2">
                              {isLoadingItems ? (
                                                  <div className="h-9 bg-gray-200 rounded animate-pulse w-[8rem]"></div>
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
                                  <SelectTrigger className="w-[8rem]">
                                    <SelectValue placeholder="Select Original Item" />
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
                            </td>

                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.estimate_sub_qnty}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "estimate_sub_qnty",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9"
                                placeholder="0"
                                maxLength={10}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.estimate_sub_qnty_sqr}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "estimate_sub_qnty_sqr",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9"
                                placeholder="0"
                                maxLength={10}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.estimate_sub_rate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "estimate_sub_rate",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9"
                                placeholder="0"
                                maxLength={10}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.estimate_sub_amount}
                                disabled
                                className="h-9 bg-gray-100"
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
                  {/* Charges */}
                  <div className="border rounded-lg p-3 bg-white">
                    <h3 className="font-medium mb-2">Charges</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="sales_tax">Tax</Label>
                        <Input
                          id="sales_tax"
                          type="tel"
                          {...form.register("sales_tax")}
                          onChange={(e) =>
                            handleChargeChange("sales_tax", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sales_tempo">Tempo Charges</Label>
                        <Input
                          id="sales_tempo"
                          type="tel"
                          {...form.register("sales_tempo")}
                          onChange={(e) =>
                            handleChargeChange("sales_tempo", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sales_loading">
                          Load/Unload Charges
                        </Label>
                        <Input
                          id="sales_loading"
                          type="tel"
                          {...form.register("sales_loading")}
                          onChange={(e) =>
                            handleChargeChange("sales_loading", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                          maxLength={10}
                        />
                      </div>
                      {/* <div className="space-y-2">
                        <Label htmlFor="sales_unloading">
                          Unloading Charges
                        </Label>
                        <Input
                          id="sales_unloading"
                          type="tel"
                          {...form.register("sales_unloading")}
                          onChange={(e) =>
                            handleChargeChange(
                              "sales_unloading",
                              e.target.value
                            )
                          }
                        />
                      
                      </div> */}
                      <div className="space-y-2">
                        <Label htmlFor="sales_other">Other Charges</Label>
                        <Input
                          id="sales_other"
                          type="tel"
                          {...form.register("sales_other")}
                          onChange={(e) =>
                            handleChargeChange("sales_other", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border rounded-lg p-3 bg-white">
                    <h3 className="font-medium mb-2">Totals</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="sales_gross">Gross Total</Label>
                        <Input
                          id="sales_gross"
                          type="tel"
                          {...form.register("sales_gross")}
                          disabled
                          className="bg-gray-100"
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sales_advance">Advance</Label>
                        <Input
                          id="sales_advance"
                          type="tel"
                          {...form.register("sales_advance")}
                          onChange={(e) => handleAdvanceChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sales_balance">Balance</Label>
                        <Input
                          id="sales_balance"
                          type="tel"
                          {...form.register("sales_balance")}
                          disabled
                          onKeyDown={handleKeyDown}
                          className="bg-gray-100"
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
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isSubmitting ? "Saving..." : "Save Sales"}
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

export default EstimateSalesAdd;
