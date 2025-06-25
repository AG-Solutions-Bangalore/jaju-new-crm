import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
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

const PurchaseGraniteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    purchase_date: moment().format("YYYY-MM-DD"),
    purchase_year: "",
    purchase_type: "Granites",
    purchase_item_type: "",
    purchase_supplier: "",
    purchase_bill_no: "",
    purchase_amount: "",
    purchase_other: "",
    purchase_estimate_ref: "",
    purchase_no_of_count: "1",
  });

  // Items state
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

  // Fetch current year
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

  // Fetch purchase data by ID
  const { 
    data: purchaseByid, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ["purchaseByid", id],
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


  console.log("purchaseByid",purchaseByid)
  // Fetch product type groups
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

  // Fetch products based on selected item type
  const { data: product = [], refetch: refetchProducts } = useQuery({
    queryKey: ["product", formData.purchase_item_type],
    queryFn: async () => {
      const itemType = formData.purchase_item_type || 
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
    enabled: !!formData.purchase_item_type || !!purchaseByid?.purchase?.purchase_item_type,
  });

  // Set initial data when purchase data is loaded
  // useEffect(() => {
  //   if (purchaseByid && productTypeGroup.length > 0) {
  //     if (purchaseByid?.purchase) {
  //       // Set form data
  //       const newFormData = {
  //         purchase_date: moment(purchaseByid.purchase.purchase_date).format("YYYY-MM-DD"),
  //         purchase_year: purchaseByid.purchase.purchase_year || currentYear,
  //         purchase_type: purchaseByid.purchase.purchase_type || "Granites",
  //         purchase_item_type: purchaseByid.purchase.purchase_item_type || "",
  //         purchase_supplier: purchaseByid.purchase.purchase_supplier || "",
  //         purchase_bill_no: purchaseByid.purchase.purchase_bill_no || "",
  //         purchase_amount: purchaseByid.purchase.purchase_amount?.toString() || "",
  //         purchase_other: purchaseByid.purchase.purchase_other?.toString() || "",
  //         purchase_estimate_ref: purchaseByid.purchase.purchase_estimate_ref || "",
  //         purchase_no_of_count: purchaseByid.purchase.purchase_no_of_count?.toString() || "1",
  //       };
  //       setFormData(newFormData);
        
  //       // Set item entries
  //       if (Array.isArray(purchaseByid.purchaseSub) && purchaseByid.purchaseSub.length > 0) {
  //         const mappedData = purchaseByid.purchaseSub.map((sub) => ({
  //           id: sub.id || "",
  //           purchase_sub_item: sub.purchase_sub_item || "",
  //           purchase_sub_qnty: sub.purchase_sub_qnty?.toString() || "",
  //           purchase_sub_qnty_sqr: sub.purchase_sub_qnty_sqr?.toString() || "",
  //           purchase_sub_rate: sub.purchase_sub_rate?.toString() || "",
  //           purchase_sub_amount: sub.purchase_sub_amount?.toString() || "",
  //         }));
  //         setItemEntries(mappedData);
  //       } else {
  //         setItemEntries([
  //           {
  //             id: "",
  //             purchase_sub_item: "",
  //             purchase_sub_qnty: "",
  //             purchase_sub_qnty_sqr: "",
  //             purchase_sub_rate: "",
  //             purchase_sub_amount: "",
  //           },
  //         ]);
  //       }
  //     }
  //   }
  // }, [purchaseByid, productTypeGroup, currentYear]);
  useEffect(() => {
    if (purchaseByid && !isInitialDataLoaded) {
        const { purchase: pId, purchaseSub: pSub } = purchaseByid;
     setFormData({
          purchase_date: moment(pId.purchase_date).format("YYYY-MM-DD"),
          purchase_year: pId.purchase_year || currentYear,
          purchase_type: pId.purchase_type || "Granites",
          purchase_item_type: pId.purchase_item_type || "",
          purchase_supplier: pId.purchase_supplier || "",
          purchase_bill_no: pId.purchase_bill_no || "",
          purchase_amount: pId.purchase_amount?.toString() || "",
          purchase_other: pId.purchase_other?.toString() || "",
          purchase_estimate_ref: pId.purchase_estimate_ref || "",
          purchase_no_of_count: pId.purchase_no_of_count?.toString() || "1",
        })
        if (pSub && pSub.length > 0) {
            const mappedData = pSub.map((sub) => ({
                id: sub.id || "",
                purchase_sub_item: sub.purchase_sub_item || "",
                purchase_sub_qnty: sub.purchase_sub_qnty?.toString() || "",
                purchase_sub_qnty_sqr: sub.purchase_sub_qnty_sqr?.toString() || "",
                purchase_sub_rate: sub.purchase_sub_rate?.toString() || "",
                purchase_sub_amount: sub.purchase_sub_amount?.toString() || "",
              }));
              setItemEntries(mappedData);
            }else{
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
            setIsInitialDataLoaded(true);
      
    }
  }, [purchaseByid, isInitialDataLoaded]);
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Recalculate total if other amount changes
    if (field === "purchase_other") {
      const itemsTotal = itemEntries.reduce(
        (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
        0
      );
      const newTotal = itemsTotal + parseFloat(value || 0);
      setFormData(prev => ({
        ...prev,
        purchase_amount: newTotal.toString()
      }));
    }
  };

  // Handle item entry changes
  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    
    // Calculate amount if qnty_sqr or rate changes
    if (
      (field === "purchase_sub_qnty_sqr" || field === "purchase_sub_rate") &&
      updatedEntries[index].purchase_sub_qnty_sqr &&
      updatedEntries[index].purchase_sub_rate
    ) {
      updatedEntries[index].purchase_sub_amount = (
        parseFloat(updatedEntries[index].purchase_sub_qnty_sqr || 0) *
        parseFloat(updatedEntries[index].purchase_sub_rate || 0)
      ).toString();
    }

    setItemEntries(updatedEntries);

    // Recalculate total amount
    const itemsTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
      0
    );
    const otherTotal = parseFloat(formData.purchase_other || 0);
    const newTotal = itemsTotal + otherTotal;
    
    setFormData(prev => ({
      ...prev,
      purchase_amount: newTotal.toString()
    }));
  };

  // Add new item entry
  const addItemEntry = () => {
    setItemEntries([
      ...itemEntries,
      {
        id: "",
        purchase_sub_item: "",
        purchase_sub_qnty: "",
        purchase_sub_qnty_sqr: "",
        purchase_sub_rate: "",
        purchase_sub_amount: "",
      },
    ]);
  };

  // Remove item entry
  const removeItemEntry = (index) => {
    const updatedEntries = [...itemEntries];
    updatedEntries.splice(index, 1);
    setItemEntries(updatedEntries);

    // Recalculate total amount after removal
    const itemsTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.purchase_sub_amount || 0),
      0
    );
    const otherTotal = parseFloat(formData.purchase_other || 0);
    const newTotal = itemsTotal + otherTotal;
    
    setFormData(prev => ({
      ...prev,
      purchase_amount: newTotal.toString(),
      purchase_no_of_count: updatedEntries.length.toString()
    }));
  };

  // Handle key down for numeric inputs
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

  // Mutation for updating purchase
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

  // Validate form before submission
  const validateForm = () => {
    const errors = {
      form: {},
      items: [],
      hasErrors: false
    };

    // Validate main form fields
    if (!formData.purchase_date) {
      errors.form.date = "Date is required";
      errors.hasErrors = true;
    }
    if (!formData.purchase_supplier) {
      errors.form.supplier = "Supplier is required";
      errors.hasErrors = true;
    }
    if (!formData.purchase_bill_no) {
      errors.form.billNo = "Bill number is required";
      errors.hasErrors = true;
    }
    if (!formData.purchase_item_type) {
      errors.form.itemType = "Item type is required";
      errors.hasErrors = true;
    }
    if (!formData.purchase_other) {
      errors.form.otherAmount = "Other Amount is required";
      errors.hasErrors = true;
    }
    if (!formData.purchase_amount) {
      errors.form.totalAmount = "Total Amount is required";
      errors.hasErrors = true;
    }

    // Validate item entries
    errors.items = itemEntries.map((entry, index) => {
      const itemErrors = {};
      if (!entry.purchase_sub_item) {
        itemErrors.item = "Item is required";
        errors.hasErrors = true;
      }
      if (!entry.purchase_sub_qnty) {
        itemErrors.qnty = "Quantity is required";
        errors.hasErrors = true;
      } else if (isNaN(entry.purchase_sub_qnty)) {
        itemErrors.qnty = "Quantity must be a number";
        errors.hasErrors = true;
      }
      if (!entry.purchase_sub_qnty_sqr) {
        itemErrors.qntySqr = "Quantity (sqr) is required";
        errors.hasErrors = true;
      } else if (isNaN(entry.purchase_sub_qnty_sqr)) {
        itemErrors.qntySqr = "Quantity (sqr) must be a number";
        errors.hasErrors = true;
      }
      if (!entry.purchase_sub_rate) {
        itemErrors.rate = "Rate is required";
        errors.hasErrors = true;
      } else if (isNaN(entry.purchase_sub_rate)) {
        itemErrors.rate = "Rate must be a number";
        errors.hasErrors = true;
      }
      return itemErrors;
    });

    return errors;
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm();
    if (validation.hasErrors) {
      toast({
        title: "Validation Errors",
        description: (
          <div className="w-full space-y-3 text-xs max-h-[60vh] overflow-y-auto">
            {Object.keys(validation.form).length > 0 && (
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
                      {validation.form.date && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Date
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {validation.form.date}
                          </td>
                        </tr>
                      )}
                      {validation.form.supplier && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Supplier
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {validation.form.supplier}
                          </td>
                        </tr>
                      )}
                      {validation.form.billNo && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Bill No
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {validation.form.billNo}
                          </td>
                        </tr>
                      )}
                      {validation.form.itemType && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                            Item Type
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {validation.form.itemType}
                          </td>
                        </tr>
                      )}
                      {validation.form.otherAmount && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                           Other Amount
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {validation.form.otherAmount}
                          </td>
                        </tr>
                      )}
                      {validation.form.totalAmount && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                           Total Amount
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                            {validation.form.totalAmount}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {validation.items.some(item => Object.keys(item).length > 0) && (
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
                      {validation.items.map(
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

    try {
      const payload = {
        ...formData,
        purchase_year: currentYear,
        purchase_no_of_count: itemEntries.length,
        purchase_sub_data: itemEntries,
      };
      
      await updatePurchaseMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Error updating purchase:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/purchase-granite");
  };
  
  if (isLoading || !isInitialDataLoaded ) {
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
                  {formData.purchase_amount || 0}
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-md p-2">
                <p className="text-xs text-green-800 font-medium">Other</p>
                <p className="text-sm font-bold">
                  {formData.purchase_other || 0}
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
                      value={formData.purchase_date}
                      onChange={(e) => handleInputChange("purchase_date", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_supplier">Supplier <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_supplier"
                      value={formData.purchase_supplier}
                      onChange={(e) => handleInputChange("purchase_supplier", e.target.value)}
                      className="mt-1"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_bill_no">Bill No <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_bill_no"
                      value={formData.purchase_bill_no}
                      onChange={(e) => handleInputChange("purchase_bill_no", e.target.value)}
                      className="mt-1"
                      placeholder="Enter bill number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase_item_type">Item Type <span className="text-xs text-red-400 ">*</span></Label>
                    <SelectShadcn
                      id="purchase_item_type"
                      value={formData.purchase_item_type}
                      onValueChange={(value) => {
                        handleInputChange("purchase_item_type", value);
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
                      value={formData.purchase_other}
                      onChange={(e) => handleInputChange("purchase_other", e.target.value)}
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
                      value={formData.purchase_amount}
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addItemEntry}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
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
                        <div className="mt-1 flex items-center gap-1">
                          <Input
                            type="tel"
                            value={entry.purchase_sub_amount}
                            disabled
                            onKeyDown={handleKeyDown}
                            className="h-8 text-sm bg-gray-100 flex-1"
                            placeholder="Amount"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemEntry(index)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                      value={formData.purchase_date}
                      onChange={(e) => handleInputChange("purchase_date", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_supplier">Supplier <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_supplier"
                      value={formData.purchase_supplier}
                      onChange={(e) => handleInputChange("purchase_supplier", e.target.value)}
                      className="bg-white"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_bill_no">Bill No <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="purchase_bill_no"
                      value={formData.purchase_bill_no}
                      onChange={(e) => handleInputChange("purchase_bill_no", e.target.value)}
                      className="bg-white"
                      placeholder="Enter bill number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_item_type">Item Type <span className="text-xs text-red-400 ">*</span></Label>
                    <SelectShadcn
                      id="purchase_item_type"
                      value={formData.purchase_item_type}
                      onValueChange={(value) => {
                        handleInputChange("purchase_item_type", value);
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
                      value={formData.purchase_other}
                      onChange={(e) => handleInputChange("purchase_other", e.target.value)}
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
                      value={formData.purchase_amount}
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
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addItemEntry}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
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
                          <th className="text-left p-2 font-medium text-sm">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemEntries.map((entry, index) => (
                          <tr key={index} className="border-b">
                            {/* Item */}
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

                            {/* Quantity (pcs) */}
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

                            {/* Quantity (sqr) */}
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

                            {/* Rate */}
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

                            {/* Amount */}
                            <td className="p-2">
                              <Input
                                type="tel"
                                value={entry.purchase_sub_amount}
                                disabled
                                className="h-9 bg-gray-100"
                                placeholder="0"
                                onKeyDown={handleKeyDown}
                              />
                            </td>

                            {/* Delete */}
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemEntry(index)}
                                className="h-9 w-9 p-0 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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