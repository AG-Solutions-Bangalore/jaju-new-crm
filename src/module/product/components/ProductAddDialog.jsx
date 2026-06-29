import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, SquarePlus } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useCreateProduct } from "../hooks/useProduct";

const ProductAddDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { pathname } = useLocation();
  const createMutation = useCreateProduct();

  const [formData, setFormData] = useState({
    product_type: "",
    product_type_group: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.product_type || !formData.product_type_group) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: (res) => {
        if (res.data.code == 200) {
          setOpen(false);
          setFormData({
            product_type: "",
            product_type_group: "",
          });
        }
      },
    });
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {pathname === "/product" ? (
          <Button
            variant="default"
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            <SquarePlus className="h-4 w-4" /> Product
          </Button>
        ) : pathname === "/create-contract" || pathname === "/create-invoice" ? (
          <p className="text-xs text-blue-600 hover:text-red-800 cursor-pointer">
            <span className="flex items-center flex-row gap-1">
              <SquarePlus className="w-4 h-4" /> <span>Add</span>
            </span>
          </p>
        ) : null}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product_type_group">
              Product Type <span className="text-xs text-red-400 ">*</span>
            </Label>
            <Input
              id="product_type_group"
              name="product_type_group"
              value={formData.product_type_group}
              onChange={handleInputChange}
              placeholder="Enter Product Type "
              maxLength={50}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product_type">
              Product <span className="text-xs text-red-400 ">*</span>
            </Label>
            <Input
              id="product_type"
              name="product_type"
              value={formData.product_type}
              onChange={handleInputChange}
              placeholder="Enter Product Name"
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={` ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAddDialog;
