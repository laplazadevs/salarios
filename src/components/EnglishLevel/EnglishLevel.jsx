import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from '@mui/material/Typography';
import "./EnglishLevel.scss";

const EnglishLevel = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      d3.select(d3Container.current).selectAll("*").remove();
      d3.select("body").select(".english-tooltip").remove();
    };
    
    cleanup();

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

    d3.csv(`${import.meta.env.BASE_URL}data/20250603_normalized.csv`).then((data) => {
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

      // Use our color palette for work modes
      const paletteColors = ["#D3DAD9", "#44444E", "#715A5A", "#D3DAD9"];
      const color = d3.scaleOrdinal()
        .domain(modos)
        .range(paletteColors.slice(0, modos.length));

      // Eje X
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("font-size", "16px")
        .style("fill", "#D3DAD9");

      // Eje Y
      svg.append("g")
        .call(d3.axisLeft(y).ticks(8))
        .selectAll("text")
        .style("fill", "#D3DAD9");

      // Style axis lines
      svg.selectAll(".domain, .tick line")
        .style("stroke", "#44444E");

      // Leyenda
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 120},0)`);
      modos.forEach((modo, i) => {
        legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 22)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color(modo))
          .style("stroke", "#44444E")
          .style("stroke-width", 1);
        legend.append("text")
          .attr("x", 25)
          .attr("y", i * 22 + 14)
          .attr("fill", "#D3DAD9")
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
          .style("background", "#37353E")
          .style("color", "#D3DAD9")
          .style("padding", "8px 12px")
          .style("border-radius", "6px")
          .style("pointer-events", "none")
          .style("font-size", "14px")
          .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
          .style("border", "1px solid #44444E")
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
        .style("stroke", "#44444E")
        .style("stroke-width", 1)
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(`<strong>Cantidad:</strong> ${d.cantidad}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke-width", 2);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", function (event, d) {
          tooltip.style("opacity", 0);
          d3.select(this)
            .style("opacity", 1)
            .style("stroke-width", 1);
        });

      // Ejes etiquetas
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .attr("fill", "#D3DAD9")
        .style("font-size", "14px")
        .text("Nivel de inglés (MCER)");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("fill", "#D3DAD9")
        .style("font-size", "14px")
        .text("Cantidad de personas");
    }).catch(error => {
      console.error('Error loading english level data:', error);
    });
    
    // Return cleanup function
    return cleanup;
  }, []);


  return (
    <div className="english-section" style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Nivel de Inglés por Modalidad de Trabajo
      </Typography>
      <Typography variant="body1">
        La mayoría de los encuestados se concentra en niveles intermedios de inglés, siendo B2 el más común, seguido de C1 y B1. Esto sugiere que una gran parte de los participantes posee un dominio funcional o intermedio del idioma. En contraste, los niveles básicos (A1 y A2) y el nivel más alto (C2) son menos frecuentes, lo que indica que pocos encuestados tienen un dominio muy limitado o total del inglés. Esta distribución resalta la importancia del inglés intermedio en el sector.
      </Typography>
      <div ref={d3Container} style={{ width: "100%", minHeight: 450 }} />
    </div>
  );
};

export default EnglishLevel;