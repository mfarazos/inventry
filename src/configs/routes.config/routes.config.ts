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
    key: `game`,
    path: "/game",
    component: lazy(() => import("@/views/GameManagement/GameModeList")),
    authority: [],
  },
  {
    key: `creategamemodes`,
    path: "/creategamemodes",
    component: lazy(() => import("@/views/GameManagement/CreateGameModes")),
    authority: [],
  },
  {
    key: `Editgame`,
    path: "/EditGameMode/:GameModeId",
    component: lazy(() => import("@/views/GameManagement/EditGameModes")),
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
    key: "createtournament",
    path: `/createtournament`,
    component: lazy(() => import("@/views/Tournament/CreateTournament")),
    authority: [],
  },
  {
    key: "tournament",
    path: `/tournament`,
    component: lazy(() => import("@/views/Tournament/TournamentList")),
    authority: [],
  },
  {
    key: "tournamentDetails",
    path: `/tournamentDetails/:id`,
    component: lazy(() => import("@/views/Tournament/TournamentDetails")),
    authority: [],
  },
  {
    key: "editTournament",
    path: `/editTournament/:id`,
    component: lazy(() => import("@/views/Tournament/EditTournamnet")),
    authority: [],
  },
];
