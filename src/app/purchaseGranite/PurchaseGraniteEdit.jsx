import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
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
import Loader from "@/components/loader/Loader";

const formSchema = z.object({
  purchase_date: z.string(),
  purchase_year: z.string(),
  purchase_type: z.string(),
  purchase_item_type: z.string().min(1, "Item type is required"),
  purchase_supplier: z.string().min(1, "Supplier is required"),
  purchase_bill_no: z.string().min(1, "Bill number is required"),
  purchase_amount: z.string().min(1, "Total Amount is required"),
  purchase_other: z.string().min(1, "Other Amount is required"),
  purchase_estimate_ref: z.string(),
  purchase_no_of_count: z.string(),
});

const PurchaseGraniteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: currentYear } = useQuery({
    queryKey: ["currentYear"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
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
      purchase_type: "Granites",
      purchase_item_type: "",
      purchase_supplier: "",
      purchase_bill_no: "",
      purchase_amount: "",
      purchase_other: "",
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

 
  const { 
    data: purchaseByid, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ["purchase", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-purchase-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    enabled: !!id,
  });

  const { data: productTypeGroup = [] } = useQuery({
    queryKey: ["productTypeGroup"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
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
    queryKey: ["product", form.watch("purchase_item_type")],
    queryFn: async () => {
      const itemType = form.watch("purchase_item_type") || 
                      (purchaseByid?.purchase?.purchase_item_type || "");
      if (!itemType) return [];
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-types/${itemType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.product_type || [];
    },
    enabled: !!form.watch("purchase_item_type") || !!purchaseByid?.purchase?.purchase_item_type,
  });


  useEffect(() => {
    if (purchaseByid && productTypeGroup.length > 0) {
      if (purchaseByid?.purchase) {
       
        const formValues = {
          purchase_date: moment(purchaseByid.purchase.purchase_date).format("YYYY-MM-DD"),
          purchase_year: purchaseByid.purchase.purchase_year || currentYear,
          purchase_type: purchaseByid.purchase.purchase_type || "Granites",
          purchase_item_type: purchaseByid.purchase.purchase_item_type || "",
          purchase_supplier: purchaseByid.purchase.purchase_supplier || "",
          purchase_bill_no: purchaseByid.purchase.purchase_bill_no || "",
          purchase_amount: purchaseByid.purchase.purchase_amount?.toString() || "",
          purchase_other: purchaseByid.purchase.purchase_other?.toString() || "",
          purchase_estimate_ref: purchaseByid.purchase.purchase_estimate_ref || "",
          purchase_no_of_count: purchaseByid.purchase.purchase_no_of_count?.toString() || "1",
        };
        form.reset(formValues);
        
       
        if (Array.isArray(purchaseByid.purchaseSub) && purchaseByid.purchaseSub.length > 0) {
          const mappedData = purchaseByid.purchaseSub.map((sub) => ({
            id: sub.id || "",
            purchase_sub_item: sub.purchase_sub_item || "",
            purchase_sub_qnty: sub.purchase_sub_qnty?.toString() || "",
            purchase_sub_qnty_sqr: sub.purchase_sub_qnty_sqr?.toString() || "",
            purchase_sub_rate: sub.purchase_sub_rate?.toString() || "",
            purchase_sub_amount: sub.purchase_sub_amount?.toString() || "",
          }));
          setItemEntries(mappedData);
        } else {
          setItemEntries([
            {
              id: "",
              purchase_sub_item: "",
              purchase_sub_qnty: "",
              purchase_sub_qnty_sqr: "",
              purchase_sub_rate: "",
              purchase_sub_amount: "",
            },
          ]);
        }
      }
    }
  }, [purchaseByid, productTypeGroup, currentYear, form]);

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "purchase_sub_qnty_sqr" || field === "purchase_sub_rate") &&
      updatedEntries[index].purchase_sub_qnty_sqr &&
      updatedEntries[index].purchase_sub_rate
    ) {
      updatedEntries[index].purchase_sub_amount = (
        parseFloat(updatedEntries[index].purchase_sub_qnty_sqr || 0) *
        parseFloat(updatedEntries[index].purchase_sub_rate || 0)
      ).toString();
      setItemEntries([...updatedEntries]);
    }

    const itemsTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
      0
    );
    const otherTotal = parseFloat(form.watch("purchase_other") || 0);

    const newTotal = itemsTotal + otherTotal;
    form.setValue("purchase_amount", newTotal.toString());
  };

  const handleOtherChange = (value) => {
    form.setValue("purchase_other", value);
    
    const itemsTotal = itemEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
      0
    );
    const newTotal = itemsTotal + parseFloat(value || 0);
    form.setValue("purchase_amount", newTotal.toString());
  };





  const handleKeyDown = (event) => {
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'Escape' ||
      event.key === 'Enter' ||
      (event.key >= '0' && event.key <= '9') ||
      event.key === '.'
    ) {
      return;
    }
    event.preventDefault();
  };

  const updatePurchaseMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/web-update-purchase/${id}`,
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
      navigate("/purchase-granite");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update purchase",
        variant: "destructive",
      });
    },
  });

  const validateForm = (data) => {
    const formErrors = {
      date: !data.purchase_date ? "Date is required" : "",
      supplier: !data.purchase_supplier ? "Supplier is required" : "",
      billNo: !data.purchase_bill_no ? "Bill number is required" : "",
      itemType: !data.purchase_item_type ? "Item type is required" : "",
      otherAmount: !data.purchase_other ? "Other Amount is required" : "",
      totalAmount: !data.purchase_amount ? "Total Amount is required" : "",
    };

    const itemErrors = itemEntries.map((entry, index) => ({
      item: !entry.purchase_sub_item ? "required" : "",
      qnty: !entry.purchase_sub_qnty
        ? "required"
        : isNaN(entry.purchase_sub_qnty)
        ? "Quantity must be a number"
        : "",
      qntySqr: !entry.purchase_sub_qnty_sqr
        ? "required"
        : isNaN(entry.purchase_sub_qnty_sqr)
        ? "Quantity (sqr) must be a number"
        : "",
      rate: !entry.purchase_sub_rate
        ? "required"
        : isNaN(entry.purchase_sub_rate)
        ? "Rate must be a number"
        : "",
    }));

    const hasFormErrors = Object.values(formErrors).some(err => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.item || err.qnty || err.qntySqr || err.rate
    );

    return { formErrors, itemErrors, hasFormErrors, hasItemErrors };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = form.getValues();
    const { formErrors, itemErrors, hasFormErrors, hasItemErrors } = validateForm(formData);

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
                            Bill No
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
                          Qty (pcs)
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
        purchase_year: currentYear,
        purchase_no_of_count: itemEntries.length,
        purchase_sub_data: itemEntries,
      };
      
      updatePurchaseMutation.mutate(payload);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update purchase",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/purchase-granite");
  };
  
  if (isLoading || !purchaseByid || productTypeGroup.length === 0) {
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
                <h1 className="text-base font-bold">Edit Purchase Granite</h1>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 border border-green-100 rounded-md p-2">
                <p className="text-xs text-green-800 font-medium">Total</p>
                <p className="text-sm font-bold">
                  {form.watch("purchase_amount") || 0}
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-md p-2">
                <p className="text-xs text-green-800 font-medium">Other</p>
                <p className="text-sm font-bold">
                  {form.watch("purchase_other") || 0}
                </p>
              </div>
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
                    <Label htmlFor="purchase_supplier">Supplier <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_supplier"
                      {...form.register("purchase_supplier")}
                      className="mt-1"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_bill_no">Bill No <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_bill_no"
                      {...form.register("purchase_bill_no")}
                      className="mt-1"
                      placeholder="Enter bill number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_item_type">Item Type <span className="text-xs text-red-400 ">*</span></Label>
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
                  </div>
                  <div>
                    <Label htmlFor="purchase_other">Other Amount</Label>
                    <Input
                      id="purchase_other"
                      type="tel"
                      {...form.register("purchase_other")}
                      onChange={(e) => handleOtherChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_amount">Total Amount</Label>
                    <Input
                      id="purchase_amount"
                      type="tel"
                      {...form.register("purchase_amount")}
                      disabled
                      className="mt-1 bg-gray-100"
                      placeholder="0"
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
                      <div className="col-span-12">
                        <div className="mb-1">
                          <SelectShadcn
                            value={entry.purchase_sub_item}
                            onValueChange={(value) =>
                              handleItemChange(
                                index,
                                "purchase_sub_item",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select item...">
                                {entry.purchase_sub_item || "Select item"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Items</SelectLabel>
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
                                  e.target.value
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm"
                              placeholder="Qnty (pcs)"
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
                                  e.target.value
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm"
                              placeholder="Qnty (sqr)"
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
                                  e.target.value
                                )
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 text-sm"
                              placeholder="Rate"
                            />
                          </div>
                        </div>
                        <div className="mt-1">
                          <Input
                            type="tel"
                            value={entry.purchase_sub_amount}
                            disabled
                            onKeyDown={handleKeyDown}
                            className="h-8 text-sm bg-gray-100"
                            placeholder="Amount"
                          />
                        </div>
                      </div>
                  
                    </div>
                  </div>
                ))}
               
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
                  <CardTitle>Edit Purchase Granite</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-2">
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
                    <Label htmlFor="purchase_supplier">Supplier <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_supplier"
                      {...form.register("purchase_supplier")}
                      className="bg-white"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_bill_no">Bill No <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_bill_no"
                      {...form.register("purchase_bill_no")}
                      className="bg-white"
                      placeholder="Enter bill number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_item_type">Item Type <span className="text-xs text-red-400 ">*</span></Label>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_other">Other Amount</Label>
                    <Input
                      id="purchase_other"
                      type="tel"
                      {...form.register("purchase_other")}
                      onChange={(e) => handleOtherChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_amount">Total Amount</Label>
                    <Input
                      id="purchase_amount"
                      type="tel"
                      {...form.register("purchase_amount")}
                      disabled
                      className="bg-gray-100"
                      placeholder="0"
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
                          <th className="text-left p-2 font-medium text-sm">Item <span className="text-xs text-red-400 ">*</span></th>
                          <th className="text-left p-2 font-medium text-sm">Qnty (pcs) <span className="text-xs text-red-400 ">*</span></th>
                          <th className="text-left p-2 font-medium text-sm">Qnty (sqr) <span className="text-xs text-red-400 ">*</span></th>
                          <th className="text-left p-2 font-medium text-sm">Rate <span className="text-xs text-red-400 ">*</span></th>
                          <th className="text-left p-2 font-medium text-sm">Amount</th>
                          <th className="text-left p-2 font-medium text-sm"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemEntries.map((entry, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">
                              <SelectShadcn
                                value={entry.purchase_sub_item}
                                onValueChange={(value) =>
                                  handleItemChange(
                                    index,
                                    "purchase_sub_item",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-[8rem]">
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Items</SelectLabel>
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
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.purchase_sub_qnty}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "purchase_sub_qnty",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9"
                                placeholder="0"
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
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9"
                                placeholder="0"
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
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="h-9"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.purchase_sub_amount}
                               
                                className="h-9 "
                                placeholder="0"
                                onKeyDown={handleKeyDown}
                              />
                            </td>
                           
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                    {isSubmitting ? "Updating..." : "Update Purchase"}
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