import { setBaseUrl } from "@workspace/api-client-react";

// Point API calls at the Railway backend when env var is set
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
} else {
  // No backend — patch fetch to return empty data so the app doesn't crash
  import("@/lib/patchFetch").then(({ patchFetchForStaticHost }) => patchFetchForStaticHost());
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
