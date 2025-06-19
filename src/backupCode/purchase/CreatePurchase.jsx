import Page from "@/app/dashboard/page";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchBuyers,
  useFetchCategory,
  useFetchItems,
} from "@/hooks/useApi";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MinusCircle, PlusCircle, SquarePlus } from "lucide-react";
import moment from "moment";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import CreateBuyer from "../../app/master/buyer/CreateBuyer";
import CreateItem from "../../app/master/item/CreateItem";
import { Textarea } from "@/components/ui/textarea";
import { PURCHASE_CREATE } from "@/api";
// Validation Schema

const productRowSchema = z.object({
  purchase_sub_category: z.string().min(1, "Category data is required"),
  purchase_sub_item: z.string().min(1, "item data is required"),
  purchase_sub_size: z.string().min(1, "Size data is required"),
  purchase_sub_brand: z.string().min(1, "Brand data is required"),
  purchase_sub_weight: z.number().min(1, "Weight data is required"),
  purchase_sub_box: z.string().min(1, "Box data is required"),
});

const contractFormSchema = z.object({
  purchase_date: z.string().min(1, "Purchase Date is required"),
  purchase_buyer_name: z.string().min(1, "Buyer Name is required"),
  purchase_buyer_city: z.string().min(1, "City is required"),
  purchase_ref_no: z.string().min(1, "Ref is required"),
  purchase_vehicle_no: z.any().optional(),
  purchase_remark: z.any().optional(),
  purchase_product_data: z.array(productRowSchema),
});

const BranchHeader = () => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Create Purchase</h1>
      </div>
    </div>
  );
};

const createBranch = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${PURCHASE_CREATE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
};

