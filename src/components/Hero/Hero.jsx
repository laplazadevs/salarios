import Typography from '@mui/material/Typography';
import './Hero.scss';

const Hero = () => {
  return (
    <div className="hero-section">
      <Typography variant='h1'>Descubre el Panorama Tecnológico en Colombia 2025</Typography>
      <Typography variant='body3' className="hero-paragraph">
        La información cruda usada para este análisis se encuentra <a href="https://github.com/laplazadevs/encuesta_de_salarios/blob/main/public/data/20250603_normalized.csv" target="_blank" rel="noopener noreferrer">aquí</a>, sin embargo fueron normalizados para que sean más coherentes y significativas. Los criterios usados fueron que el salario reportado por una jornada de 40 horas semanales no podía ser inferior a <strong>$1.425.500 COP</strong>, valor correspondiente al <strong>Salario Mínimo Legal Mensual Vigente (SMLMV)</strong> en Colombia para el año 2025, aplicable tanto a empresas nacionales como extranjeras.
      </Typography>
      <Typography variant='body3' className="hero-paragraph">
        Adicionalmente, se realizó una conversión de los valores expresados en dólares estadounidenses a pesos colombianos, utilizando una <strong>Tasa Representativa del Mercado (TRM)</strong> de <strong>$4.000 COP</strong>. De igual forma, los salarios anuales fueron transformados a su equivalente mensual, lo que permite una comparación más clara y contextualizada con el salario mínimo vigente en Colombia.
      </Typography>
      <Typography variant='body3' className="hero-paragraph">
        Para una exploración interactiva de los datos donde puedes cambiar diferentes valores y rangos, visita <a href="https://jaimegarcia.github.io/colombia-salary-viz-2025/" target="_blank" rel="noopener noreferrer">esta herramienta de visualización</a> que te permitirá analizar la información de manera más dinámica.
      </Typography>
    </div>
  );
};

export default Hero;