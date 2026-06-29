import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useNumericInput from "@/hooks/useNumericInput";
import { useToast } from "@/hooks/use-toast";
import {
  useAccountNames,
  useCurrentYear,
} from "../hooks/useDayBook";
import {
  useEditDayBook,
  useUpdateDaybook,
} from "../hooks/useEditDayBook";
import {
  validatePaymentReceivedEntries,
  buildValidationToast,
} from "../utils/validateEntries";
import MobileDayBookForm from "../components/MobileDayBookForm";
import DesktopDayBookForm from "../components/DesktopDayBookForm";

const formSchema = z.object({
  payment_date: z.string(),
  payment_year: z.string(),
  payment_total: z.string(),
  received_total: z.string(),
});

const EditDayBookPage = () => {
  const location = useLocation();
  const selectedDate = location.state?.selectedDate;
  const navigate = useNavigate();
  const { toast } = useToast();
  const paymentAmountRefs = useRef([]);
  const receivedAmountRefs = useRef([]);
  const keydown = useNumericInput();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("credit");
  const [paymentInputMode, setPaymentInputMode] = useState({});
  const [receivedInputMode, setReceivedInputMode] = useState({});

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_date: selectedDate,
      payment_year: "",
      payment_total: "0",
      received_total: "0",
    },
  });

  const { data: accountNames = [] } = useAccountNames();
  const { data: currentYear } = useCurrentYear();
  const {
    data: daybookData,
    isLoading: isDaybookLoading,
    isError: isDaybookError,
    refetch,
  } = useEditDayBook(selectedDate);
  const updateMutation = useUpdateDaybook(selectedDate);

  const [paymentEntries, setPaymentEntries] = useState([
    { id: "", payment_about: "", payment_amount: "", payment_about_new: "" },
  ]);
  const [receivedEntries, setReceivedEntries] = useState([
    { id: "", received_about: "", received_amount: "", received_about_new: "" },
  ]);

  useEffect(() => {
    if (daybookData) {
      setPaymentEntries(daybookData.payment || []);
      setReceivedEntries(daybookData.received || []);
    }
  }, [daybookData]);

  useEffect(() => {
    if (daybookData && currentYear) {
      const receivedTotal =
        (daybookData.received || []).reduce(
          (sum, item) => sum + parseInt(item.received_amount || 0),
          0,
        ) || 0;
      const paymentTotal =
        (daybookData.payment || []).reduce(
          (sum, item) => sum + parseInt(item.payment_amount || 0),
          0,
        ) || 0;
      form.setValue("received_total", receivedTotal.toString());
      form.setValue("payment_total", paymentTotal.toString());
      form.setValue("payment_year", currentYear);
    }
  }, [daybookData, currentYear, form]);

  const paymentTotal = useMemo(
    () =>
      paymentEntries.reduce(
        (sum, entry) => sum + parseInt(entry.payment_amount || 0),
        0,
      ),
    [paymentEntries],
  );

  const receivedTotal = useMemo(
    () =>
      receivedEntries.reduce(
        (sum, entry) => sum + parseInt(entry.received_amount || 0),
        0,
      ),
    [receivedEntries],
  );

  useEffect(() => {
    form.setValue("payment_total", paymentTotal.toString());
  }, [paymentTotal, form]);

  useEffect(() => {
    form.setValue("received_total", receivedTotal.toString());
  }, [receivedTotal, form]);

  const handlePaymentChange = useCallback((index, field, value) => {
    setPaymentEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const handleReceivedChange = useCallback((index, field, value) => {
    setReceivedEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addPaymentEntry = useCallback(() => {
    setPaymentEntries((prev) => [
      ...prev,
      { id: "", payment_about: "", payment_amount: "", payment_about_new: "" },
    ]);
    setTimeout(() => {
      const newIndex = paymentEntries.length;
      if (paymentAmountRefs.current[newIndex]) {
        paymentAmountRefs.current[newIndex].focus();
      }
    }, 0);
  }, [paymentEntries.length]);

  const addReceivedEntry = useCallback(() => {
    setReceivedEntries((prev) => [
      ...prev,
      {
        id: "",
        received_about: "",
        received_amount: "",
        received_about_new: "",
      },
    ]);
    setTimeout(() => {
      const newIndex = receivedEntries.length;
      if (receivedAmountRefs.current[newIndex]) {
        receivedAmountRefs.current[newIndex].focus();
      }
    }, 0);
  }, [receivedEntries.length]);

  const removePaymentEntry = useCallback((index) => {
    setPaymentEntries((prev) => {
      paymentAmountRefs.current = paymentAmountRefs.current.filter(
        (_, i) => i !== index,
      );
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const removeReceivedEntry = useCallback((index) => {
    setReceivedEntries((prev) => {
      receivedAmountRefs.current = receivedAmountRefs.current.filter(
        (_, i) => i !== index,
      );
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const togglePaymentInputMode = useCallback((index) => {
    setPaymentInputMode((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const toggleReceivedInputMode = useCallback((index) => {
    setReceivedInputMode((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { paymentErrors, receivedErrors, hasErrors } =
        validatePaymentReceivedEntries(paymentEntries, receivedEntries);

      if (hasErrors) {
        toast({
          title: "Validation Errors",
          description: buildValidationToast(paymentErrors, receivedErrors),
          variant: "destructive",
          duration: 10000,
        });
        return;
      }

      const payload = {
        payment_year: currentYear,
        payment_total: data.payment_total,
        received_total: data.received_total,
        payment_no_of_count: paymentEntries.length,
        received_no_of_count: receivedEntries.length,
        payment_sub_data: paymentEntries,
        received_sub_data: receivedEntries,
      };

      updateMutation.mutate(payload);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update day book",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  const balance = receivedTotal - paymentTotal;

  const sharedProps = {
    accountNames,
    form,
    selectedDate,
    receivedEntries,
    paymentEntries,
    receivedInputMode,
    paymentInputMode,
    handleReceivedChange,
    handlePaymentChange,
    toggleReceivedInputMode,
    togglePaymentInputMode,
    addReceivedEntry,
    addPaymentEntry,
    removeReceivedEntry,
    removePaymentEntry,
    receivedAmountRefs,
    paymentAmountRefs,
    keydown,
    balance,
    receivedTotal,
    paymentTotal,
    onSaveDraft: null,
    onLoadDraft: null,
    onSubmit: form.handleSubmit(onSubmit),
    handleCancel,
    isSubmitting: isSubmitting || updateMutation.isPending,
    headerTitle: "Edit Day Book",
    buttonLabel: "Update",
    buttonLoadingLabel: "Updating...",
  };

  if (isDaybookLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

  if (isDaybookError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching daybook data
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
        <MobileDayBookForm
          {...sharedProps}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <DesktopDayBookForm {...sharedProps} />
      </div>
    </Page>
  );
};

export default EditDayBookPage;
