import Typography from '@mui/material/Typography';
import './Hero.scss';

const Hero = () => {
  return (
    <div className="hero-section">
      <Typography variant='h1'>Descubre el panorama tecnológico en Colombia 2025</Typography>
      <Typography variant='body3'>  
        <strong>Consideraciones:</strong> Las siguientes gráficas se elaboraron a partir de encuestas realizadas entre abril y junio de 2025. Todos los salarios fueron convertidos a pesos colombianos; para los expresados en dólares, se usó una TRM de $4.000 COP por USD. Esto permite comparaciones más coherentes y significativas entre los datos.
      </Typography>
    </div>
  );
};

export default Hero;