const CreatePurchase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const boxInputRefs = useRef([]);
  const today = moment().format("YYYY-MM-DD");
  const [formData, setFormData] = useState({
    purchase_date: today,
    purchase_buyer_name: "",
    purchase_buyer_city: "",
    purchase_ref_no: "",
    purchase_vehicle_no: "",
    purchase_remark: "",
  });
  const [invoiceData, setInvoiceData] = useState([
    {
      purchase_sub_category: "",
      purchase_sub_item: "",
      purchase_sub_size: "",
      purchase_sub_brand: "",
      invoicePSub_bank_c: "",
      purchase_sub_weight: "",
      purchase_sub_box: "",
    },
  ]);
  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        purchase_sub_category: "",
        purchase_sub_item: "",
        purchase_sub_size: "",
        purchase_sub_brand: "",
        invoicePSub_bank_c: "",
        purchase_sub_weight: "",
        purchase_sub_box: "",
      },
    ]);
  }, []);
  const removeRow = useCallback(
    (index) => {
      if (invoiceData.length > 1) {
        setInvoiceData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [invoiceData.length]
  );
  const focusBoxInput = (rowIndex) => {
    if (boxInputRefs.current[rowIndex]) {
      boxInputRefs.current[rowIndex].focus();
    }
  };
  const createBranchMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/purchase");
      } else if (response.code == 400) {
        toast({
          title: "Duplicate Entry",
          description: response.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: response.msg || "Something unexpected happened.",
          variant: "destructive",
        });
      }
      setFormData({
        purchase_date: "",
        purchase_buyer_name: "",
        purchase_buyer_city: "",
        purchase_ref_no: "",
        purchase_vehicle_no: "",
        purchase_remark: "",
      });

      setInvoiceData([
        {
          purchase_sub_category: "",
          purchase_sub_item: "",
          purchase_sub_size: "",
          purchase_sub_brand: "",
          invoicePSub_bank_c: "",
          purchase_sub_weight: "",
          purchase_sub_box: "",
        },
      ]);
    },
    onError: (error) => {
      console.error("API Error:", error);

      toast({
        title: "Error",
        description: error.msg || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const { data: buyerData } = useFetchBuyers();
  const { data: itemsData } = useFetchItems();

  const handlePaymentChange = (selectedValue, rowIndex, fieldName) => {
    let value;

    if (selectedValue && selectedValue.target) {
      value = selectedValue.target.value;
    } else {
      value = selectedValue;
    }

    console.log("Selected Value:", value);

    const updatedData = [...invoiceData];

    if (fieldName === "purchase_sub_item") {
      updatedData[rowIndex][fieldName] = value;

      const selectedItem = itemsData?.items?.find(
        (item) => item.item_name === value
      );

      if (selectedItem) {
        updatedData[rowIndex]["purchase_sub_category"] =
          selectedItem.item_category;
        updatedData[rowIndex]["purchase_sub_size"] = selectedItem.item_size;
        updatedData[rowIndex]["purchase_sub_brand"] = selectedItem.item_brand;
        updatedData[rowIndex]["purchase_sub_weight"] = selectedItem.item_weight;
      }
      focusBoxInput(rowIndex);
      setInvoiceData(updatedData);
    } else {
      if (["purchase_sub_weight", "purchase_sub_box"].includes(fieldName)) {
        if (!/^\d*$/.test(value)) {
          console.log("Invalid input. Only digits are allowed.");
          return;
        }
      }

      updatedData[rowIndex][fieldName] = value;
      setInvoiceData(updatedData);
    }
  };

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;

    let updatedFormData = { ...formData, [field]: value };

    if (field === "purchase_buyer_name") {
      const selectedBuyer = buyerData?.buyers.find(
        (buyer) => buyer.buyer_name === value
      );

      if (selectedBuyer) {
        updatedFormData.purchase_buyer_city = selectedBuyer.buyer_city;
      } else {
        updatedFormData.purchase_buyer_city = "";
      }
    }

    setFormData(updatedFormData);
  };

  const fieldLabels = {
    purchase_date: "Purchase Date",
    purchase_buyer_name: "Buyer Name",
    purchase_buyer_city: "Buyer City",
    purchase_ref_no: "Bill Ref No",
    purchase_vehicle_no: "Vehicle No",
    purchase_sub_category: "Category",
    purchase_sub_item: "Item",
    purchase_sub_size: "Size",
    purchase_sub_brand: "Brand",
    purchase_sub_weight: "Weight",
    purchase_sub_box: "Box",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validatedData = contractFormSchema.parse({
        ...formData,
        purchase_product_data: invoiceData,
      });

      createBranchMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) acc[field] = [];
          acc[field].push(err.message);
          return acc;
        }, {});

        const errorMessages = Object.entries(groupedErrors).map(
          ([field, messages]) => {
            const fieldKey = field.split(".").pop();
            const label = fieldLabels[fieldKey] || field;
            return `${label}: ${messages.join(", ")}`;
          }
        );

        toast({
          title: "Validation Error",
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Page>
      <div className="p-0 md:p-4">

        <div className="sm:hidden bg-gradient-to-b from-yellow-50 to-white min-h-screen">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Premium Header Section */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute top-10 -right-20 w-40 h-40 bg-white/5 rounded-full"></div>

              <div className="flex items-center px-4 py-5 relative z-10">
                <button
                  type="button"
                  onClick={() => navigate("/purchase")}
                  className="p-1.5 bg-white/20 rounded-full text-white mr-3 shadow-sm hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold tracking-wide">Create Purchase</h1>
                  <p className="text-xs text-yellow-100 mt-0.5 opacity-90">Add new purchase details</p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-2">
              {/* Date and Buyer Row */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-yellow-100">
                <div className="mb-4">
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                    Date<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                    value={formData.purchase_date}
                    onChange={(e) => handleInputChange(e, "purchase_date")}
                    type="date"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                      Buyer<span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      className="flex items-center text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded-full"
                    >
                      <SquarePlus className="h-3 w-3 mr-1" />
                      <CreateBuyer />
                    </button>
                  </div>
                  <MemoizedSelect
                    value={formData.purchase_buyer_name}
                    onChange={(e) => handleInputChange(e, "purchase_buyer_name")}
                    options={
                      buyerData?.buyers?.map((buyer) => ({
                        value: buyer.buyer_name,
                        label: buyer.buyer_name,
                      })) || []
                    }
                    placeholder="Select Buyer"
                    className="bg-white focus:ring-2 focus:ring-yellow-300"
                  />
                </div>

                <div className="mb-4">
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                    City<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="sm:bg-white border border-gray-300 rounded-lg w-full bg-gray-50"
                    value={formData.purchase_buyer_city}
                    disabled
                    placeholder="City auto-filled from buyer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                      Ref No<span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                      value={formData.purchase_ref_no}
                      onChange={(e) => handleInputChange(e, "purchase_ref_no")}
                      placeholder="Ref No"
                    />
                  </div>
                  <div>
                    <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <span className="w-1 h-4 bg-gray-300 rounded-full mr-2"></span>
                      Vehicle No
                    </label>
                    <Input
                      className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                      value={formData.purchase_vehicle_no}
                      onChange={(e) => handleInputChange(e, "purchase_vehicle_no")}
                      placeholder="Vehicle No"
                    />
                  </div>
                </div>

                <div>
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="w-1 h-4 bg-gray-300 rounded-full mr-2"></span>
                    Remark
                  </label>
                  <Textarea
                    className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                    value={formData.purchase_remark}
                    onChange={(e) => handleInputChange(e, "purchase_remark")}
                    placeholder="Add any notes here"
                    rows={2}
                  />
                </div>
              </div>

              {/* Items Section  Table */}
              <div className="bg-white rounded-xl shadow-sm p-2 mb-4 border border-yellow-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="w-1.5 h-5 bg-yellow-500 rounded-full mr-2"></span>
                    <h2 className="text-base font-semibold text-gray-800">Items</h2>
                    <button
                      type="button"
                      className="flex items-center text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded-full"
                    >
                      <SquarePlus className="h-3 w-3 mr-1" />
                      <CreateItem />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs shadow-sm hover:bg-yellow-600 transition-colors"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add Item
                  </button>
                </div>

                {/*  Item Table */}
                <div className="overflow-hidden rounded-xl border border-yellow-200">
                  <Table className="w-full border-collapse">
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Item
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Box<span className="text-red-500 ml-1">*</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceData.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors relative"
                        >
                          <TableCell className="px-3 py-2.5 w-48">
                            <MemoizedProductSelect
                              value={row.purchase_sub_item}
                              onChange={(e) =>
                                handlePaymentChange(e, rowIndex, "purchase_sub_item")
                              }
                              options={
                                itemsData?.items?.map((product) => ({
                                  value: product.item_name,
                                  label: product.item_name,
                                })) || []
                              }
                              placeholder="Select Item"
                              className="text-xs"
                            />
                            {row.purchase_sub_item && (
                              <div className="text-xs text-gray-600 mt-1 flex items-center">
                                <span className="bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-800">{row.purchase_sub_category}</span>
                                {/* <span className="mx-1">•</span> */}
                                {/* <span>{row.purchase_sub_size}</span> */}
                              </div>
                            )}

                            {/* Action button moved to absolute position */}
                            <button
                              type="button"
                              onClick={() => removeRow(rowIndex)}
                              disabled={invoiceData.length === 1}
                              className={`absolute top-2 right-2 rounded-full p-1 ${invoiceData.length === 1 ? 'bg-gray-200 text-gray-400' : 'bg-red-100 text-red-500'}`}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                          </TableCell>

                          <TableCell className="px-3 py-2.5">
                            <Input
                              ref={(el) => (boxInputRefs.current[rowIndex] = el)}
                              className="bg-white border border-gray-300 w-full text-xs"
                              value={row.purchase_sub_box}
                              onChange={(e) =>
                                handlePaymentChange(e, rowIndex, "purchase_sub_box")
                              }
                              placeholder="Qty"
                              type="number"
                            />
                            {row.purchase_sub_item && (
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">{row.purchase_sub_brand}</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Item count  */}
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                  Total Items: {invoiceData.length}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mb-20">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-700 hover:to-yellow-500 text-white font-bold py-3.5 rounded-xl shadow-md transition-all transform hover:scale-[0.99]"
                  disabled={createBranchMutation.isPending}
                >
                  {createBranchMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⟳</span>
                      Processing...
                    </div>
                  ) : (
                    "CREATE PURCHASE"
                  )}
                </Button>
              </div>

       
              <div className="h-4"></div>
            </div>
          </form>
        </div>

        <div className="hidden sm:block">
          <form onSubmit={handleSubmit} className="w-full ">
            <BranchHeader />
            <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Date<span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.purchase_date}
                        onChange={(e) => handleInputChange(e, "purchase_date")}
                        placeholder="Enter Payment Date"
                        type="date"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block ${ButtonConfig.cardLabel} text-sm mb-1 font-medium flex justify-between items-center`}
                    >
                      <span className="flex items-center">
                        Buyer <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <SquarePlus className="h-3 w-3 text-red-600" />
                        <CreateBuyer />
                      </span>
                    </label>
                    <MemoizedSelect
                      value={formData.purchase_buyer_name}
                      onChange={(e) => handleInputChange(e, "purchase_buyer_name")}
                      options={
                        buyerData?.buyers?.map((buyer) => ({
                          value: buyer.buyer_name,
                          label: buyer.buyer_name,
                        })) || []
                      }
                      placeholder="Select Buyer"
                    />
                  </div>

                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        City<span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.purchase_buyer_city}
                        disabled
                        onChange={(e) =>
                          handleInputChange(e, "purchase_buyer_city")
                        }
                        placeholder="Enter City"
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Ref No<span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.purchase_ref_no}
                        onChange={(e) => handleInputChange(e, "purchase_ref_no")}
                        placeholder="Enter Ref No"
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Vehicle No
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.purchase_vehicle_no}
                        onChange={(e) =>
                          handleInputChange(e, "purchase_vehicle_no")
                        }
                        placeholder="Enter Vehicle No"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Remark
                      </label>
                      <Textarea
                        className="bg-white"
                        value={formData.purchase_remark}
                        onChange={(e) => handleInputChange(e, "purchase_remark")}
                        placeholder="Enter Remark"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1">
                  <Table className="border border-gray-300 rounded-lg shadow-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                          <div className="flex items-center">
                            <SquarePlus className="h-3 w-3 mr-1 text-red-600" />
                            <CreateItem />
                          </div>
                        </TableHead>

                        <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
                          Box<span className="text-red-500 ml-1">*</span>
                        </TableHead>
                        <TableHead className="text-sm font-semibold py-3 px-4 w-1/6 text-center">
                          Action
                          <PlusCircle
                            onClick={addRow}
                            className="inline-block ml-2 cursor-pointer text-blue-500 hover:text-gray-800 h-4 w-4"
                          />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceData.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="px-4 py-2">
                            <div>
                              <MemoizedProductSelect
                                value={row.purchase_sub_item}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "purchase_sub_item"
                                  )
                                }
                                options={
                                  itemsData?.items?.map((product) => ({
                                    value: product.item_name,
                                    label: product.item_name,
                                  })) || []
                                }
                                placeholder="Select Item"
                              />
                            </div>
                            {row.purchase_sub_item && (
                              <div className="text-sm text-black mt-1">
                                •{row.purchase_sub_category} •{" "}
                                {row.purchase_sub_size}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="px-4 py-2 min-w-28 ">
                            <Input
                            
                              className="bg-white border border-gray-300"
                              value={row.purchase_sub_box}
                              onChange={(e) =>
                                handlePaymentChange(e, rowIndex, "purchase_sub_box")
                              }
                              placeholder="Enter Box"
                              type="number"
                            />
                            {row.purchase_sub_item && (
                              <div className="text-sm text-black mt-1">
                                • {row.purchase_sub_brand}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="p-2 border">
                            <Button
                              variant="ghost"
                              onClick={() => removeRow(rowIndex)}
                              disabled={invoiceData.length === 1}
                              className="text-red-500 "
                              type="button"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-row items-center gap-2 justify-end ">
              <Button
                type="submit"
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
                disabled={createBranchMutation.isPending}
              >
                {createBranchMutation.isPending
                  ? "Submitting..."
                  : "Create Purchase"}
              </Button>
              <Button
                type="button"
                onClick={() => { navigate('/purchase') }}
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
              >
                Go Back
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Page>
  );
};

export default CreatePurchase;
