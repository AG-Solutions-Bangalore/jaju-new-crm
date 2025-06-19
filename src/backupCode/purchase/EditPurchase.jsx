import Page from "@/app/dashboard/page";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
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
import { Textarea } from "@/components/ui/textarea";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, MinusCircle, PlusCircle, SquarePlus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import CreateBuyer from "../../app/master/buyer/CreateBuyer";
import CreateItem from "../../app/master/item/CreateItem";
import { decryptId } from "@/components/common/Encryption";
import { fetchPurchaseById, updatePurchaseEdit } from "@/api";
// Validation Schema

const BranchHeader = () => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Edit Purchase</h1>
      </div>
    </div>
  );
};


const EditPurchase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  // const decryptedId = decryptId(id);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const userType = localStorage.getItem('userType');
  const [formData, setFormData] = useState({
    purchase_date: "",
    purchase_buyer_name: "",
    purchase_buyer_city: "",
    purchase_ref_no: "",
    purchase_vehicle_no: "",
    purchase_status: "",
    purchase_remark: "",
  });
  const [invoiceData, setInvoiceData] = useState([
    {
      purchase_sub_category: "",
      purchase_sub_item: "",
      purchase_sub_size: "",
      purchase_sub_brand: "",
      purchase_sub_weight: 0,
      purchase_sub_box: 0,
      id: "",
    },
  ]);

  const createBranchMutation = useMutation({
    mutationFn: (updateData) => updatePurchaseEdit(id, updateData),
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
  const fetchBuyer = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/api/buyers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch buyer data");
    return response.json();
  };

  const { data: buyerData } = useQuery({
    queryKey: ["buyer"],
    queryFn: fetchBuyer,
  });

  const { data: categoryData } = useQuery({
    queryKey: ["categorys"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/categorys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch categorys");
      return response.json();
    },
  });
  const { data: itemsData } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
  });

  const {
    data: purchaseByid,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchaseByid", id],
    queryFn: () => fetchPurchaseById(id)
  });

  useEffect(() => {
    if (itemsData && categoryData) {
      if (purchaseByid?.purchase) {
        // Set form data
        setFormData({
          purchase_date: purchaseByid.purchase.purchase_date || "",
          purchase_buyer_name: purchaseByid.purchase.purchase_buyer_name || "",
          purchase_buyer_city: purchaseByid.purchase.purchase_buyer_city || "",
          purchase_ref_no: purchaseByid.purchase.purchase_ref_no || "",
          purchase_vehicle_no: purchaseByid.purchase.purchase_vehicle_no || "",
          purchase_remark: purchaseByid.purchase.purchase_remark || "",
          purchase_status: purchaseByid.purchase.purchase_status || "",
        });

        if (Array.isArray(purchaseByid.purchaseSub)) {
          const mappedData = purchaseByid.purchaseSub.map((sub, index) => {
            return {
              id: sub.id || "",
              purchase_sub_category: sub.purchase_sub_category || "",
              purchase_sub_item: sub.purchase_sub_item || "",
              purchase_sub_size: sub.purchase_sub_size || "",
              purchase_sub_brand: sub.purchase_sub_brand || "",
              purchase_sub_weight: sub.purchase_sub_weight || 1,
              purchase_sub_box: sub.purchase_sub_box || 0,
            };
          });

          setInvoiceData(mappedData);
        } else {
          console.warn("purchase_sub is missing or not an array");
          setInvoiceData([
            {
              purchase_sub_category: "",
              purchase_sub_item: "",
              purchase_sub_size: "",
              purchase_sub_brand: "",
              purchase_sub_weight: 1,
              purchase_sub_box: 0,
            },
          ]);
        }
      }
    }
  }, [purchaseByid, itemsData, categoryData]);

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
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/purchases-sub/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete Purchase Table");

      return response.json(); // Ensure response is returned as JSON
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
    if (!formData.purchase_date) missingFields.push("Purchase Date");
    if (!formData.purchase_buyer_name) missingFields.push("Buyer Name");
    if (!formData.purchase_buyer_city) missingFields.push("Buyer City");
    if (!formData.purchase_ref_no) missingFields.push("Bill Ref No");
    if (!formData.purchase_status) missingFields.push("Status");
    invoiceData.forEach((row, index) => {
      if (!row.purchase_sub_category)
        missingFields.push(`Row ${index + 1}: Category`);
      if (!row.purchase_sub_item) missingFields.push(`Row ${index + 1}: Item`);
      if (!row.purchase_sub_size) missingFields.push(`Row ${index + 1}: Size`);
      if (!row.purchase_sub_brand)
        missingFields.push(`Row ${index + 1}: Brand`);
      if (!row.purchase_sub_weight)
        missingFields.push(`Row ${index + 1}: Weight`);
      if (!row.purchase_sub_box) missingFields.push(`Row ${index + 1}: Box`);
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
        purchase_product_data: invoiceData,
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
                  <h1 className="text-xl font-bold tracking-wide">Update Purchase</h1>
                  <p className="text-xs text-yellow-100 mt-0.5 opacity-90">Modify existing purchase details</p>
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

                <div >
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
                {/* <div className="mb-2 mt-2">
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className={`w-1 h-4 ${formData.purchase_status == "Active" ? "bg-green-500" :"bg-gray-500"} rounded-full mr-2`}></span>
                    Status<span className="text-red-500">*</span>
                  </label>
                 
                   <Select
                      value={formData.purchase_status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, purchase_status: value }))
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
                            {row.id  ? (
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
                    "UPDATE PURCHASE"
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
                      className={`block ${ButtonConfig.cardLabel} text-sm mb-3  font-medium flex justify-between items-center`}
                    >
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
                        onChange={(e) =>
                          handleInputChange(e, "purchase_buyer_city")
                        }
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

                  {/* <div className="grid gap-1">
                    <label
                      htmlFor="purchase_status"
                      className="text-sm font-medium"
                    >
                      Status<span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.purchase_status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, purchase_status: value }))
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

                <div className="mt-4 grid grid-cols-1 overflow-x-auto">
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
                          Box
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
                                // key={row.purchase_sub_item}
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
                            <TableCell className="p-2 ">
                              {row.id ? (
                                  userType == 2 && (
                                <Button
                                  variant="ghost"
                                  onClick={() => handleDeleteRow(row.id)}
                                  className="text-red-500"
                                  type="button"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                  )
                              ) : (
                                <Button
                                  variant="ghost"
                                  onClick={() => removeRow(rowIndex)}
                                  disabled={invoiceData.length === 1}
                                  className="text-red-500 "
                                  type="button"
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                  : "Update Purchase"}
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
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              purchase.
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

export default EditPurchase;