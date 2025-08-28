# Salarios de Desarrolladores en Colombia
Este repositorio contiene los resultados de encuestas sobre salarios de desarrolladores de software en Colombia y el sitio web para visualizarlos.

## Sitio Web

**Clonar el repositorio:**
   ```bash
   git clone https://github.com/laplazadevs/encuesta_de_salarios.git
   cd encuesta_de_salarios
   ```

**Instalar dependencias:**
   ```bash
   npm install
   ```

**Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   El sitio estará disponible en `http://localhost:5173`

### Construcción y Despliegue

1. **Construir para producción:**
   ```bash
   npm run build
   ```
   Los archivos optimizados se generarán en el directorio `dist/`

2. **Vista previa de la construcción:**
   ```bash
   npm run preview
   ```

3. **Desplegar en GitHub Pages:**
   ```bash
   npm run deploy
   ```

### Scripts Disponibles
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la construcción local
- `npm run deploy` - Despliega el sitio en GitHub Pages
- `npm run lint` - Ejecuta el linter para verificar el código

## Encuesta 2025
Los resultados se encuentran en directorio `data` bajo el prefijo `2025*.csv`. Recopilan información anónima sobre experiencia, formación, ubicación, nivel de inglés, lenguajes de programación, modalidad de trabajo, tipo de empresa, tipo de contrato y remuneración, entre otros datos relevantes. La información no ha pasado por un proceso de preprocesamiento, por lo que puede contener errores o inconsistencias. Se recomienda revisar los datos antes de utilizarlos para análisis o visualizaciones.

**Agradecimientos Recolección:** Alejandro Rios, Andres Santos, Andres Villegas, Brayan Hurtado, Daniel Granados, Daniel Mendoza, Daniel Sanchez, Danilo Plazas, Diego Avila, Guillermo Rodas, Isaias De La Hoz, Jahir Fiquitiva, Jorge Morales, Juan Romero, Julian David, Julian Francor, Laura Ramos, Mateo Olarte, Ricardo Trejos, Sara Palacio, Sebastian Guevara, Wilson Tovar, Yeiner Fernandez.

**Agradecimientos Sitio:** [Audreylopez22](https://github.com/Audreylopez22).

## Licencia

El contenido de este repositorio se distribuye bajo la licencia [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/). Esto significa que puedes compartir y adaptar el material siempre que otorgues el crédito correspondiente y distribuyas tus contribuciones bajo la misma licencia.

Algunas preguntas fueron adaptadas de las encuestas publicadas por https://github.com/colombia-dev/data en los años 2019, 2020 y 2021 bajo la licencia Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0).
