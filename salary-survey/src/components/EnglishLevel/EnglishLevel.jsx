import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from '@mui/material/Typography';
import "./EnglishLevel.scss";

const EnglishLevel = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    d3.select(d3Container.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 80, left: 60 },
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("/data/20250603.csv").then((data) => {
      const inglesKey = "¿Cuál es su nivel de inglés? Marco de referencia Europeo";
      const sufijos = ["A1", "A2", "B1", "B2", "C1", "C2"];

      // Extrae el sufijo (A1, A2, etc.) de cada valor
      const dataSufijos = data
        .map(d => {
          const match = d[inglesKey] && d[inglesKey].match(/(A1|A2|B1|B2|C1|C2)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      // Cuenta cuántas personas hay en cada sufijo
      const conteo = sufijos.map(sufijo => ({
        nivel: sufijo,
        cantidad: dataSufijos.filter(s => s === sufijo).length
      }));

      // Escalas
      const x = d3.scaleBand()
        .domain(sufijos)
        .range([0, width])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(conteo, d => d.cantidad) * 1.1])
        .range([height, 0]);

      // Eje X
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "16px")
        .style("fill", "#fff");

      // Eje Y
      svg.append("g")
        .call(d3.axisLeft(y).ticks(8));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Nivel de inglés (MCER)");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Cantidad de personas");

      // Barras
      svg.selectAll("rect")
        .data(conteo)
        .join("rect")
        .attr("x", d => x(d.nivel))
        .attr("y", d => y(d.cantidad))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.cantidad))
        .attr("fill", "#69b3a2");

      // Etiquetas de cantidad sobre cada barra
      svg.selectAll("text.cantidad")
        .data(conteo)
        .join("text")
        .attr("class", "cantidad")
        .attr("x", d => x(d.nivel) + x.bandwidth() / 2)
        .attr("y", d => y(d.cantidad) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", 16)
        .attr("font-weight", "bold")
        .text(d => d.cantidad);
    });
  }, []);

  return (
    <div className="english-section">
      <Typography variant="h4">Cantidad de personas por nivel de inglés</Typography>
      <div ref={d3Container} style={{ width: "100%", maxWidth: 800, margin: "0 auto" }} />
      <Typography variant="body1" >
        La mayoría de los encuestados se concentra en niveles intermedios de inglés, siendo B2 el más común, seguido de C1 y B1. Esto sugiere que una gran parte de los participantes posee un dominio funcional o avanzado del idioma. En contraste, los niveles básicos (A1 y A2) y el nivel más alto (C2) son menos frecuentes, lo que indica que pocos encuestados tienen un dominio muy limitado o total del inglés. Esta distribución resalta la importancia del inglés intermedio en el sector.
      </Typography>
    </div>
  );
};

export default EnglishLevel;