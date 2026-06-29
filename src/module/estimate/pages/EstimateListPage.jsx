import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import moment from "moment";
import { ChevronDown, Eye, Search, SquarePlus } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Loader from "@/components/loader/Loader";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useEstimateList, useCurrentYear } from "../hooks/useEstimate";

const EstimateListPage = () => {
  const { data: estimate = [], isLoading, isError, refetch } = useEstimateList();
  const { data: currentYear } = useCurrentYear();

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    if (currentYear && !yearFilter) {
      setYearFilter(currentYear);
    }
  }, [currentYear]);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const yearFilteredEstimates =
    yearFilter && yearFilter !== "all"
      ? estimate.filter((est) => est.estimate_year === yearFilter)
      : estimate;

  const filteredEstimates = yearFilteredEstimates.filter((est) => {
    if (!searchQuery) return true;
    return (
      est.estimate_customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.estimate_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const columns = [
    {
      id: "Sl No",
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "estimate_date",
      id: "Estimate Date",
      header: "Estimate Date",
      cell: ({ row }) => {
        const date = row.getValue("Estimate Date");
        const estimateId = row.original.id;
        return (
          <div
            onClick={() => navigate(`/estimate/view/${estimateId}`)}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            {moment(date).format("DD-MMM-YYYY")}
          </div>
        );
      },
    },
    {
      accessorKey: "estimate_no",
      id: "Estimate No",
      header: "Estimate No",
      cell: ({ row }) => {
        const value = row.getValue("Estimate No");
        const estimateStatus = row.original.estimate_status;
        const id = row.original.id;
        const userType = Cookies.get("userType");

        if (userType === "1") {
          return <div>{value}</div>;
        } else if (userType === "2" && estimateStatus === "Estimate") {
          return (
            <div>
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate(`/sales/estimate-create/${id}`)}
              >
                {value}
              </span>
            </div>
          );
        } else {
          return <div>{value}</div>;
        }
      },
    },
    {
      accessorKey: "estimate_customer",
      id: "Customer",
      header: "Customer",
      cell: ({ row }) => <div>{row.getValue("Customer")}</div>,
    },
    {
      accessorKey: "estimate_no_of_count",
      id: "No Of Items",
      header: "No Of Items",
      cell: ({ row }) => <div>{row.getValue("No Of Items")}</div>,
    },
    {
      accessorKey: "estimate_gross",
      id: "Gross",
      header: "Gross",
      cell: ({ row }) => <div>{row.getValue("Gross")}</div>,
    },
    {
      accessorKey: "estimate_advance",
      id: "Advance",
      header: "Advance",
      cell: ({ row }) => <div>{row.getValue("Advance")}</div>,
    },
    {
      accessorKey: "estimate_balance",
      id: "Balance",
      header: "Balance",
      cell: ({ row }) => <div>{row.getValue("Balance")}</div>,
    },
  ];

  const table = useReactTable({
    data: yearFilteredEstimates,
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

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching purchase
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
        {/* Mobile View */}
        <div className="sm:hidden">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-2 py-2">
                <h1 className="text-base font-bold text-gray-800">
                  Estimate List
                </h1>
                <Button
                  size="sm"
                  className={`h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                  onClick={() => navigate("/estimate/create")}
                >
                  <SquarePlus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex gap-2 px-2 pb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    placeholder="Search Estimate..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="pl-9 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-xs h-8"
                  />
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[130px] h-8 text-xs bg-white">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentYear && (
                      <SelectItem value={currentYear}>{currentYear}</SelectItem>
                    )}
                    <SelectItem value="all">All Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2 p-2 max-h-[calc(100vh-180px)] overflow-y-auto">
            {filteredEstimates
              .slice(
                currentPage * itemsPerPage,
                currentPage * itemsPerPage + itemsPerPage
              )
              .map((est, index) => (
                <Card key={est.id} className="p-2">
                  <div className="flex justify-between items-center cursor-pointer">
                    <div className="font-medium text-gray-900 text-sm">
                      {currentPage * itemsPerPage + index + 1}.{" "}
                      {est.estimate_customer}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/estimate/view/${est.id}`);
                        }}
                        className="h-6 w-6 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
                    <div>
                      <div className="text-gray-500">Date</div>
                      <div>
                        {moment(est.estimate_date).format("DD-MMM-YY")}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Estimate No</div>
                      <div>
                        {(() => {
                          const userType = Cookies.get("userType");
                          if (userType === "1") {
                            return est.estimate_no;
                          } else if (
                            userType === "2" &&
                            est.estimate_status === "Estimate"
                          ) {
                            return (
                              <span
                                className="text-blue-600 hover:underline cursor-pointer"
                                onClick={() =>
                                  navigate(`/sales/estimate-create/${est.id}`)
                                }
                              >
                                {est.estimate_no}
                              </span>
                            );
                          } else {
                            return est.estimate_no;
                          }
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Items</div>
                      <div>{est.estimate_no_of_count}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Gross</div>
                      <div>{est.estimate_gross}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Advance</div>
                      <div>{est.estimate_advance}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Balance</div>
                      <div>{est.estimate_balance}</div>
                    </div>
                  </div>
                </Card>
              ))}

            {filteredEstimates.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No Estimate records found
              </div>
            )}
          </div>

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
              Page {currentPage + 1} of{" "}
              {Math.ceil(filteredEstimates.length / itemsPerPage) || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredEstimates.length / itemsPerPage) - 1
                  )
                )
              }
              disabled={
                currentPage >=
                  Math.ceil(filteredEstimates.length / itemsPerPage) - 1 ||
                filteredEstimates.length <= itemsPerPage
              }
              className="h-8 text-xs px-3"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <div className="flex text-left text-2xl text-gray-800 font-[400]">
            Estimate List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Estimate..."
                value={table.getState().globalFilter || ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {currentYear && (
                  <SelectItem value={currentYear}>{currentYear}</SelectItem>
                )}
                <SelectItem value="all">All Data</SelectItem>
              </SelectContent>
            </Select>

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
                onClick={() => navigate("/estimate/create")}
              >
                <SquarePlus className="h-4 w-4" />
                Add Estimate
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
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
                    ))}
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

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total Estimate : &nbsp;
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
  );
};

export default EstimateListPage;
