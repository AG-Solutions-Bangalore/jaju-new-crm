import { decryptId, encryptId } from "@/components/common/Encryption";
import BASE_URL from "@/config/BaseUrl";

import axios from "axios";
import Cookies from "js-cookie";

const token =Cookies.get("token");


// Estimate
export const ESTIMATE_LIST = `${BASE_URL}/api/web-fetch-estimate-list`;
export const PURCHASE_LIST = `${BASE_URL}/api/web-fetch-estimate-list`;
export const PURCHASE_EDIT_LIST = `${BASE_URL}/api/purchases`;
export const PURCHASE_CREATE = `${BASE_URL}/api/purchases`;
//Product
export const PRODUCT_LIST = `${BASE_URL}/api/web-fetch-product-type-list`;

//DASHBOARD
export const DASHBOARD_LIST = `${BASE_URL}/api/dashboard`;
//purchase granite
export const PURCHASE_GRANITE_LIST = `${BASE_URL}/api/web-fetch-purchase-list/Granites`;








//purchase tiles
export const PURCHASE_TILES_LIST = `${BASE_URL}/api/web-fetch-purchase-list/Tiles`;


//sales
export const SALES_LIST = `${BASE_URL}/api/web-fetch-sales-list`;
export const SALES_EDIT_LIST = `${BASE_URL}/api/sales`;
export const SALES_CREATE = `${BASE_URL}/api/sales`;




















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
  PRODUCT_EDIT: (id) => `/product/edit/${encryptId(id)}`,
  PURCHASE_GRANITE_EDIT: (id) => `/purchase-granite/edit/${encryptId(id)}`,
  PURCHASE_GRANITE_VIEW: (id) => `/purchase-granite/view/${encryptId(id)}`,
  PURCHASE_TILES_EDIT: (id) => `/purchase-tiles/edit/${encryptId(id)}`,
  PURCHASE_TILES_VIEW: (id) => `/purchase-tiles/view/${encryptId(id)}`,
  SALES_EDIT: (id) => `/sales/edit/${encryptId(id)}`,
  SALES_VIEW: (id) => `/sales/view/${encryptId(id)}`,
  ESTIMATE_VIEW: (id) => `/estimate/view/${encryptId(id)}`,
};

// product 
export const navigateToProductEdit = (navigate, productId) => {
  navigate(ROUTES.PRODUCT_EDIT(productId));
};


// purchase granite 
export const navigateTOPurchaseGraniteEdit = (navigate, purchaseGranitetId) => {
  navigate(ROUTES.PURCHASE_GRANITE_EDIT(purchaseGranitetId));
};

export const navigateTOPurchaseGraniteView = (navigate, purchaseGranitetId) => {
  navigate(ROUTES.PURCHASE_GRANITE_VIEW(purchaseGranitetId));
};
// purchase Tiles 
export const navigateTOPurchaseTilesEdit = (navigate, purchaseTilesId) => {
  navigate(ROUTES.PURCHASE_TILES_EDIT(purchaseTilesId));
};

export const navigateTOPurchaseTilesView = (navigate, purchaseTilesId) => {
  navigate(ROUTES.PURCHASE_TILES_VIEW(purchaseTilesId));
};
//sales

export const navigateTOSalesEdit = (navigate, salesId) => {
  navigate(ROUTES.SALES_EDIT(salesId));
};


export const navigateTOSalesView = (navigate, salesId) => {
  navigate(ROUTES.SALES_VIEW(salesId));
};



//ESTIMATE


export const navigateTOEstimateView = (navigate, salesId) => {
  navigate(ROUTES.ESTIMATE_VIEW(salesId));
};










export const fetchPurchaseById = async (encryptedId) => {
  try {
    // const token = localStorage.getItem("token");
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
    // const token = localStorage.getItem("token");
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
    // const token = localStorage.getItem("token");
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
    // const token = localStorage.getItem("token");
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



