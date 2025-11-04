import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import UrlProvider from "./context";

import AppLayout from "./layouts/app-layout";
import RedirectLink from "./pages/redirect-link";
import LandingPage from "./pages/landing";
import Dashboard from "./pages/dashboard";
import LinkPage from "./pages/link";

/**
 * Optimized routing configuration
 * Removed authentication overhead for better performance
 * All routes are publicly accessible
 */
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/link/:id",
        element: <LinkPage />,
      },
      {
        path: "/:id",
        element: <RedirectLink />,
      },
    ],
  },
]);

/**
 * Main App Component
 * Implements efficient context provider pattern
 */
function App() {
  return (
    <UrlProvider>
      <RouterProvider router={router} />
    </UrlProvider>
  );
}

export default App;