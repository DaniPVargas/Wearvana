import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./Root";

// Importing the Bootstrap CSS (customized)
import "./scss/custom.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
