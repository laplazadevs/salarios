import "./Footer.scss";
import logo from "../../../public/images/arepa.png"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="left">
        <img
          src={logo}
          alt="logo de la plaza dev"
          className="logo"
        />
      </div>
      <p className="disclaimer">
          LA PLAZA DEV
       </p>
    </footer>
  );
};

export default Footer;
