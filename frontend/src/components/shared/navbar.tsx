import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          DoctorScheduler
        </Link>
        <div className="nav-links">
          <Link to="/doctor">For Doctors</Link>
          <Link to="/patient">For Patients</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
