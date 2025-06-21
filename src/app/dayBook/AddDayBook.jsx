import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Trash2, Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";

import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import Page from "../dashboard/page";

const formSchema = z.object({
  payment_date: z.string(),
  payment_year: z.string(),
  payment_total: z.string(),
  received_total: z.string(),
});

const selectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '40px',
    height: '40px',
    borderRadius: '0.375rem',
    borderColor: 'hsl(var(--input))',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'hsl(var(--input))',
    },
    '&:focus-within': {
      borderColor: 'hsl(var(--ring))',
      boxShadow: '0 0 0 2px hsl(var(--ring))',
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
    color: 'hsl(var(--foreground))',
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '40px',
    padding: '0 12px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    padding: '8px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.375rem',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'hsl(var(--primary))' 
      : state.isFocused 
        ? 'hsl(var(--accent))' 
        : 'hsl(var(--background))',
    color: state.isSelected 
      ? 'hsl(var(--primary-foreground))' 
      : 'hsl(var(--foreground))',
    '&:hover': {
      backgroundColor: 'hsl(var(--accent))',
      color: 'hsl(var(--accent-foreground))',
    },
  }),
};

const AddDayBook = () => {
  const location = useLocation();
  const selectedDate = location.state?.selectedDate;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
const [activeTab, setActiveTab] = useState('credit');
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_date: selectedDate || moment().format("YYYY-MM-DD"),
      payment_year: "",
      payment_total: "0",
      received_total: "0",
    },
  });

  // Fetch account names
  const { data: accountNames = [] } = useQuery({
    queryKey: ["ledgerAccountNames"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/web-fetch-ledger-accountname`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.mix || [];
    },
  });

  // Fetch current year
  const { data: currentYear } = useQuery({
    queryKey: ["currentYear"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/web-fetch-year`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.year?.current_year;
    },
  });

  const [paymentEntries, setPaymentEntries] = useState([
    { payment_about: "", payment_amount: "", payment_about_new: "" }
  ]);

  const [receivedEntries, setReceivedEntries] = useState([
    { received_about: "", received_amount: "", received_about_new: "" }
  ]);

  const handlePaymentChange = (index, field, value) => {
    const updatedEntries = [...paymentEntries];
    updatedEntries[index][field] = value;
    setPaymentEntries(updatedEntries);

    // Recalculate payment total
    const newTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseInt(entry.payment_amount || 0), 0
    );
    form.setValue("payment_total", newTotal.toString());
  };

  const handleReceivedChange = (index, field, value) => {
    const updatedEntries = [...receivedEntries];
    updatedEntries[index][field] = value;
    setReceivedEntries(updatedEntries);

    // Recalculate received total
    const newTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseInt(entry.received_amount || 0), 0
    );
    form.setValue("received_total", newTotal.toString());
  };

  const addPaymentEntry = () => {
    setPaymentEntries([
      ...paymentEntries,
      { payment_about: "", payment_amount: "", payment_about_new: "" }
    ]);
  };

  const addReceivedEntry = () => {
    setReceivedEntries([
      ...receivedEntries,
      { received_about: "", received_amount: "", received_about_new: "" }
    ]);
  };

  const removePaymentEntry = (index) => {
    const updatedEntries = [...paymentEntries];
    updatedEntries.splice(index, 1);
    setPaymentEntries(updatedEntries);

    const newTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseInt(entry.payment_amount || 0), 0
    );
    form.setValue("payment_total", newTotal.toString());
  };

  const removeReceivedEntry = (index) => {
    const updatedEntries = [...receivedEntries];
    updatedEntries.splice(index, 1);
    setReceivedEntries(updatedEntries);

    const newTotal = updatedEntries.reduce(
      (sum, entry) => sum + parseInt(entry.received_amount || 0), 0
    );
    form.setValue("received_total", newTotal.toString());
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
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

      const response = await axios.post(
        `${BASE_URL}/api/web-create-payment-received`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.code === 200) {
        toast({
          title: "Success",
          description: "Day Book Created Successfully",
        });
        navigate("/home");
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to create day book",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create day book",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/home");
  };

  const balance = parseInt(form.watch("received_total")) - parseInt(form.watch("payment_total"));

  return (
    <Page>
     <div className="w-full p-0 md:p-0">

 

<div className="sm:hidden">
  {/* Header Section */}
    <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-2 mb-2">
    <div className="flex justify-between items-center mb-2">
      <h1 className="text-base font-bold text-gray-800">
        Add Day Book - {moment(form.watch("payment_date")).format("DD MMM YYYY")}
      </h1>
    </div>
    
    {/* Summary Cards */}
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-green-50 border border-green-100 rounded-md p-2">
        <p className="text-xs text-green-800 font-medium">Received</p>
        <p className="text-sm font-bold">{form.watch("received_total") || 0}</p>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-md p-2">
        <p className="text-xs text-red-800 font-medium">Payment</p>
        <p className="text-sm font-bold">{form.watch("payment_total") || 0}</p>
      </div>
    </div>
  </div>

  {/* Tabs for Credit/Debit */}
   <div className="mb-4">
    <div className="flex border-b border-gray-200">
      <button
        className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'credit' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('credit')}
      >
        Credit
        {balance < 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px]">
            !
          </span>
        )}
      </button>
      <button
        className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'debit' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}
        onClick={() => setActiveTab('debit')}
      >
        Debit
        {balance > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px]">
            !
          </span>
        )}
      </button>
    </div>
  </div>

  {/* Credit Tab Content */}
 {activeTab === 'credit' && (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-green-800">Credit Entries</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addReceivedEntry}
          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 text-xs h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {receivedEntries.map((entry, index) => (
        <div key={index} className="bg-white p-2 rounded-md border border-green-100 mb-2">
          <div className="grid grid-cols-12 gap-1 items-center">
            <div className="col-span-10">
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-1">
                  <Select
                    options={accountNames.map(account => ({
                      value: account.account_name,
                      label: account.account_name
                    }))}
                    value={accountNames.find(account => 
                      account.account_name === entry.received_about
                    ) ? {
                      value: entry.received_about,
                      label: entry.received_about
                    } : null}
                    onChange={(selected) => 
                      handleReceivedChange(index, "received_about", selected?.value || "")
                    }
                    styles={{
                      ...selectStyles,
                      control: (base) => ({
                        ...base,
                        minHeight: '32px',
                        height: '32px'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        height: '32px',
                        padding: '0 6px'
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: '4px'
                      })
                    }}
                    placeholder="Account"
                    className="text-xs"
                    classNamePrefix="react-select"
                    isClearable
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    value={entry.received_amount}
                    onChange={(e) => 
                      handleReceivedChange(index, "received_amount", e.target.value)
                    }
                    className="border-green-200 focus-visible:ring-green-300 h-8 text-sm"
                    placeholder="Amount"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeReceivedEntry(index)}
                disabled={receivedEntries.length <= 1}
                className="h-7 w-7 hover:bg-green-100 text-red-500"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Debit Tab Content */}
   {activeTab === 'debit' && (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-red-800">Debit Entries</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPaymentEntry}
          className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300 text-xs h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {paymentEntries.map((entry, index) => (
        <div key={index} className="bg-white p-2 rounded-md border border-red-100 mb-2">
          <div className="grid grid-cols-12 gap-1 items-center">
            <div className="col-span-10">
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-1">
                  <Select
                    options={accountNames.map(account => ({
                      value: account.account_name,
                      label: account.account_name
                    }))}
                    value={accountNames.find(account => 
                      account.account_name === entry.payment_about
                    ) ? {
                      value: entry.payment_about,
                      label: entry.payment_about
                    } : null}
                    onChange={(selected) => 
                      handlePaymentChange(index, "payment_about", selected?.value || "")
                    }
                    styles={{
                      ...selectStyles,
                      control: (base) => ({
                        ...base,
                        minHeight: '32px',
                        height: '32px'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        height: '32px',
                        padding: '0 6px'
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: '4px'
                      })
                    }}
                    placeholder="Account"
                    className="text-xs"
                    classNamePrefix="react-select"
                    isClearable
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    value={entry.payment_amount}
                    onChange={(e) => 
                      handlePaymentChange(index, "payment_amount", e.target.value)
                    }
                    className="border-red-200 focus-visible:ring-red-300 h-8 text-sm"
                    placeholder="Amount"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePaymentEntry(index)}
                disabled={paymentEntries.length <= 1}
                className="h-7 w-7 hover:bg-red-100 text-red-500"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
 {/* Balance Alert */}
{balance !== 0 && (
  <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 p-2">
    <div className={`p-2 rounded-md ${balance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} border`}>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-green-800">Credit: {form.watch("received_total") || 0}</p>
          <p className="text-red-800">Debit: {form.watch("payment_total") || 0}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">Difference</p>
          <p className={`font-bold ${balance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
            {balance}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

{/* Action Buttons - only show when balance is 0 */}
{balance === 0 && (
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
       onClick={form.handleSubmit(onSubmit)} 
      disabled={isSubmitting}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-xs h-9"
    >
      {isSubmitting ? "Saving..." : "Save"}
    </Button>
  </div>
)}

 
</div>


<div className="hidden sm:block">

 <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Add Day Book</CardTitle>
          <p className="text-sm text-gray-500">
            {moment(form.watch("payment_date")).format("DD MMMM YYYY")}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="payment_date">Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  {...form.register("payment_date")}
                  disabled={!!selectedDate}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="received_total">Received Total</Label>
                <Input
                  id="received_total"
                  type="text"
                  disabled
                  {...form.register("received_total")}
                  className="bg-green-50 border-green-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="payment_total">Payment Total</Label>
                <Input
                  id="payment_total"
                  type="text"
                  disabled
                  {...form.register("payment_total")}
                  className="bg-red-50 border-red-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  type="text"
                  disabled
                  value={balance}
                  className={`bg-${balance >= 0 ? 'green' : 'red'}-50 border-${balance >= 0 ? 'green' : 'red'}-200`}
                />
              </div>
            </div>

            <div className="lg:flex lg:space-x-4 space-y-6 lg:space-y-0">
              {/* Credit Section */}
              <div className="border rounded-lg p-4 flex-1 bg-green-50 border-green-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-green-800">Credit</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addReceivedEntry}
                    className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add More
                  </Button>
                </div>

                {receivedEntries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-end bg-white p-3 rounded-md border border-green-100">
                    <div className="md:col-span-5 space-y-1">
                      <Label htmlFor={`received_about_${index}`} className="text-green-800">Account</Label>
                      <Select
                        id={`received_about_${index}`}
                        options={accountNames.map(account => ({
                          value: account.account_name,
                          label: account.account_name
                        }))}
                        value={accountNames.find(account => 
                          account.account_name === entry.received_about
                        ) ? {
                          value: entry.received_about,
                          label: entry.received_about
                        } : null}
                        onChange={(selected) => 
                          handleReceivedChange(index, "received_about", selected?.value || "")
                        }
                        styles={selectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select account..."
                        isClearable
                        required
                      />
                    </div>

                    <div className="md:col-span-5 space-y-1">
                      <Label htmlFor={`received_amount_${index}`} className="text-green-800">Amount</Label>
                      <Input
                        id={`received_amount_${index}`}
                        type="number"
                        value={entry.received_amount}
                        onChange={(e) => 
                          handleReceivedChange(index, "received_amount", e.target.value)
                        }
                        className="border-green-200 focus-visible:ring-green-300"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReceivedEntry(index)}
                        disabled={receivedEntries.length <= 1}
                        className="hover:bg-green-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Debit Section */}
              <div className="border rounded-lg p-4 flex-1 bg-red-50 border-red-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-red-800">Debit</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPaymentEntry}
                    className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add More
                  </Button>
                </div>

                {paymentEntries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-end bg-white p-3 rounded-md border border-red-100">
                    <div className="md:col-span-5 space-y-1">
                      <Label htmlFor={`payment_about_${index}`} className="text-red-800">Account</Label>
                      <Select
                        id={`payment_about_${index}`}
                        options={accountNames.map(account => ({
                          value: account.account_name,
                          label: account.account_name
                        }))}
                        value={accountNames.find(account => 
                          account.account_name === entry.payment_about
                        ) ? {
                          value: entry.payment_about,
                          label: entry.payment_about
                        } : null}
                        onChange={(selected) => 
                          handlePaymentChange(index, "payment_about", selected?.value || "")
                        }
                        styles={selectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select account..."
                        isClearable
                        required
                      />
                    </div>

                    <div className="md:col-span-5 space-y-1">
                      <Label htmlFor={`payment_amount_${index}`} className="text-red-800">Amount</Label>
                      <Input
                        id={`payment_amount_${index}`}
                        type="number"
                        value={entry.payment_amount}
                        onChange={(e) => 
                          handlePaymentChange(index, "payment_amount", e.target.value)
                        }
                        className="border-red-200 focus-visible:ring-red-300"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePaymentEntry(index)}
                        disabled={paymentEntries.length <= 1}
                        className="hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || balance !== 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
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

export default AddDayBook;