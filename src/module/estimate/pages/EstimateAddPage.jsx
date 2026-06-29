import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import useNumericInput from "@/hooks/useNumericInput";
import {
  useCurrentYear,
  useProductTypeGroup,
  useLatestEstimateRef,
  useCreateEstimate,
} from "../hooks/useEstimate";
import MobileEstimateForm from "../components/MobileEstimateForm";
import DesktopEstimateForm from "../components/DesktopEstimateForm";

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
  estimate_other1: z.string(),
  estimate_gross: z.string(),
  estimate_advance: z.string(),
  estimate_balance: z.string(),
  estimate_temp_amount: z.string(),
});

const EstimateAddPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Hooks
  const { data: currentYear } = useCurrentYear();
  const { data: productTypeGroup = [] } = useProductTypeGroup();
  const { data: estimateRef = "" } = useLatestEstimateRef();
  const createMutation = useCreateEstimate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimate_date: moment().format("YYYY-MM-DD"),
      estimate_year: currentYear || "",
      estimate_customer: "",
      estimate_address: "",
      estimate_mobile: "",
      estimate_item_type: "",
      estimate_tax: "",
      estimate_tempo: "",
      estimate_loading: "",
      estimate_unloading: "",
      estimate_other: "",
      estimate_other1: "",
      estimate_gross: "",
      estimate_advance: "",
      estimate_balance: "",
      estimate_temp_amount: "",
    },
  });

  useEffect(() => {
    if (currentYear) {
      form.setValue("estimate_year", currentYear);
    }
  }, [currentYear, form]);

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
      0,
    );
    const chargesTotal =
      parseFloat(form.watch("estimate_tax") || 0) +
      parseFloat(form.watch("estimate_tempo") || 0) +
      parseFloat(form.watch("estimate_loading") || 0) +
      parseFloat(form.watch("estimate_unloading") || 0) +
      parseFloat(form.watch("estimate_other") || 0) +
      parseFloat(form.watch("estimate_other1") || 0);

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
      0,
    );
    const chargesTotal =
      parseFloat(form.watch("estimate_tax") || 0) +
      parseFloat(form.watch("estimate_tempo") || 0) +
      parseFloat(form.watch("estimate_loading") || 0) +
      parseFloat(form.watch("estimate_unloading") || 0) +
      parseFloat(form.watch("estimate_other") || 0) +
      parseFloat(form.watch("estimate_other1") || 0);

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
      0,
    );
    const chargesTotal =
      parseFloat(form.watch("estimate_tax") || 0) +
      parseFloat(form.watch("estimate_tempo") || 0) +
      parseFloat(form.watch("estimate_loading") || 0) +
      parseFloat(form.watch("estimate_unloading") || 0) +
      parseFloat(form.watch("estimate_other") || 0) +
      parseFloat(form.watch("estimate_other1") || 0);

    const newGross = itemsTotal + chargesTotal;
    form.setValue("estimate_gross", newGross.toString());

    const newBalance =
      newGross - parseFloat(form.watch("estimate_advance") || 0);
    form.setValue("estimate_balance", newBalance.toString());
  };

  const validateForm = (data) => {
    const formErrors = {
      date: !data.estimate_date ? "Date is required" : "",
      customer: !data.estimate_customer ? "Customer name is required" : "",
      itemType: !data.estimate_item_type ? "Item type is required" : "",
    };

    const itemErrors = itemEntries.map((entry) => ({
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

    const hasFormErrors = Object.values(formErrors).some((err) => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.type || err.item || err.qnty || err.qntySqr || err.rate
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
                      <tr className="bg-red-50 text-red-800">
                        <th className="px-2 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Field
                        </th>
                        <th className="px-2 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formErrors.date && (
                        <tr className="bg-white text-gray-700">
                          <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                            Date
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200">
                            {formErrors.date}
                          </td>
                        </tr>
                      )}
                      {formErrors.customer && (
                        <tr className="bg-white text-gray-700">
                          <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                            Customer
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200">
                            {formErrors.customer}
                          </td>
                        </tr>
                      )}
                      {formErrors.itemType && (
                        <tr className="bg-white text-gray-700">
                          <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                            Item Type
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200">
                            {formErrors.itemType}
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
                      <tr className="bg-red-50 text-red-800">
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200 w-8">
                          #
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Type
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Item
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Qty
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Qty (sqr)
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
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
                            <tr key={i} className="bg-white text-gray-700">
                              <td className="px-1.5 py-1.5 text-center border-b border-gray-200 font-medium">
                                {i + 1}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200">
                                {error.type}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200">
                                {error.item}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 text-right border-b border-gray-200">
                                {error.qnty}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 text-right border-b border-gray-200">
                                {error.qntySqr}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 text-right border-b border-gray-200">
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
        estimate_year: currentYear,
        estimate_no_of_count: itemEntries.length,
        estimate_sub_data: itemEntries,
      };

      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate("/estimate");
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create Estimate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/estimate");
  };

  const formProps = {
    form,
    itemEntries,
    handleItemChange,
    addItemEntry,
    removeItemEntry,
    handleChargeChange,
    handleAdvanceChange,
    handleCancel,
    handleFormSubmit,
    estimateRef,
    productTypeGroup,
    handleKeyDown,
    typeOptions,
    isSubmitting,
  };

  return (
    <>
      <MobileEstimateForm {...formProps} />
      <DesktopEstimateForm {...formProps} />
    </>
  );
};

export default EstimateAddPage;
