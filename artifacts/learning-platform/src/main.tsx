// Patch fetch BEFORE anything else so API hooks never see a failed response
import { patchFetchForStaticHost } from "@/lib/patchFetch";
patchFetchForStaticHost();

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
