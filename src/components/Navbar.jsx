import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRental } from '../context/RentalContext';
import { Book, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { rentals } = useRental();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <div className="logo-container">
              <Book className="logo-icon" />
              <span className="logo-text">BookRental</span>
            </div>
          </Link>
        </div>

        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/my-rentals" className="nav-link" onClick={toggleMenu}>
            My Rentals 
            <span className="rentals-badge">{rentals.length}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;