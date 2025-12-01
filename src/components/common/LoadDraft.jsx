import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, RefreshCw } from "lucide-react";
import moment from "moment";

const LoadDraft = ({ onLoadDraft, disabled = false, refreshTrigger = 0 ,selectedDate =null}) => {
  const [drafts, setDrafts] = useState([]);
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
console.log('selected date',selectedDate)
 
  const loadDrafts = () => {
  try {
    const savedDrafts = localStorage.getItem('daybook-drafts');
    if (savedDrafts) {
      const parsedDrafts = JSON.parse(savedDrafts);
      
      const validDrafts = parsedDrafts
        .filter(draft => draft && draft.timestamp && draft.data)
        .map(draft => ({
          ...draft,
          data: {
            paymentEntries: draft.data.paymentEntries || [],
            receivedEntries: draft.data.receivedEntries || [],
            paymentTotal: draft.data.paymentTotal || 0,
            receivedTotal: draft.data.receivedTotal || 0,
            balance: draft.data.balance || 0,
            formData: draft.data.formData || {},
            timestamp: draft.data.timestamp 
          }
        }));
      
      // CHANGE THIS PART - don't use const for sortedDrafts
      let sortedDrafts = validDrafts.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      // ADD THIS FILTERING LOGIC
      if (selectedDate) {
        sortedDrafts = sortedDrafts.filter(draft =>
          moment(draft.data.timestamp).format("DD MMMM YYYY") === selectedDate
        );
      }
      
      setDrafts(sortedDrafts);
    } else {
      setDrafts([]);
    }
  } catch (error) {
    console.error('Error loading drafts:', error);
    localStorage.removeItem('daybook-drafts');
    setDrafts([]);
  }
};

  useEffect(() => {
    loadDrafts();
    

    const handleStorageChange = () => loadDrafts();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadDrafts();
    }
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDrafts();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLoadDraft = (draft) => {
    
    const safeDraftData = {
      paymentEntries: draft.data.paymentEntries || [],
      receivedEntries: draft.data.receivedEntries || [],
      paymentTotal: draft.data.paymentTotal || 0,
      receivedTotal: draft.data.receivedTotal || 0,
      balance: draft.data.balance || 0,
      formData: draft.data.formData || {}
    };
    
    onLoadDraft(safeDraftData);
    setOpen(false);
  };

  const handleDeleteDraft = (timestamp) => {
    const updatedDrafts = drafts.filter(draft => draft.data.timestamp !== timestamp);
    setDrafts(updatedDrafts);
    localStorage.setItem('daybook-drafts', JSON.stringify(updatedDrafts));
  };

  const handleDeleteAll = () => {
    setDrafts([]);
    localStorage.removeItem('daybook-drafts');
  };

  const formatDate = (timestamp) => {
    return moment(timestamp).format('DD MMM YYYY, hh:mm A');
  };

 
  const getReceivedTotal = (draft) => {
    return draft.data?.receivedTotal || 0;
  };

  const getPaymentTotal = (draft) => {
    return draft.data?.paymentTotal || 0;
  };

  const getReceivedEntriesCount = (draft) => {
    return draft.data?.receivedEntries?.length || 0;
  };

  const getPaymentEntriesCount = (draft) => {
    return draft.data?.paymentEntries?.length || 0;
  };

  const getBalance = (draft) => {
    return draft.data?.balance || 0;
  };


 

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled}
          className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800"
        >
          Load Draft
          {drafts.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-yellow-200 text-yellow-800">
              {drafts.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader >
          <SheetTitle>Saved Drafts</SheetTitle>
        </SheetHeader>
        
        <div className="mt-1 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved
            </p>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
                title="Refresh drafts"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              {drafts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete All
                </Button>
              )}
            </div>
          </div>

          {drafts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No drafts saved yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Use Ctrl+S to save drafts while working
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {drafts.map((draft, index) => (
                <Card key={draft.data.timestamp} className="relative rounded-md">
                  <CardContent className="p-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-row items-center gap-1">
                        <p className="font-medium text-sm">
                          Draft {drafts.length - index}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(draft.data.timestamp)}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadDraft(draft)}
                          className="h-8 w-8 p-0 hover:bg-green-50"
                          title="Load this draft"
                        >
                          <Download className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDraft(draft.data.timestamp)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          title="Delete this draft"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-green-800 font-medium">Credit</p>
                       <div className="flex flex-row items-center justify-between">
                         <p className="font-bold">{getReceivedTotal(draft)}</p>
                        <p className="text-green-600">
                          {getReceivedEntriesCount(draft)} entries
                        </p>
                       </div>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-red-800 font-medium">Debit</p>
                         <div className="flex flex-row items-center justify-between">
                        <p className="font-bold">{getPaymentTotal(draft)}</p>
                        <p className="text-red-600">
                          {getPaymentEntriesCount(draft)} entries
                        </p>
                        </div>
                      </div>
                    </div>
                    
                    {getBalance(draft) !== 0 && (
                      <Badge 
                        variant="outline" 
                        className={`mt-2 ${
                          getBalance(draft) > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Balance: {getBalance(draft)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LoadDraft;