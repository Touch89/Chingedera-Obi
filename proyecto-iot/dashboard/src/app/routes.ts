import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import Comparative from "./pages/Comparative";
import EventLogs from "./pages/EventLogs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/comparative",
    Component: Comparative,
  },
  {
    path: "/logs",
    Component: EventLogs,
  },
]);
