import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Escape key press handler to exit embedded mode if activated
  const handleEscKeyPress = (evt) => {
    let escPressed = evt.keyCode === 27;
    if (evt.key) {
      escPressed = evt.key === 'Escape' || evt.key === 'Esc';
    }
    if (escPressed && isEmbedded) {
      navigate({
        pathname: location.pathname,
      });
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
      <div className="content-wrapper">
        <Routing setEnableSwitchEmbeddedMode={setEnableSwitchEmbeddedMode} />
      </div>
      {!isEmbedded && <Footer />}
    </>
  );
};

export default AppComponent;
