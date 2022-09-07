import React from 'react';
import Logo from '../../assets/images/Artelys_logo.png';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <div className="footer">
      <img className="logo" src={Logo} alt="Logo" />
    </div>
  );
};

export default Footer;
