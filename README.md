# Salarios de Desarrolladores en Colombia
Este repositorio contiene los resultados de encuestas sobre salarios de desarrolladores de software en Colombia y el sitio web para visualizarlos.

## Sitio Web
(agregar información del sitio web aquí)
<<<<<<< HEAD

## Encuesta 2025
Los resultados se encuentran en directorio `data` bajo el prefijo `2025*.csv`. Recopilan información anónima sobre experiencia, formación, ubicación, nivel de inglés, lenguajes de programación, modalidad de trabajo, tipo de empresa, tipo de contrato y remuneración, entre otros datos relevantes. La información no ha pasado por un proceso de preprocesamiento, por lo que puede contener errores o inconsistencias. Se recomienda revisar los datos antes de utilizarlos para análisis o visualizaciones.

**Agradecimientos:** Alejandro Rio, Andres Santos, Andres Villegas, Brayan Hurtado, Daniel Granados, Daniel Mendoza, Daniel Sanchez, Danilo Plazas, Diego Avila, Guillermo Rodas, Isaias De La Hoz, Jahir Fiquitiva, Jorge Morales, Juan Romero, Julian David, Julian Francor, Laura, Mateo Olarte, Ricardo Trejos, Sara Palacio, Sebastian Guevara, Wilson Tovar, Yeiner Fernandez.
=======

## Encuesta 2025
Los resultados se encuentran en directorio `data` bajo el prefijo `2025*.csv`. Recopilan información anónima sobre experiencia, formación, ubicación, nivel de inglés, lenguajes de programación, modalidad de trabajo, tipo de empresa, tipo de contrato y remuneración, entre otros datos relevantes. La información no ha pasado por un proceso de preprocesamiento, por lo que puede contener errores o inconsistencias. Se recomienda revisar los datos antes de utilizarlos para análisis o visualizaciones.

En la carpeta `data` se encuentra un archivo de Excel que contiene tres hojas de cálculo:

1. **Original**: Esta hoja contiene todos los datos atípicos encontrados en las encuestas, clasificados en dos categorías:
   - **Datos en rojo**: Son registros que no se consideran confiables, ya que parecen haber sido ingresados de manera incorrecta o sin sentido.
   - **Datos en amarillo**: Corresponden a registros que, aunque tienen cierta coherencia, presentan inconsistencias como valores que parecen ser salarios mensuales en lugar de anuales, o cifras incompletas (por ejemplo, con un cero faltante).

2. **Modificados**: En esta hoja se eliminaron los datos en rojo y se conservaron los datos en amarillo, pero con las correcciones y comentarios necesarios para asegurar su coherencia.

3. **Final**: Esta hoja incluye los datos normalizados, junto con una columna adicional que expresa los salarios en pesos colombianos.

Los criterios utilizados para la normalización de los datos incluyeron que el salario reportado por una jornada de 40 horas semanales no podía ser inferior a **$1.425.500 COP**, valor correspondiente al **Salario Mínimo Legal Mensual Vigente (SMLMV)** en Colombia, aplicable tanto a empresas nacionales como extranjeras.

Adicionalmente, se realizó una conversión de los valores expresados en dólares estadounidenses a pesos colombianos, con el fin de representar los datos en moneda local y facilitar su análisis. Para esta conversión se utilizó una **Tasa Representativa del Mercado (TRM)** de **$4.000 COP por USD**.

Asimismo, los salarios anuales fueron transformados a su equivalente mensual, lo que permite una comparación más clara y contextualizada con el salario mínimo vigente en Colombia.

>>>>>>> 5eb5467 (First preview of the web page to show salary survey results)

## Licencia

El contenido de este repositorio se distribuye bajo la licencia [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/). Esto significa que puedes compartir y adaptar el material siempre que otorgues el crédito correspondiente y distribuyas tus contribuciones bajo la misma licencia.

Algunas preguntas fueron adaptadas de las encuestas publicadas por https://github.com/colombia-dev/data en los años 2019, 2020 y 2021 bajo la licencia Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0).
