import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-brand">
            <h3>BookRental</h3>
            <p>The easy, hassle-free way to rent books online.</p>
          </div>
          <div className="footer-links">
            <h4>Products</h4>
            <Link to="/">BookRental for Home</Link>
            <Link to="/my-rentals">My Rentals</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <div className="footer-links">
            <h4>Get in Touch</h4>
            <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="#">Email</a>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© 2024 BookRental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
