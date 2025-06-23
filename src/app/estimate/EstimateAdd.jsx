import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const typeOptions = [
  { value: "Granites", label: "Granites" },
  { value: "Tiles", label: "Tiles" },
];

const formSchema = z.object({
  estimate_date: z.string(),
  estimate_year: z.string(),
  estimate_customer: z.string(),
  estimate_address: z.string(),
  estimate_mobile: z.string(),
  estimate_item_type: z.string(),
  estimate_tax: z.string(),
  estimate_tempo: z.string(),
  estimate_loading: z.string(),
  estimate_unloading: z.string(),
  estimate_other: z.string(),
  estimate_gross: z.string(),
  estimate_advance: z.string(),
  estimate_balance: z.string(),
});

const AddEstimate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateRef, setEstimateRef] = useState("");
  const [itemEntries, setItemEntries] = useState([
    {
      estimate_sub_type: "",
      estimate_sub_item: "",
      estimate_sub_qnty: "",
      estimate_sub_qnty_sqr: "",
      estimate_sub_rate: "",
      estimate_sub_amount: "",
    },
  ]);

  
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

 
  useEffect(() => {
    const fetchEstimateRef = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${BASE_URL}/api/web-fetch-estimate-latest/2023-24`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEstimateRef(response.data?.estimateRef || "");
      } catch (error) {
        console.error("Error fetching estimate reference:", error);
      }
    };
    fetchEstimateRef();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimate_date: moment().format("YYYY-MM-DD"),
      estimate_year: currentYear,
      estimate_customer: "",
      estimate_address: "",
      estimate_mobile: "",
      estimate_item_type: "",
      estimate_tax: "",
      estimate_tempo: "",
      estimate_loading: "",
      estimate_unloading: "",
      estimate_other: "",
      estimate_gross: "",
      estimate_advance: "",
      estimate_balance: "",
    },
  });

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
      parseFloat(form.watch("estimate_tax") || 0) +
      parseFloat(form.watch("estimate_tempo") || 0) +
      parseFloat(form.watch("estimate_loading") || 0) +
      parseFloat(form.watch("estimate_unloading") || 0) +
      parseFloat(form.watch("estimate_other") || 0);

    const newGross = itemsTotal + chargesTotal;
    form.setValue("estimate_gross", newGross.toString());

   
    const newBalance =
      newGross - parseFloat(form.watch("estimate_advance") || 0);
    form.setValue("estimate_balance", newBalance.toString());
  };

  const handleChargeChange = (field, value) => {
    form.setValue(field, value);

    
    const itemsTotal = itemEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.estimate_sub_amount || 0),
      0
    );
    const chargesTotal =
      parseFloat(form.watch("estimate_tax") || 0) +
      parseFloat(form.watch("estimate_tempo") || 0) +
      parseFloat(form.watch("estimate_loading") || 0) +
      parseFloat(form.watch("estimate_unloading") || 0) +
      parseFloat(form.watch("estimate_other") || 0);

    const newGross = itemsTotal + chargesTotal;
    form.setValue("estimate_gross", newGross.toString());

    
    const newBalance =
      newGross - parseFloat(form.watch("estimate_advance") || 0);
    form.setValue("estimate_balance", newBalance.toString());
  };

  const handleAdvanceChange = (value) => {
    form.setValue("estimate_advance", value);
    const newBalance =
      parseFloat(form.watch("estimate_gross") || 0) - parseFloat(value || 0);
    form.setValue("estimate_balance", newBalance.toString());
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
      parseFloat(form.watch("estimate_tax") || 0) +
      parseFloat(form.watch("estimate_tempo") || 0) +
      parseFloat(form.watch("estimate_loading") || 0) +
      parseFloat(form.watch("estimate_unloading") || 0) +
      parseFloat(form.watch("estimate_other") || 0);

    const newGross = itemsTotal + chargesTotal;
    form.setValue("estimate_gross", newGross.toString());

    const newBalance =
      newGross - parseFloat(form.watch("estimate_advance") || 0);
    form.setValue("estimate_balance", newBalance.toString());
  };

  const handleKeyDown = (event) => {
   
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'Escape' ||
      event.key === 'Enter' ||
      (event.key >= '0' && event.key <= '9')
    ) {
      return; 
    }
    
    event.preventDefault();
  };
  const createEstimateMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-create-estimate`,
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
      navigate("/estimate");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create estimate",
        variant: "destructive",
      });
    },
  });
  const validateForm = (data) => {
  
    const formErrors = {
      date: !data.estimate_date ? "Date is required" : "",
      customer: !data.estimate_customer ? "Customer name is required" : "",
      itemType: !data.estimate_item_type ? "Item type is required" : "",
      
    };
  
   
    const itemErrors = itemEntries.map((entry, index) => ({
      type: !entry.estimate_sub_type ? "required" : "",
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
  
    const hasFormErrors = Object.values(formErrors).some(err => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.type || err.item || err.qnty || err.qntySqr || err.rate
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
      
      
  
    // If validation passes, proceed with API call
    await onSubmit(formData);
  };
  
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        estimate_year: currentYear,
        estimate_no_of_count: itemEntries.length,
        estimate_sub_data: itemEntries,
      };
      
      // Use the mutation to create the estimate
      createEstimateMutation.mutate(payload);
      
    } catch (error) {
    
      toast({
        title: "Error",
        description: error.message || "Failed to create estimate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/estimate");
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
                <h1 className="text-base font-bold">Add Estimate</h1>
              </button>
              <div className="text-sm font-medium">
                No: <span className="font-bold">{estimateRef}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 border border-green-100 rounded-md p-2">
                <p className="text-xs text-green-800 font-medium">Gross</p>
                <p className="text-sm font-bold">
                  {form.watch("estimate_gross") || 0}
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-md p-2">
                <p className="text-xs text-red-800 font-medium">Balance</p>
                <p className="text-sm font-bold">
                  {form.watch("estimate_balance") || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-14">
            <form   onSubmit={handleFormSubmit} className="space-y-4">
              {/* Customer Info */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="estimate_date">Date</Label>
                    <Input
                      id="estimate_date"
                      type="date"
                      {...form.register("estimate_date")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimate_customer">Customer Name</Label>
                    <Input
                      id="estimate_customer"
                      {...form.register("estimate_customer")}
                      className="mt-1"
                      placeholder="Enter customer name"
                    />
                  
                  </div>
                  <div>
                    <Label htmlFor="estimate_mobile">Mobile No</Label>
                    <Input
                      id="estimate_mobile"
                      {...form.register("estimate_mobile")}
                      className="mt-1"
                      placeholder="Enter mobile number"
                      maxLength={10}
                      onKeyDown={handleKeyDown}
                    />
                   
                  </div>
                  <div>
                    <Label htmlFor="estimate_address">Address</Label>
                    <Input
                      id="estimate_address"
                      {...form.register("estimate_address")}
                      className="mt-1"
                      placeholder="Enter address"
                    />
                    
                  </div>
                  <div>
                    <Label htmlFor="estimate_item_type">Item Type</Label>

                    <SelectShadcn
                      id="estimate_item_type"
                      value={form.watch("estimate_item_type")}
                      onValueChange={(value) =>
                        form.setValue("estimate_item_type", value)
                      }
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
                              placeholder="Item"
                              
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
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
                              
                            />
                          </div>
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
                              
                            />
                          </div>
                        </div>
                        <div className="mt-1">
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
                    <Label htmlFor="estimate_tax">Tax</Label>
                    <Input
                      id="estimate_tax"
                      type="tel"
                      {...form.register("estimate_tax")}
                      onChange={(e) =>
                        handleChargeChange("estimate_tax", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                    />
                   
                  </div>
                  <div>
                    <Label htmlFor="estimate_tempo">Tempo Charges</Label>
                    <Input
                      id="estimate_tempo"
                      type="tel"
                      {...form.register("estimate_tempo")}
                      onChange={(e) =>
                        handleChargeChange("estimate_tempo", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                    />
                   
                  </div>
                  <div>
                    <Label htmlFor="estimate_loading">Loading Charges</Label>
                    <Input
                      id="estimate_loading"
                      type="tel"
                      {...form.register("estimate_loading")}
                      onChange={(e) =>
                        handleChargeChange("estimate_loading", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                    />
                  
                  </div>
                  <div>
                    <Label htmlFor="estimate_other">Other Charges</Label>
                    <Input
                      id="estimate_other"
                      type="tel"
                      {...form.register("estimate_other")}
                      onChange={(e) =>
                        handleChargeChange("estimate_other", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="mt-1"
                    />
                   
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Totals</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="estimate_gross">Gross Total</Label>
                    <Input
                      id="estimate_gross"
                      type="tel"
                      {...form.register("estimate_gross")}
                      disabled
                      onKeyDown={handleKeyDown}
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimate_advance">Advance</Label>
                    <Input
                      id="estimate_advance"
                      type="tel"
                      onKeyDown={handleKeyDown}
                      {...form.register("estimate_advance")}
                      onChange={(e) => handleAdvanceChange(e.target.value)}
                      className="mt-1"
                    />
                  
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="estimate_balance">Balance</Label>
                    <Input
                      id="estimate_balance"
                      type="tel"
                      {...form.register("estimate_balance")}
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
                  <CardTitle>Add Estimate</CardTitle>
                </div>
                <div className="text-sm font-medium">
                  Estimate No: <span className="font-bold">{estimateRef}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form
               onSubmit={handleFormSubmit} 
                className="space-y-2"
              >
                {/* Customer Information */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
                  <div className="space-y-2">
                  <Label htmlFor="estimate_date">
  Date <span className="text-xs text-red-400 ">*</span>
</Label>

                    <Input
                      id="estimate_date"
                      type="date"
                      {...form.register("estimate_date")}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimate_customer">Customer Name <span className="text-xs text-red-400 ">*</span></Label>
                    <Input
                      id="estimate_customer"
                      {...form.register("estimate_customer")}
                      className="bg-white"
                      placeholder="Enter customer name"
                    />
                   
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimate_mobile">Mobile No</Label>
                    <Input
                      id="estimate_mobile"
                      {...form.register("estimate_mobile")}
                      className="bg-white"
                      placeholder="Enter mobile number"
                      maxLength={10}
                      onKeyDown={handleKeyDown}
                    />
                   
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimate_item_type">Item Type <span className="text-xs text-red-400 ">*</span></Label>

                    <SelectShadcn
                      id="estimate_item_type"
                      value={form.watch("estimate_item_type")}
                      onValueChange={(value) =>
                        form.setValue("estimate_item_type", value)
                      }
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
                    <Label htmlFor="estimate_address">Address</Label>
                    <Input
                      id="estimate_address"
                      {...form.register("estimate_address")}
                      className="bg-white"
                      placeholder="Enter address"
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
                          <th className="text-left p-2 font-medium text-sm">Type <span className="text-xs text-red-400 ">*</span></th>
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
                                placeholder="Item"
                              />
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
                        <Label htmlFor="estimate_tax">Tax</Label>
                        <Input
                          id="estimate_tax"
                          type="tel"
                          {...form.register("estimate_tax")}
                          onChange={(e) =>
                            handleChargeChange("estimate_tax", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          placeholder="0"
                        />
                      
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimate_tempo">Tempo Charges</Label>
                        <Input
                          id="estimate_tempo"
                          type="tel"
                          {...form.register("estimate_tempo")}
                          onChange={(e) =>
                            handleChargeChange("estimate_tempo", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                                 placeholder="0"
                        />
                       
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimate_loading">
                          Load/Unload Charges
                        </Label>
                        <Input
                          id="estimate_loading"
                          type="tel"
                          {...form.register("estimate_loading")}
                          onChange={(e) =>
                            handleChargeChange(
                              "estimate_loading",
                              e.target.value
                            )
                          }
                          onKeyDown={handleKeyDown}
                                 placeholder="0"
                        />
                       
                      </div>
                      {/* <div className="space-y-2">
                        <Label htmlFor="estimate_unloading">
                          Unloading Charges
                        </Label>
                        <Input
                          id="estimate_unloading"
                          type="tel"
                          {...form.register("estimate_unloading")}
                          onChange={(e) =>
                            handleChargeChange(
                              "estimate_unloading",
                              e.target.value
                            )
                          }
                        />
                      
                      </div> */}
                      <div className="space-y-2">
                        <Label htmlFor="estimate_other">Other Charges</Label>
                        <Input
                          id="estimate_other"
                          type="tel"
                          {...form.register("estimate_other")}
                          onChange={(e) =>
                            handleChargeChange("estimate_other", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                                 placeholder="0"
                        />
                       
                      </div>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border rounded-lg p-3 bg-white">
                    <h3 className="font-medium mb-2">Totals</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="estimate_gross">Gross Total</Label>
                        <Input
                          id="estimate_gross"
                          type="tel"
                          {...form.register("estimate_gross")}
                          disabled
                          className="bg-gray-100"
                          onKeyDown={handleKeyDown}
                                 placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimate_advance">Advance</Label>
                        <Input
                          id="estimate_advance"
                          type="tel"
                          {...form.register("estimate_advance")}
                          onChange={(e) => handleAdvanceChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                                 placeholder="0"
                        />
                     
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimate_balance">Balance</Label>
                        <Input
                          id="estimate_balance"
                          type="tel"
                          {...form.register("estimate_balance")}
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
                    {isSubmitting ? "Saving..." : "Save Estimate"}
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

export default AddEstimate;
