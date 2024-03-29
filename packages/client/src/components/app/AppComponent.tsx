import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { notification } from 'antd';
import Navbar from '../navbar/Navbar';
import Routing from './Routing';
import './AppComponent.css';

const AppComponent: React.FC = () => {
  // Embedded mode
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [enableSwitchFullscreenMode, setEnableSwitchFullscreenMode] =
    useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Escape key press handler to exit embedded mode if activated
  const handleEscKeyPress = (evt) => {
    let escPressed = evt.keyCode === 27;
    if (evt.key) {
      escPressed = evt.key === 'Escape' || evt.key === 'Esc';
    }
    if (escPressed && isFullscreen && !isEmbedded) {
      searchParams.delete('fullscreen');
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

    if (searchParams.get('fullscreen') !== null) {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }

    // Show a notification message
    if (isFullscreen && !isEmbedded) {
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
      {!(isEmbedded || isFullscreen) && (
        <Navbar enableSwitchFullscreenMode={enableSwitchFullscreenMode}/>
      )}
      <Routing
        isEmbedded={isEmbedded}
        isFullscreen={isFullscreen}
        setEnableSwitchFullscreenMode={setEnableSwitchFullscreenMode}
      />
    </>
  );
};

export default AppComponent;
