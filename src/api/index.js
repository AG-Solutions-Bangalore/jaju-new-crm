import { decryptId, encryptId } from "@/components/common/Encryption";
import BASE_URL from "@/config/BaseUrl";
import axios from "axios";

// PURCHASE
export const PURCHASE_LIST = `${BASE_URL}/api/purchases-list`;
export const PURCHASE_EDIT_LIST = `${BASE_URL}/api/purchases`;
export const PURCHASE_CREATE = `${BASE_URL}/api/purchases`;
//SALES
export const SALES_LIST = `${BASE_URL}/api/sales-list`;
export const SALES_EDIT_LIST = `${BASE_URL}/api/sales`;
export const SALES_CREATE = `${BASE_URL}/api/sales`;
//DASHBOARD
export const DASHBOARD_LIST = `${BASE_URL}/api/dashboard`;
//MASTER-CATEGORY-ITEM-BUYER
export const CATEGORY_LIST = `${BASE_URL}/api/categorys-list`;
export const CATEGORY_CREATE = `${BASE_URL}/api/categorys`;
export const ITEM_LIST = `${BASE_URL}/api/items-list`;
export const ITEM_CREATE = `${BASE_URL}/api/items`;
export const ITEM_EDIT_GET = `${BASE_URL}/api/items`;
export const ITEM_EDIT_SUMBIT = `${BASE_URL}/api/items`;
export const BUYER_LIST = `${BASE_URL}/api/buyers-list`;
export const BUYER_EDIT_GET = `${BASE_URL}/api/buyers`;
export const BUYER_EDIT_SUMBIT = `${BASE_URL}/api/buyers`;
export const BUYER_CREATE = `${BASE_URL}/api/buyers`;
//REPORT STOCK -BUYER
export const BUYER_REPORT = `${BASE_URL}/api/report-buyer-data`;
export const BUYER_DOWNLOAD = `${BASE_URL}/api/download-buyer-data`;
export const STOCK_REPORT = `${BASE_URL}/api/stock`;
export const SINGLE_ITEM_STOCK_REPORT = `${BASE_URL}/api/item-stock`;


// ROUTE CONFIGURATION 
export const ROUTES = {
  PURCHASE_EDIT: (id) => `/purchase/edit/${encryptId(id)}`,
  SALES_EDIT: (id) => `/dispatch/edit/${encryptId(id)}`,
  SALES_VIEW: (id) => `/dispatch/view/${encryptId(id)}`,
};

export const navigateToPurchaseEdit = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_EDIT(purchaseId));
};
export const navigateTOSalesEdit = (navigate, salesId) => {
  navigate(ROUTES.SALES_EDIT(salesId));
};
export const navigateTOSalesView = (navigate, salesId) => {
  navigate(ROUTES.SALES_VIEW(salesId));
};

export const fetchPurchaseById = async (encryptedId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await axios.get(`${PURCHASE_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("res data", response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchSalesById = async (encryptedId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await axios.get(`${SALES_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("res data", response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};


export const updatePurchaseEdit = async (encryptedId, data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    // const id = encryptedId;
    const id = decryptId(encryptedId);

    const requestData = data.data || data;

    const response = await axios.put(
      `${PURCHASE_EDIT_LIST}/${id}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const updateSalesEdit = async (encryptedId, data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    // const id = encryptedId;
    const id = decryptId(encryptedId);

    const requestData = data.data || data;

    const response = await axios.put(
      `${SALES_EDIT_LIST}/${id}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};



