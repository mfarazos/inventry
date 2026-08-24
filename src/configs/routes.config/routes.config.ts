import { lazy } from "react";
import authRoute from "./authRoute";
import type { Routes } from "@/@types/routes";
import { APP_PREFIX_PATH } from "@/constants/route.constant";

export const publicRoutes: Routes = [...authRoute];

export const protectedRoutes = [
  {
    key: "dashboard",
    path: "/dashboard",
    component: lazy(() => import("@/views/dashboard")),
    authority: [],
  },
  // {
  //   key: "store",
  //   path: "/store",
  //   component: lazy(() => import("@/views/store/StoreList/index")),
  //   authority: [],
  // },
  // {
  //   key: "store",
  //   path: "/store/createstoreitem",
  //   component: lazy(
  //     () => import("@/views/store/createStoreItem/createStoreItem")
  //   ),
  //   authority: [],
  // },
  // {
  //   key: "store",
  //   path: "/editstoreitem/:storeId",
  //   component: lazy(() => import("@/views/store/editStoreItem/EditStoreItems")),
  //   authority: [],
  // },
  // {
  //   key: "store",
  //   path: "/store/add-product",
  //   component: lazy(() => import("@/views/store/StoreForm")),
  //   authority: [],
  // },
  // {
  //   key: `user`,
  //   path: "/user",
  //   component: lazy(() => import("@/views/user")),
  //   authority: [],
  // },
  // {
  //   key: `club`,
  //   path: "/club",
  //   component: lazy(() => import("@/views/Club/ClubList")),
  //   authority: [],
  // },
  {
    key: `inventrylist`,
    path: "/inventrylist",
    component: lazy(() => import("@/views/companypurchase/companypurchaselist")),
    authority: [],
  },
  {
    key: `vendor-purchase`,
    path: "/vendor-purchase",
    component: lazy(() => import("@/views/vendorPurchase")),
    authority: [],
  },
  {
    key: `createDanarecipt`,
    path: "/createDanarecipt",
    component: lazy(() => import("@/views/companypurchase/Createcompanypurchase")),
    authority: [],
  },
  {
    key: `Editgame`,
    path: "/EditGameMode/:GameModeId",
    component: lazy(() => import("@/views/companypurchase/Editcompanypurchase")),
    authority: [],
  },
  
  {
    key: "userProfile",
    path: `/account/settings/:id`,
    component: lazy(() => import("@/views/account/Settings")),
    authority: [],
  },
  

  // {
  //   key: "createClub",
  //   path: `/createClub`,
  //   component: lazy(() => import("@/views/Club/CreateClub")),
  //   authority: [],
  // },
  
  {
    key: "changePassword",
    path: `/change-password`,
    component: lazy(() => import("@/views/changePassword")),
    authority: [],
  },
  
  {
    key: "createRecipt",
    path: `/createRecipt`,
    component: lazy(() => import("@/views/Customer/CreateCustomer")),
    authority: [],
  },
  // {
  //   key: "tournament",
  //   path: `/tournament`,
  //   component: lazy(() => import("@/views/Customer/Customerlist")),
  //   authority: [],
  // },
  
  {
    key: "editTournament",
    path: `/editTournament/:id`,
    component: lazy(() => import("@/views/Customer/EditCustomer")),
    authority: [],
  },
  {
    key: "extrudingAccount",
    path: `/extrudingAccount`,
    component: lazy(() => import("@/views/companyCustomer/SpecificCustomerlist")),
    authority: [],
  },

  {
    key: "billing",
    path: `/billing`,
    component: lazy(() => import("@/views/billing/walkingCustomerlist")),
    authority: [],
  },
  {
    key: "showbilling",
    path: `/showbilling`,
    component: lazy(() => import("@/views/billing/bllingList")),
    authority: [],
  },

  {
    key: "create-sales-payment",
    path: `/create-sales-payment`,
    component: lazy(() => import("@/views/salesPayment/CreatePayment")),
    authority: [],
  },

  {
    key: "sales-payment",
    path: `/sales-ledger`,
    component: lazy(() => import("@/views/salesPayment/PaymentList")),
    authority: [],
  },

  {
    key: "ledger-summary",
    path: `/ledger-summary`,
    component: lazy(() => import("@/views/salesPayment/LedgerSummary")),
    authority: ["admin", "manager"],
  },

  

];
