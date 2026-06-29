import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import Page from "@/app/dashboard/page";
import useNumericInput from "@/hooks/useNumericInput";
import { useToast } from "@/hooks/use-toast";
import {
  useAccountNames,
  useCurrentYear,
  useCreatePaymentReceived,
} from "../hooks/useDayBook";
import MobileDayBookForm from "../components/MobileDayBookForm";
import DesktopDayBookForm from "../components/DesktopDayBookForm";

const formSchema = z.object({
  payment_date: z.string(),
  payment_year: z.string(),
  payment_total: z.string(),
  received_total: z.string(),
});

const AddDayBookPage = () => {
  const paymentAmountRefs = useRef([]);
  const receivedAmountRefs = useRef([]);

  const location = useLocation();
  const selectedDate = location.state?.selectedDate;
  const navigate = useNavigate();
  const { toast } = useToast();
  const keydown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("credit");
  const [paymentInputMode, setPaymentInputMode] = useState({});
  const [receivedInputMode, setReceivedInputMode] = useState({});
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [refreshDraftsTrigger, setRefreshDraftsTrigger] = useState(0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_date: selectedDate || moment().format("YYYY-MM-DD"),
      payment_year: "",
      payment_total: "0",
      received_total: "0",
    },
  });

  const { data: accountNames = [] } = useAccountNames();
  const { data: currentYear } = useCurrentYear();
  const createMutation = useCreatePaymentReceived();

  const [paymentEntries, setPaymentEntries] = useState([
    { payment_about: "", payment_amount: "", payment_about_new: "" },
  ]);

  const [receivedEntries, setReceivedEntries] = useState([
    { received_about: "", received_amount: "", received_about_new: "" },
  ]);

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
      updated[index][field] = value;
      return updated;
    });
  }, []);

  const handleReceivedChange = useCallback((index, field, value) => {
    setReceivedEntries((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  }, []);

  const addPaymentEntry = useCallback(() => {
    setPaymentEntries((prev) => [
      ...prev,
      { payment_about: "", payment_amount: "", payment_about_new: "" },
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
      { received_about: "", received_amount: "", received_about_new: "" },
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

  const saveDraft = useCallback(() => {
    const hasData =
      paymentEntries.some(
        (entry) => entry.payment_about || entry.payment_amount,
      ) ||
      receivedEntries.some(
        (entry) => entry.received_about || entry.received_amount,
      );

    if (!hasData) {
      toast({
        title: "No Data",
        description: "There is no data to save as draft",
        variant: "destructive",
      });
      return;
    }

    const draftData = {
      paymentEntries,
      receivedEntries,
      paymentTotal,
      receivedTotal,
      balance: receivedTotal - paymentTotal,
      formData: form.getValues(),
      timestamp: moment(form.watch("payment_date")).format("DD MMMM YYYY"),
    };

    try {
      const existingDrafts = JSON.parse(
        localStorage.getItem("daybook-drafts") || "[]",
      );
      const newDraft = { data: draftData, timestamp: draftData.timestamp };
      const updatedDrafts = [newDraft, ...existingDrafts].slice(0, 10);
      localStorage.setItem("daybook-drafts", JSON.stringify(updatedDrafts));
      setLastSaveTime(new Date());
      setRefreshDraftsTrigger((prev) => prev + 1);
      toast({
        title: "Draft Saved",
        description: "Your work has been saved as draft",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    }
  }, [
    paymentEntries,
    receivedEntries,
    paymentTotal,
    receivedTotal,
    form,
    toast,
  ]);

  const handleLoadDraft = useCallback(
    (draftData) => {
      const safeData = {
        paymentEntries: draftData.paymentEntries || [],
        receivedEntries: draftData.receivedEntries || [],
        formData: draftData.formData || {},
      };

      if (safeData.paymentEntries.length > 0)
        setPaymentEntries(safeData.paymentEntries);
      if (safeData.receivedEntries.length > 0)
        setReceivedEntries(safeData.receivedEntries);
      if (safeData.formData) {
        Object.keys(safeData.formData).forEach((key) => {
          if (safeData.formData[key] !== undefined)
            form.setValue(key, safeData.formData[key]);
        });
      }

      toast({
        title: "Draft Loaded",
        description: "Your draft has been loaded successfully",
        duration: 3000,
      });
    },
    [form, toast],
  );

  useEffect(() => {
    try {
      const savedDrafts = localStorage.getItem("daybook-drafts");
      if (savedDrafts) {
        const parsedDrafts = JSON.parse(savedDrafts);
        const validDrafts = parsedDrafts.filter(
          (draft) => draft && draft.data && draft.data.timestamp,
        );
        if (validDrafts.length !== parsedDrafts.length) {
          localStorage.setItem("daybook-drafts", JSON.stringify(validDrafts));
        }
      }
    } catch (error) {
      console.error("Error cleaning up drafts:", error);
      localStorage.removeItem("daybook-drafts");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveDraft();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [saveDraft]);

  const validateEntries = useCallback(() => {
    const paymentErrors = paymentEntries.map((entry) => ({
      account: !entry.payment_about ? "Account is required" : "",
      amount: !entry.payment_amount
        ? "Amount is required"
        : isNaN(entry.payment_amount)
          ? "Amount must be a number"
          : "",
    }));
    const receivedErrors = receivedEntries.map((entry) => ({
      account: !entry.received_about ? "Account is required" : "",
      amount: !entry.received_amount
        ? "Amount is required"
        : isNaN(entry.received_amount)
          ? "Amount must be a number"
          : "",
    }));
    return { paymentErrors, receivedErrors };
  }, [paymentEntries, receivedEntries]);

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { paymentErrors, receivedErrors } = validateEntries();
      const hasPaymentErrors = paymentErrors.some(
        (err) => err.account || err.amount,
      );
      const hasReceivedErrors = receivedErrors.some(
        (err) => err.account || err.amount,
      );

      if (hasPaymentErrors || hasReceivedErrors) {
        toast({
          title: "Validation Errors",
          description: (
            <div className="w-full space-y-2 text-xs max-h-[60vh] overflow-y-auto">
              {hasPaymentErrors && (
                <div>
                  <div className="font-medium mb-1 text-white">
                    Debit Errors
                  </div>
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-6">
                          #
                        </th>
                        <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800">
                          Account
                        </th>
                        <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-36">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentErrors.map(
                        (error, i) =>
                          (error.account || error.amount) && (
                            <tr key={i} className="bg-white even:bg-gray-50">
                              <td className="px-1 py-0.5 text-center text-gray-500">
                                {i + 1}
                              </td>
                              <td className="px-1 py-0.5 text-red-600 truncate max-w-0">
                                {error.account}
                              </td>
                              <td className="px-1 py-0.5 text-red-600 font-mono text-right">
                                {error.amount}
                              </td>
                            </tr>
                          ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {hasReceivedErrors && (
                <div>
                  <div className="font-medium mb-1 text-white">
                    Credit Errors
                  </div>
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-6">
                          #
                        </th>
                        <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800">
                          Account
                        </th>
                        <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-36">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivedErrors.map(
                        (error, i) =>
                          (error.account || error.amount) && (
                            <tr key={i} className="bg-white even:bg-gray-50">
                              <td className="px-1 py-0.5 text-center text-gray-500">
                                {i + 1}
                              </td>
                              <td className="px-1 py-0.5 text-red-600 truncate max-w-0">
                                {error.account}
                              </td>
                              <td className="px-1 py-0.5 text-red-600 font-mono text-right">
                                {error.amount}
                              </td>
                            </tr>
                          ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ),
          variant: "destructive",
          duration: 10000,
        });
        return;
      }

      const payload = {
        payment_date: data.payment_date,
        payment_year: currentYear,
        payment_total: data.payment_total,
        received_total: data.received_total,
        payment_no_of_count: paymentEntries.length,
        received_no_of_count: receivedEntries.length,
        payment_sub_data: paymentEntries,
        received_sub_data: receivedEntries,
      };

      createMutation.mutate(payload);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create day book",
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
    lastSaveTime,
    refreshDraftsTrigger,
    onSaveDraft: saveDraft,
    onLoadDraft: handleLoadDraft,
    onSubmit: form.handleSubmit(onSubmit),
    handleCancel,
    isSubmitting: isSubmitting || createMutation.isPending,
  };

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

export default AddDayBookPage;
