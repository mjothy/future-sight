import { useState } from "react";
import ViewSetup from "../dashboard/form/SetupView";
import { Dashboard } from "@future-sight/common";

import "./App.css";
import DashboardView from "../dashboard/DashboardView";


export default function App() {
  const [apiResponse, setApiResponse] = useState("");

  const onCallApi = async () => {
    try {
      const response = await fetch("/api", {
        method: "GET",
      });
      const text = await response.text();
      console.log(text);
      setApiResponse(text);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return (
    <div className="App">
      <DashboardView />
    </div>
  );
}
