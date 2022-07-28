import { useState } from "react";
import DataManagerContextProvider from "../../services/DataManagerContextProvider";

import "./App.css";
import AppComponent from "./AppComponent";

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
      {/* All components inside DataManagerContextProvider, can access to DataManagerContext */}
      <DataManagerContextProvider>
        <AppComponent />
      </DataManagerContextProvider>
    </div>
  );
}
