import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import DataManager from '../../services/DataManager';
import DataManagerContextProvider from '../../services/DataManagerContextProvider';

import './App.css';
import AppComponent from './AppComponent';

const dataManager = new DataManager();

export default function App() {
  const [apiResponse, setApiResponse] = useState('');

  const onCallApi = async () => {
    try {
      const response = await fetch('/api', {
        method: 'GET',
      });
      const text = await response.text();
      console.log(text);
      setApiResponse(text);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <div className="App">
      <BrowserRouter>
        <DataManagerContextProvider dataManager={dataManager}>
          <AppComponent />
        </DataManagerContextProvider>
      </BrowserRouter>
    </div>
  );
}
