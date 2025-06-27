import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Edit, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Cookies from "js-cookie";

const ProductEdit = ({ productId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    product_type: "",
    product_type_group: "",
    product_type_status: ""
  });

  const fetchProductData = async () => {
    setIsFetching(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/web-fetch-product-type-by-id/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const prodData = response.data.product_type;
      setFormData({
        product_type: prodData.product_type,
        product_type_group: prodData.product_type_group,
        product_type_status: prodData.product_type_status,
      
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product data",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProductData();
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      product_type_status: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.product_type ||
      !formData.product_type_group ||
      !formData.product_type_status
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/web-update-product-type/${productId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

     
    if (response?.data.code == 200) {
    
      toast({
        title: "Success",
        description: response.data.msg
      });

     
      await queryClient.invalidateQueries(["productType"]);
      setOpen(false);
    } else {
     
      toast({
        title: "Error",
        description: response.data.msg,
        variant: "destructive",
      });
    }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
           <Button variant="ghost" size="icon">
             <Edit className="h-4 w-4" />
           </Button>
         </DialogTrigger> */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-200 ${
                  isHovered ? "bg-blue-50" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Edit
                  className={`h-4 w-4 transition-all duration-200 ${
                    isHovered ? "text-blue-500" : ""
                  }`}
                />
              </Button>
            
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Product</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product_type">Product Type <span className="text-xs text-red-400 ">*</span></Label>
              <Input
                id="product_type"
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                placeholder="Enter Product Type "
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product_type_group">Product <span className="text-xs text-red-400 ">*</span></Label>
              <Input
                id="product_type_group"
                name="product_type_group"
                value={formData.product_type_group}
                onChange={handleInputChange}
                placeholder="Enter Product"
              />
            </div>

           
            <div className="grid gap-2">
              <Label htmlFor="product_type_status">Status <span className="text-xs text-red-400 ">*</span></Label>
            
              <Tabs 
  value={formData.product_type_status}
  onValueChange={handleStatusChange}

>
  <TabsList className="grid w-full grid-cols-2 h-8">
    <TabsTrigger 
      value="Active"
      className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
    >
      Active
    </TabsTrigger>
    <TabsTrigger 
      value="Inactive"
      className="data-[state=active]:bg-gray-400 data-[state=active]:text-black"
    >
      Inactive
    </TabsTrigger>
  </TabsList>
</Tabs>

            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEdit;
