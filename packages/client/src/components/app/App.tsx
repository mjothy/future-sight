import { useState } from "react";

import "./App.css";
import DashboardView from "../dashboard/DashboardView";
import Navbar from "./Navbar";


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
      <Navbar/>
      <DashboardView />
    </div>
  );
}
