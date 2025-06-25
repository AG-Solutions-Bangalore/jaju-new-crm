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

import {  navigateToProductEdit, PRODUCT_LIST } from "@/api";
import Loader from "@/components/loader/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";


const ProductList = () => {
     const {
        data: productType,
        isLoading,
        isError,
        refetch,
      } = useQuery({
        queryKey: ["productType"],
        queryFn: async () => {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${PRODUCT_LIST}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data.product_type;
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
      
      const filteredProducts = productType?.filter((product) => {
        if (!searchQuery) return true;
        return (
          product.product_type_group?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.product_type?.toLowerCase().includes(searchQuery.toLowerCase())
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
          accessorKey: "product_type_group",
          id:"Product Type",
          header: "Product Type",
          cell: ({ row }) => <div>{row.getValue("Product Type")}</div>,
        },
        {
          accessorKey: "product_type",
          id:"Product",
          header: "Product",
          cell: ({ row }) => <div>{row.getValue("Product")}</div>,
        },
      
        {
          accessorKey: "product_type_status",
          id:"Status",
          header: "Status",
          cell: ({ row }) => {
            const status = row.getValue("Status");
    
            return (
              <span
                className={`px-2 py-1 rounded text-xs ${
                  status == "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {status}
              </span>
            );
          },
        },
       {
             id: "actions",
             header: "Action",
             cell: ({ row }) => {
               const productId = row.original.id;
       
               return (
                 <div className="flex flex-row">
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                        
                           <ProductEdit productId={productId} />
                    
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Edit Product</p>
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
        data: productType || [],
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
      <div className="flex justify-between items-center">
        <h1 className="text-base font-bold text-gray-800 px-2">
          Product List
        </h1>
        <ProductAdd className="mr-2" />
      </div>

      {/* Search Input */}
      <div className="relative px-2 pb-2">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search Product..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(0); // Reset to first page when searching
          }}
          className="pl-10 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm h-9"
        />
      </div>
    </div>
  </div>

  {/* Product Cards */}
  <div className="space-y-2 p-2 max-h-[calc(100vh-180px)] overflow-y-auto">
    {filteredProducts
      .slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
      )
      .map((product, index) => (
        <Card key={product.id} className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {currentPage * itemsPerPage + index + 1}. {product.product_type_group} - {product.product_type}
              </div>
              <div className="mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    product.product_type_status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.product_type_status}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              <ProductEdit productId={product.id} />
            </div>
          </div>
        </Card>
      ))}

    {filteredProducts.length === 0 && (
      <div className="text-center py-4 text-gray-500">
        No products found
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
      className="h-8 text-xs"
    >
      Previous
    </Button>
    <span className="text-xs text-gray-600">
      Page {currentPage + 1} of {Math.ceil(filteredProducts.length / itemsPerPage) || 1}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => 
        Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage) - 1)
      )}
      disabled={
        currentPage >= Math.ceil(filteredProducts.length / itemsPerPage) - 1 ||
        filteredProducts.length <= itemsPerPage
      }
      className="h-8 text-xs"
    >
      Next
    </Button>
  </div>
</div>
 
         <div className="hidden sm:block">
         <div className="flex text-left text-2xl text-gray-800 font-[400]">
            Product List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Product..."
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
              <ProductAdd/>
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
              Total Product : &nbsp;
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

export default ProductList