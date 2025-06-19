import { fetchSalesById, updateSalesEdit } from "@/api";
import Page from "@/app/dashboard/page";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchBuyers,
  useFetchCategory,
  useFetchItems,
} from "@/hooks/useApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, MinusCircle, PlusCircle, SquarePlus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import CreateBuyer from "../../app/master/buyer/CreateBuyer";
import SalesTable from "./SalesTable";
import CreateItem from "../../app/master/item/CreateItem";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
// Validation Schema

const BranchHeader = () => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Edit Dispatch</h1>
      </div>
    </div>
  );
};

const EditSales = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const userType = localStorage.getItem('userType');
  const [itemData, setItemData] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [formData, setFormData] = useState({
    sales_date: "",
    sales_buyer_name: "",
    sales_buyer_city: "",
    sales_ref_no: "",
    sales_vehicle_no: "",
    sales_remark: "",
    sales_status: "",
  });
  const [invoiceData, setInvoiceData] = useState([
    {
      sales_sub_category: "",
      sales_sub_item: "",
      sales_sub_size: "",
      sales_sub_brand: "",
      sales_sub_weight: "",
      sales_sub_box: "",
      id: "",
    },
  ]);
  const createBranchMutation = useMutation({
    mutationFn: (updateData) => updateSalesEdit(id, updateData),
    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/dispatch");
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
  const { data: categoryData } = useFetchCategory();
  const { data: itemsData } = useFetchItems();

  const {
    data: SalesId,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["salesByid", id],
    queryFn: () => fetchSalesById(id),
  });

  useEffect(() => {
    if (itemsData && categoryData) {
      if (SalesId?.sales) {
        // Set form data
        setFormData({
          sales_date: SalesId.sales.sales_date || "",
          sales_buyer_name: SalesId.sales.sales_buyer_name || "",
          sales_buyer_city: SalesId.sales.sales_buyer_city || "",
          sales_ref_no: SalesId.sales.sales_ref_no || "",
          sales_vehicle_no: SalesId.sales.sales_vehicle_no || "",
          sales_remark: SalesId.sales.sales_remark || "",
          sales_status: SalesId.sales.sales_status || "",
        });

        if (Array.isArray(SalesId.salesSub)) {
          const mappedData = SalesId.salesSub.map((sub, index) => {
            return {
              id: sub.id || "",
              sales_sub_category: sub.sales_sub_category || "",
              sales_sub_item: sub.sales_sub_item || "",
              sales_sub_size: sub.sales_sub_size || "",
              sales_sub_brand: sub.sales_sub_brand || "",
              sales_sub_weight: sub.sales_sub_weight || "",
              sales_sub_box: sub.sales_sub_box || 0,
            };
          });

          console.log("Final mapped invoiceData:", mappedData);
          setInvoiceData(mappedData);
        } else {
          console.warn("sale_sub is missing or not an array");
          setInvoiceData([
            {
              sales_sub_category: "",
              sales_sub_item: "",
              sales_sub_size: "",
              sales_sub_brand: "",
              sales_sub_weight: "",
              sales_sub_box: "",
            },
          ]);
        }
      }
    }
  }, [SalesId, itemsData, categoryData]);

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;

    let updatedFormData = { ...formData, [field]: value };

    if (field === "sales_buyer_name") {
      const selectedBuyer = buyerData?.buyers.find(
        (buyer) => buyer.buyer_name === value
      );

      if (selectedBuyer) {
        updatedFormData.sales_buyer_city = selectedBuyer.buyer_city;
      } else {
        updatedFormData.sales_buyer_city = "";
      }
    }

    setFormData(updatedFormData);
  };
  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        sales_sub_category: "",
        sales_sub_item: "",
        sales_sub_size: "",
        sales_sub_brand: "",
        invoicePSub_bank_c: "",
        sales_sub_weight: "",
        sales_sub_box: "",
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
  const fieldLabels = {
    sales_date: " Invoice Ref",
    sales_buyer_name: "Payment Date",
  };
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const handlePaymentChange = (
    selectedValue,
    rowIndex,
    fieldName
  ) => {
    let value;

    if (selectedValue && selectedValue.target) {
      value = selectedValue.target.value;
    } else {
      value = selectedValue;
    }

    console.log("Selected Value:", value);

    const updatedData = [...invoiceData];

    if (fieldName === "sales_sub_item") {
      updatedData[rowIndex][fieldName] = value;

      const selectedItem = itemsData?.items?.find(
        (item) => item.item_name === value
      );

      if (selectedItem) {
        updatedData[rowIndex]["sales_sub_category"] =
          selectedItem.item_category;
        updatedData[rowIndex]["sales_sub_size"] =
          selectedItem.item_size;
        updatedData[rowIndex]["sales_sub_brand"] =
          selectedItem.item_brand;
        updatedData[rowIndex]["sales_sub_weight"] =
          selectedItem.item_weight;
      }

      setInvoiceData(updatedData);
    } else {
      if (["sales_sub_weight", "sales_sub_box"].includes(fieldName)) {
        if (!/^\d*$/.test(value)) {
          console.log("Invalid input. Only digits are allowed.");
          return;
        }
      }

      updatedData[rowIndex][fieldName] = value;
      setInvoiceData(updatedData);
    }
  };
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/sales-sub/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete Purchase Table");

      return response.json();
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        toast({
          title: "Success",
          description: data.msg,
        });
        refetch();
      } else if (data.code === 400) {
        toast({
          title: "Duplicate Entry",
          description: data.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: data.msg || "Something unexpected happened.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const confirmDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(deleteItemId);
      setContractData((prevData) =>
        prevData.filter((row) => row.id !== deleteItemId)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingFields = [];
    if (!formData.sales_date) missingFields.push("Date");
    if (!formData.sales_buyer_name) missingFields.push("Name");
    if (!formData.sales_buyer_city) missingFields.push("Buyer");
    if (!formData.sales_ref_no) missingFields.push("Ref No");
    if (!formData.sales_status) missingFields.push("Status");
    invoiceData.forEach((row, index) => {
      if (!row.sales_sub_category)
        missingFields.push(`Row ${index + 1}: Category`);
      if (!row.sales_sub_item) missingFields.push(`Row ${index + 1}: Item`);
      if (!row.sales_sub_size) missingFields.push(`Row ${index + 1}: Size`);
      if (!row.sales_sub_brand) missingFields.push(`Row ${index + 1}: Brand`);
      if (!row.sales_sub_weight) missingFields.push(`Row ${index + 1}: Weight`);
      if (!row.sales_sub_box) missingFields.push(`Row ${index + 1}: Box`);
    });

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    try {
      const updateData = {
        ...formData,
        sales_product_data: invoiceData,
      };
      createBranchMutation.mutate(updateData);
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
        return;
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
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
                  <h1 className="text-xl font-bold tracking-wide">Update Dispatch</h1>
                  <p className="text-xs text-yellow-100 mt-0.5 opacity-90">Modify existing dispatch details</p>
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
                    value={formData.sales_date}
                    onChange={(e) => handleInputChange(e, "sales_date")}
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
                    value={formData.sales_buyer_name}
                    onChange={(e) => handleInputChange(e, "sales_buyer_name")}
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
                    value={formData.sales_buyer_city}
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
                      value={formData.sales_ref_no}
                      onChange={(e) => handleInputChange(e, "sales_ref_no")}
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
                      value={formData.sales_vehicle_no}
                      onChange={(e) => handleInputChange(e, "sales_vehicle_no")}
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
                    value={formData.sales_remark}
                    onChange={(e) => handleInputChange(e, "sales_remark")}
                    placeholder="Add any notes here"
                    rows={2}
                  />
                </div>
                {/* <div className="mb-2 mt-2">
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className={`w-1 h-4 ${formData.sales_status == "Active" ? "bg-green-500" :"bg-gray-500"} rounded-full mr-2`}></span>
                    Status<span className="text-red-500">*</span>
                  </label>
                 
                   <Select
                      value={formData.sales_status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, sales_status: value }))
                      }
                    >
                      <SelectTrigger className="bg-white border border-gray-300 rounded-lg">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="Active">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="Inactive">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                </div> */}
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
                              value={row.sales_sub_item}
                              onChange={(e) =>
                                handlePaymentChange(e, rowIndex, "sales_sub_item")
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
                            {row.sales_sub_item && (
                              <div className="text-xs text-gray-600 mt-1 flex items-center">
                                <span className="bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-800">{row.sales_sub_category}</span>
                                {/* <span className="mx-1">•</span> */}
                                {/* <span>{row.sales_sub_size}</span> */}
                              </div>
                            )}

                            {/* Action button moved to absolute position */}
                            {row.id ? (
                                 userType == 2 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                             
                              className={`absolute top-2 right-2 rounded-full p-1  bg-red-200 text-red-500`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                                 )
 ) : (
                            <button
                              type="button"
                              onClick={() => removeRow(rowIndex)}
                              disabled={invoiceData.length === 1}
                              className={`absolute top-2 right-2 rounded-full p-1 ${invoiceData.length === 1 ? 'bg-gray-200 text-gray-400' : 'bg-red-100 text-red-500'}`}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
       )}

                          </TableCell>

                          <TableCell className="px-3 py-2.5">
                            <Input
                              // ref={(el) => (boxInputRefs.current[rowIndex] = el)}
                              className="bg-white border border-gray-300 w-full text-xs"
                              value={row.sales_sub_box}
                              onChange={(e) =>
                                handlePaymentChange(e, rowIndex, "sales_sub_box")
                              }
                              placeholder="Qty"
                              type="number"
                            />
                            {row.sales_sub_item && (
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">{row.sales_sub_brand}</span>
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
                    "UPDATE DISPATCH"
                  )}
                </Button>
              </div>


              <div className="h-4"></div>
            </div>
          </form>
        </div>







      <div className="hidden sm:block">
      <form onSubmit={handleSubmit} className="w-full  grid grid-cols-1">
        <BranchHeader />
        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            <div className="grid-cols-1 md:grid md:grid-cols-4 gap-2">
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Date<span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.sales_date}
                  onChange={(e) => handleInputChange(e, "sales_date")}
                  placeholder="Enter Sales Date"
                  type="date"
                />
              </div>
              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-3  font-medium flex justify-between items-center`}
                >
                  <span className="flex items-center space-x-1">
                    <SquarePlus className="h-3 w-3 text-red-600" />
                    <CreateBuyer />
                  </span>
                </label>
                <MemoizedSelect
                  value={formData.sales_buyer_name}
                  onChange={(e) => handleInputChange(e, "sales_buyer_name")}
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
                    value={formData.sales_buyer_city}
                    onChange={(e) => handleInputChange(e, "sales_buyer_city")}
                    placeholder="Enter City"
                    disabled
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
                    value={formData.sales_ref_no}
                    onChange={(e) => handleInputChange(e, "sales_ref_no")}
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
                    value={formData.sales_vehicle_no}
                    onChange={(e) => handleInputChange(e, "sales_vehicle_no")}
                    placeholder="Enter Vehicle No"
                  />
                </div>
              </div>
              <div className="col-span-3">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Remark
                  </label>
                  <Textarea
                    className="bg-white"
                    value={formData.sales_remark}
                    onChange={(e) => handleInputChange(e, "sales_remark")}
                    placeholder="Enter Remark"
                  />
                </div>
              </div>

              {/* <div className="grid gap-1">
                <label htmlFor="sales_status" className="text-sm font-medium">
                  Status<span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.sales_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, sales_status: value }))
                  }
                >
                  <SelectTrigger className="bg-white border border-gray-300 rounded-md">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-md">
                    <SelectItem value="Active">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="Inactive">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </div>
            <SalesTable
              invoiceData={invoiceData}
              itemData={itemData}
              setInvoiceData={setInvoiceData}
              addRow={addRow}
              itemsData={itemsData}
              handleDeleteRow={handleDeleteRow}
              removeRow={removeRow}
              userType={userType}
            />
          </CardContent>
        </Card>

        <div className="flex flex-row items-center gap-2 justify-end">
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={invoiceData.length < 1 || createBranchMutation.isPending}
          >
            {createBranchMutation.isPending
              ? "Submitting..."
              : "Update Dispatch"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              navigate("/dispatch");
            }}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
          >
            Go Back
          </Button>
        </div>
      </form>

      </div>

      </div>


      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Dispatch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default EditSales;
