import Page from "@/app/dashboard/page";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExcelJS from 'exceljs';
import { useNavigate } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import { DASHBOARD_LIST, STOCK_REPORT } from "@/api";
import Loader from "@/components/loader/Loader";
import { getTodayDate } from "@/utils/currentDate";
import { Download, Printer, Search,ChevronDown } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const Home = () => {

 

  // const {
  //   data: dashboard,
  //   isLoading,
  //   isError,
  //   refetch,
  // } = useQuery({
  //   queryKey: ["dashboard"],
  //   queryFn: async () => {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.get(`${DASHBOARD_LIST}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     return response.data;
  //   },
  // });



  
  // Render loading state
  // if (isLoading) {
  //   return (
  //     <Page>
  //       <div className="flex justify-center items-center h-full">
  //         <Loader />
  //       </div>
  //     </Page>
  //   );
  // }

  // Render error state
  // if (isError) {
  //   return (
  //     <Page>
  //       <Card className="w-full max-w-md mx-auto mt-10">
  //         <CardHeader>
  //           <CardTitle className="text-destructive">
  //             Error Fetching Home
  //           </CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <Button onClick={() => refetch()} variant="outline">
  //             Try Again
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </Page>
  //   );
  // }

  return (
    <Page>
      <div className=" w-full p-0  md:p-4 sm:grid grid-cols-1">
        {/* tabs for mobile screen for purchase and summary  */}
        <>
          <p className="sm:hidden">
mobile dashboard
          </p>

        </>

        <>
          {/* median screen  */}
          <div className=" hidden sm:block rounded-md border">
          large dashboard
          </div>
         
        </>
      </div>
    </Page>
  );
};

export default Home;
