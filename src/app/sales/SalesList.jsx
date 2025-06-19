import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import {
  ChevronDown,
  Edit,
  Search,
  SquarePlus,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { navigateToPurchaseEdit, PURCHASE_LIST } from "@/api";
import Loader from "@/components/loader/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import StatusToggle from "@/components/toggle/StatusToggle";

const SalesList = () => {
    //  const {
    //     data: purchase,
    //     isLoading,
    //     isError,
    //     refetch,
    //   } = useQuery({
    //     queryKey: ["purchase"],
    //     queryFn: async () => {
    //       const token = localStorage.getItem("token");
    //       const response = await axios.get(`${PURCHASE_LIST}`, {
    //         headers: { Authorization: `Bearer ${token}` },
    //       });
    //       return response.data.purchase;
    //     },
    //   });
     
    //   // State for table management
    //   const [sorting, setSorting] = useState([]);
    //   const [columnFilters, setColumnFilters] = useState([]);
    //   const [columnVisibility, setColumnVisibility] = useState({});
    //   const [rowSelection, setRowSelection] = useState({});
    //   const [searchQuery, setSearchQuery] = useState("");
    
    //   const navigate = useNavigate();
    
    //   // Define columns for the table
    //   const columns = [
    //     {
    //       accessorKey: "index",
    //       header: "Sl No",
    //       cell: ({ row }) => <div>{row.index + 1}</div>,
    //     },
    
    //     {
    //       accessorKey: "purchase_date",
    //       header: "Date",
    //       cell: ({ row }) => {
    //         const date = row.getValue("purchase_date");
    //         return moment(date).format("DD-MMM-YYYY");
    //       },
    //     },
    //     {
    //       accessorKey: "purchase_buyer_name",
    //       header: " Buyer Name",
    //       cell: ({ row }) => <div>{row.getValue("purchase_buyer_name")}</div>,
    //     },
    //     {
    //       accessorKey: "purchase_ref_no",
    //       header: "Ref No",
    //       cell: ({ row }) => <div>{row.getValue("purchase_ref_no")}</div>,
    //     },
    //     {
    //       accessorKey: "purchase_vehicle_no",
    //       header: "Vehicle No",
    //       cell: ({ row }) => <div>{row.getValue("purchase_vehicle_no")}</div>,
    //     },
    
    //     {
    //       accessorKey: "purchase_status",
    //       header: "Status",
    //       cell: ({ row }) => {
    //         const status = row.getValue("purchase_status");
    //         const statusId = row.original.id;
    //         return (
    //           <StatusToggle
    //           initialStatus={status}
    //           teamId={statusId}
    //           onStatusChange={() => {
    //             refetch();
    //           }}
    //         />
    //         );
    //       },
    //     },
        
      
    //     {
    //       id: "actions",
    //       header: "Action",
    //       cell: ({ row }) => {
    //         const purchaseId = row.original.id;
    
    //         return (
    //           <div className="flex flex-row">
    //             <TooltipProvider>
    //               <Tooltip>
    //                 <TooltipTrigger asChild>
    //                   <Button
    //                     variant="ghost"
    //                     size="icon"
    //                     onClick={() => {
    //                       navigateToPurchaseEdit(navigate, purchaseId)
    //                     }}
    //                   >
    //                     <Edit />
    //                   </Button>
    //                 </TooltipTrigger>
    //                 <TooltipContent>
    //                   <p>Edit Purchase</p>
    //                 </TooltipContent>
    //               </Tooltip>
    
                 
    //             </TooltipProvider>
    //           </div>
    //         );
    //       },
    //     },
    //   ];
    //   const filteredItems = purchase?.filter((item) =>
    //     item.purchase_buyer_name.toLowerCase().includes(searchQuery.toLowerCase())
    //   ) || [];
    
    //   // Create the table instance
    //   const table = useReactTable({
    //     data: purchase || [],
    //     columns,
    //     onSortingChange: setSorting,
    //     onColumnFiltersChange: setColumnFilters,
    //     getCoreRowModel: getCoreRowModel(),
    //     getPaginationRowModel: getPaginationRowModel(),
    //     getSortedRowModel: getSortedRowModel(),
    //     getFilteredRowModel: getFilteredRowModel(),
    //     onColumnVisibilityChange: setColumnVisibility,
    //     onRowSelectionChange: setRowSelection,
    //     state: {
    //       sorting,
    //       columnFilters,
    //       columnVisibility,
    //       rowSelection,
    //     },
    //     initialState: {
    //       pagination: {
    //         pageSize: 7,
    //       },
    //     },
    //   });
    
    //   // Render loading state
    //   if (isLoading) {
    //     return (
    //       <Page>
    //         <div className="flex justify-center items-center h-full">
    //           <Loader />
    //         </div>
    //       </Page>
    //     );
    //   }
    
    //   // Render error state
    //   if (isError) {
    //     return (
    //       <Page>
    //         <Card className="w-full max-w-md mx-auto mt-10">
    //           <CardHeader>
    //             <CardTitle className="text-destructive">
    //               Error Fetching purchase
    //             </CardTitle>
    //           </CardHeader>
    //           <CardContent>
    //             <Button onClick={() => refetch()} variant="outline">
    //               Try Again
    //             </Button>
    //           </CardContent>
    //         </Card>
    //       </Page>
    //     );
    //   }
    
  return (
    <Page>
       <div className="w-full p-0 md:p-4 grid grid-cols-1">
         <div className="sm:hidden">
          <p>
            mobile SalesList
          </p>
         </div>
 
         <div className="hidden sm:block">
         <p>
            large SalesList
         </p>
         </div>
       </div>
      
     </Page>
  )
}

export default SalesList