import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { Simulation } from "./pages/Simulation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "history", Component: History },
      { path: "settings", Component: Settings },
      { path: "simulation", Component: Simulation },
      { path: "*", Component: Dashboard },
    ],
  },
]);
