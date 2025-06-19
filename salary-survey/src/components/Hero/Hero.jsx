import Typography from '@mui/material/Typography';
import './Hero.scss';

const Hero = () => {
  return (
    <div className="hero-section">
      <Typography variant='h1'>Descubre el panorama tecnológico en Colombia 2025</Typography>
      <Typography variant='body1'>
        Explora cómo varían los salarios, tecnologías y experiencia en los diferentes departamentos del país.
      </Typography>
      <Typography variant='body3'>  
        <strong>Consideraciones:</strong> Las siguientes gráficas se elaboraron luego de convertir todos los salarios reportados en las encuestas a pesos colombianos. Para los salarios expresados en dólares estadounidenses, se utilizó una Tasa Representativa del Mercado (TRM) de $4.000 COP por USD. Esta conversión permite realizar comparaciones más coherentes y significativas entre los datos.
      </Typography>
      {/* <div className="button-group">
        <button>Explorar datos →</button>
      </div> */}
    </div>
  );
};

export default Hero;