import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { notification } from 'antd';
import Navbar from '../navbar/Navbar';
import Routing from './Routing';
import Footer from '../footer/Footer';
import './AppComponent.css';

const AppComponent: React.FC = () => {
  // Embedded mode
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [enableSwitchEmbeddedMode, setEnableSwitchEmbeddedMode] =
    useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Escape key press handler to exit embedded mode if activated
  const handleEscKeyPress = (evt) => {
    let escPressed = evt.keyCode === 27;
    if (evt.key) {
      escPressed = evt.key === 'Escape' || evt.key === 'Esc';
    }
    if (escPressed && isEmbedded) {
      searchParams.delete('embedded');
      setSearchParams(searchParams);
    }
  };

  // Effect to handle embedded mode
  useEffect(() => {
    if (searchParams.get('embedded') !== null) {
      setIsEmbedded(true);
    } else {
      setIsEmbedded(false);
    }

    // Show a notification message
    if (isEmbedded) {
      notification.info({
        message: 'Press the Esc key to return to normal mode',
        placement: 'top',
      });
    } else {
      notification.destroy();
    }

    window.addEventListener('keydown', handleEscKeyPress);
    return () => {
      window.removeEventListener('keydown', handleEscKeyPress);
    };
  });

  return (
    <>
      {!isEmbedded && (
        <Navbar enableSwitchEmbeddedMode={enableSwitchEmbeddedMode} />
      )}
      <Routing setEnableSwitchEmbeddedMode={setEnableSwitchEmbeddedMode} />
      {!isEmbedded && <Footer />}
    </>
  );
};

export default AppComponent;
