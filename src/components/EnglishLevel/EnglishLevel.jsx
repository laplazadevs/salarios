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

    d3.csv(`${import.meta.env.BASE_URL}data/20250603.csv`).then((data) => {
      const inglesKey = "¿Cuál es su nivel de inglés? Marco de referencia Europeo";
      const modoKey = "Su modo de trabajo es";
      const niveles = ["A1", "A2", "B1", "B2", "C1", "C2"];

      // Obtén todos los modos de trabajo únicos
      const modos = Array.from(new Set(data.map(d => d[modoKey]).filter(Boolean)));

      // Prepara los datos agrupados
      const conteo = niveles.map(nivel => {
        const nivelData = data.filter(d => {
          const match = d[inglesKey] && d[inglesKey].match(/(A1|A2|B1|B2|C1|C2)/);
          return match && match[1] === nivel;
        });
        const counts = modos.map(modo => ({
          modo,
          cantidad: nivelData.filter(d => d[modoKey] === modo).length
        }));
        return { nivel, counts };
      });

      // Escalas
      const x0 = d3.scaleBand()
        .domain(niveles)
        .range([0, width])
        .padding(0.2);

      const x1 = d3.scaleBand()
        .domain(modos)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const y = d3.scaleLinear()
        .domain([0, d3.max(conteo, d => d3.max(d.counts, c => c.cantidad)) * 1.1])
        .nice()
        .range([height, 0]);

      const color = d3.scaleOrdinal()
        .domain(modos)
        .range(d3.schemeSet2);

      // Eje X
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("font-size", "16px")
        .style("fill", "#fff");

      // Eje Y
      svg.append("g")
        .call(d3.axisLeft(y).ticks(8));

      // Leyenda
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 120},0)`);
      modos.forEach((modo, i) => {
        legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 22)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color(modo));
        legend.append("text")
          .attr("x", 25)
          .attr("y", i * 22 + 14)
          .attr("fill", "#fff")
          .attr("font-size", 14)
          .text(modo);
      });

      // Tooltip
      let tooltip = d3.select("body").select(".english-tooltip");
      if (tooltip.empty()) {
        tooltip = d3.select("body")
          .append("div")
          .attr("class", "english-tooltip")
          .style("position", "absolute")
          .style("background", "#222")
          .style("color", "#fff")
          .style("padding", "6px 10px")
          .style("border-radius", "4px")
          .style("pointer-events", "none")
          .style("font-size", "14px")
          .style("opacity", 0);
      }

      // Barras agrupadas
      svg.selectAll("g.nivel")
        .data(conteo)
        .join("g")
        .attr("class", "nivel")
        .attr("transform", d => `translate(${x0(d.nivel)},0)`)
        .selectAll("rect")
        .data(d => d.counts)
        .join("rect")
        .attr("x", d => x1(d.modo))
        .attr("y", d => y(d.cantidad))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.cantidad))
        .attr("fill", d => color(d.modo))
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(`<strong>Modo:</strong> ${d.modo}<br/><strong>Cantidad:</strong> ${d.cantidad}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
          d3.select(this).attr("fill", d3.rgb(color(d.modo)).darker(1));
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", function (event, d) {
          tooltip.style("opacity", 0);
          d3.select(this).attr("fill", color(d.modo));
        });

      // Etiquetas de cantidad sobre cada barra
      svg.selectAll("g.nivel")
        .selectAll("text.cantidad")
        .data(d => d.counts)
        .join("text")
        .attr("class", "cantidad")
        .attr("x", d => x1(d.modo) + x1.bandwidth() / 2)
        .attr("y", d => y(d.cantidad) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", 13)
        .attr("font-weight", "bold")
        .text(d => d.cantidad);

      // Ejes etiquetas
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Nivel de inglés (MCER)");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Cantidad de personas");
    });
  }, []);


  return (
    <div className="english-section">
      <Typography variant="h4">Cantidad de personas por nivel de inglés</Typography>
      <Typography variant="body1" >
        La mayoría de los encuestados se concentra en niveles intermedios de inglés, siendo B2 el más común, seguido de C1 y B1. Esto sugiere que una gran parte de los participantes posee un dominio funcional o intermedio del idioma. En contraste, los niveles básicos (A1 y A2) y el nivel más alto (C2) son menos frecuentes, lo que indica que pocos encuestados tienen un dominio muy limitado o total del inglés. Esta distribución resalta la importancia del inglés intermedio en el sector.
      </Typography>
      <div ref={d3Container} style={{ width: "100%", maxWidth: 800, margin: "0 auto" }} />
    </div>
  );
};

export default EnglishLevel;