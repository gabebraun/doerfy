import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PtbTimeBox } from "./screens/PtbTimeBox";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <PtbTimeBox />
  </StrictMode>,
);
