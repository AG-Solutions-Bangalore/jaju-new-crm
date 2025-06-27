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
  Eye,
  Search,
  SquarePlus,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {   navigateTOPurchaseGraniteEdit, navigateTOPurchaseGraniteView, PURCHASE_GRANITE_LIST } from "@/api";
import Loader from "@/components/loader/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import Cookies from "js-cookie";


const PurchaseGraniteList = () => {
     const {
        data: purchaseGranite,
        isLoading,
        isError,
        refetch,
      } = useQuery({
        queryKey: ["purchaseGranite"],
        queryFn: async () => {
          const token = Cookies.get("token");
          const response = await axios.get(`${PURCHASE_GRANITE_LIST}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data.purchase;
        },
      });
     
      // State for table management
      const [sorting, setSorting] = useState([]);
      const [columnFilters, setColumnFilters] = useState([]);
      const [columnVisibility, setColumnVisibility] = useState({});
      const [rowSelection, setRowSelection] = useState({});
      const [searchQuery, setSearchQuery] = useState("");
    
      const navigate = useNavigate();
    
      const [currentPage, setCurrentPage] = useState(0);
      const itemsPerPage = 10;
      
      const filteredPurchases = purchaseGranite?.filter((purchase) => {
        if (!searchQuery) return true;
        return (
          purchase.purchase_supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          purchase.purchase_bill_no?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }) || [];
      // Define columns for the table
      const columns = [
        {
          id: "Sl No",
          accessorKey: "index",
          header: "Sl No",
          cell: ({ row }) => <div>{row.index + 1}</div>,
        },
    
          {
                 accessorKey: "purchase_date",
                 id:"Date",
                 header: "Date",
                 cell: ({ row }) => {
                   const date = row.getValue("Date");
                   return moment(date).format("DD-MMM-YYYY");
                 },
               },
        {
          accessorKey: "purchase_supplier",
          id:"Supplier",
          header: "Supplier",
          cell: ({ row }) => <div>{row.getValue("Supplier")}</div>,
        },
        {
          accessorKey: "purchase_bill_no",
          id:"Ref Bill No",
          header: "Ref Bill No",
          cell: ({ row }) => <div>{row.getValue("Ref Bill No")}</div>,
        },
        {
          accessorKey: "purchase_amount",
          id:"Amount",
          header: "Amount",
          cell: ({ row }) => <div>{row.getValue("Amount")}</div>,
        },
        {
          accessorKey: "purchase_no_of_count",
          id:"No Of Items",
          header: "No Of Items",
          cell: ({ row }) => <div>{row.getValue("No Of Items")}</div>,
        },
      

       {
             id: "actions",
             header: "Action",
             cell: ({ row }) => {
               const purchaseGranitetId = row.original.id;
       
               return (
                 <div className="flex flex-row">
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                          //  onClick={() => {
                          //   navigateTOPurchaseGraniteEdit(navigate, purchaseGranitetId)
                          //  }}
                          onClick={() => navigate(`/purchase-granite/edit/${purchaseGranitetId}`)}
                         >
                           <Edit />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Edit Purchase Granite</p>
                       </TooltipContent>
                     </Tooltip>
       
                    
                   </TooltipProvider>
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                          //  onClick={() => {
                          //   navigateTOPurchaseGraniteView(navigate, purchaseGranitetId)
                          //  }}
                          onClick={() => navigate(`/purchase-granite/view/${purchaseGranitetId}`)}
                         >
                           <Eye />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>View Purchase Granite</p>
                       </TooltipContent>
                     </Tooltip>
       
                    
                   </TooltipProvider>
                 </div>
               );
             },
           },
      ];
    
    
      // Create the table instance
      const table = useReactTable({
        data: purchaseGranite || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection,
        },
        initialState: {
          pagination: {
            pageSize: 7,
          },
        },
      });
    
      // Render loading state
      if (isLoading) {
        return (
          <Page>
            <div className="flex justify-center items-center h-full">
              <Loader />
            </div>
          </Page>
        );
      }
    
      // Render error state
      if (isError) {
        return (
          <Page>
            <Card className="w-full max-w-md mx-auto mt-10">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Error Fetching product
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
       <div className="w-full p-0 md:p-4 grid grid-cols-1">
       <div className="sm:hidden">
  {/* Sticky Header */}
  <div className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}>
    <div className="flex flex-col gap-2">
      {/* Title + Add Button */}
      <div className="flex justify-between items-center px-2 py-2">
        <h1 className="text-base font-bold text-gray-800">
          Purchase Granite
        </h1>
        <Button
          size="sm"
          className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          onClick={() => navigate("/purchase-granite/create")}
        >
          <SquarePlus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative px-2 pb-2">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
        <Input
          placeholder="Search Granite..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(0);
          }}
          className="pl-9 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-xs h-8"
        />
      </div>
    </div>
  </div>

  {/* Purchase Granite Cards - Compact Version */}
  <div className="space-y-2 p-2 max-h-[calc(100vh-180px)] overflow-y-auto">
    {filteredPurchases
      .slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
      )
      .map((purchase, index) => (
        <Card key={purchase.id} className="p-2">
          <div className="flex justify-between items-center">
            <div className="font-medium text-gray-900 text-sm">
              {currentPage * itemsPerPage + index + 1}. {purchase.purchase_supplier}
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => navigate(`/purchase-granite/edit/${purchase.id}`)}
                className="h-6 w-6"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => navigate(`/purchase-granite/view/${purchase.id}`)}
                className="h-6 w-6"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 mt-1 text-xs">
            <div>
              <div className="text-gray-500">Date</div>
              <div>{moment(purchase.purchase_date).format("DD-MMM-YY")}</div>
            </div>
            <div>
              <div className="text-gray-500">Bill No</div>
              <div>{purchase.purchase_bill_no}</div>
            </div>
            <div>
              <div className="text-gray-500">Amount</div>
              <div>{purchase.purchase_amount}</div>
            </div>
            <div>
              <div className="text-gray-500">Items</div>
              <div>{purchase.purchase_no_of_count}</div>
            </div>
          </div>
        </Card>
      ))}

    {filteredPurchases.length === 0 && (
      <div className="text-center py-4 text-gray-500 text-sm">
        No purchase records found
      </div>
    )}
  </div>

  {/* Pagination Controls */}
  <div className="sticky bottom-0 bg-white border-t p-2 flex justify-between items-center">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
      disabled={currentPage === 0}
      className="h-8 text-xs px-3"
    >
      Prev
    </Button>
    <span className="text-xs text-gray-600">
      Page {currentPage + 1} of {Math.ceil(filteredPurchases.length / itemsPerPage) || 1}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => 
        Math.min(prev + 1, Math.ceil(filteredPurchases.length / itemsPerPage) - 1)
      )}
      disabled={
        currentPage >= Math.ceil(filteredPurchases.length / itemsPerPage) - 1 ||
        filteredPurchases.length <= itemsPerPage
      }
      className="h-8 text-xs px-3"
    >
      Next
    </Button>
  </div>
</div>
 
         <div className="hidden sm:block">
         <div className="flex text-left text-2xl text-gray-800 font-[400]">
         Purchase Granite List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Granite..."
                value={table.getState().globalFilter || ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>

            {/* Dropdown Menu & Sales Button */}
            <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="default"
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={() => {
                  navigate("/purchase-granite/create");
                }}
              >
                <SquarePlus className="h-4 w-4" /> Purchase Granite
              </Button>{" "}
            </div>
          </div>
          {/* table  */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* row slection and pagintaion button  */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total Purchase Granite : &nbsp;
              {table.getFilteredRowModel().rows.length}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
         </div>
       </div>
      
     </Page>
  )
}

export default PurchaseGraniteList