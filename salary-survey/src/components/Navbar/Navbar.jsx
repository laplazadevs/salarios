import "./Navbar.scss";
import logo from "../../../public/images/arepa.png"

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="left">
          <img src={logo} alt="Logo" className="logo" />
          <div className="brand">LA PLAZA DEV</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
