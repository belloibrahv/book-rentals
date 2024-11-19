import { Link } from 'react-router-dom';
import { useRental } from '../context/RentalContext';

const Navbar = () => {
  const { rentals } = useRental();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">BookRental</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/my-rentals" className="nav-link">
          My Rentals ({rentals.length})
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
