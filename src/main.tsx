import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Main.tsx loading...");

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Root element found, creating React app...");
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("React app rendered successfully!");
} else {
  console.error("Root element not found!");
}
