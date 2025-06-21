import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";
import "./EnglishSalary.scss";

const EnglishSalary = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    d3.select(d3Container.current).selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 100 },
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", "100%")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
      )
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(`${import.meta.env.BASE_URL}data/20250603.csv`).then((data) => {
      const inglesKey = "¿Cuál es su nivel de inglés? Marco de referencia Europeo";
      const salarioKey = "Total COP";
      const niveles = ["C2", "C1", "B2", "B1", "A2", "A1", "Cero"];

      const puntos = data
        .map((d) => {
          const match = d[inglesKey]?.match(/(Cero|A1|A2|B1|B2|C1|C2)/);
          return match && d[salarioKey] && !isNaN(+d[salarioKey])
            ? { nivel: match[1], salario: +d[salarioKey] }
            : null;
        })
        .filter(Boolean);

      // Agrupar por nivel
      const dataGrouped = d3.group(puntos, (d) => d.nivel);

      // Escala Y (niveles)
      const y = d3.scalePoint()
        .domain(niveles)
        .range([0, height])
        .padding(0.5);

      // Escala X (salario)
      const x = d3.scaleLinear()
        .domain([0, d3.max(puntos, (d) => d.salario) * 1.1])
        .range([0, width]);

      // Ejes
      svg.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#fff");

      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat((d) => d3.format(",.0f")(d / 1_000_000)))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#fff");

      // Ejes etiquetas
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 35)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Salario mensual (millones COP)");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Nivel de inglés (MCER)");

      // Box plot
      niveles.forEach((nivel) => {
        const values = dataGrouped.get(nivel)?.map((d) => d.salario).sort(d3.ascending);
        if (!values || values.length < 5) return;

        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const min = d3.min(values);
        const max = d3.max(values);

        const centerY = y(nivel);

        // Caja
        svg.append("rect")
          .attr("x", x(q1))
          .attr("y", centerY - 15)
          .attr("width", x(q3) - x(q1))
          .attr("height", 30)
          .attr("stroke", "#fff")
          .attr("fill", "#69b3a2")
          .attr("opacity", 0.7);

        // Línea mediana
        svg.append("line")
          .attr("x1", x(median))
          .attr("x2", x(median))
          .attr("y1", centerY - 15)
          .attr("y2", centerY + 15)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        // Líneas min y max (bigotes)
        svg.append("line")
          .attr("x1", x(min))
          .attr("x2", x(max))
          .attr("y1", centerY)
          .attr("y2", centerY)
          .attr("stroke", "#ccc");

        // Líneas en extremos
        svg.append("line")
          .attr("x1", x(min))
          .attr("x2", x(min))
          .attr("y1", centerY - 10)
          .attr("y2", centerY + 10)
          .attr("stroke", "#ccc");

        svg.append("line")
          .attr("x1", x(max))
          .attr("x2", x(max))
          .attr("y1", centerY - 10)
          .attr("y2", centerY + 10)
          .attr("stroke", "#ccc");
      });
    });
  }, []);

  return (
    <div className="english-section">
      <Typography variant="h4">Relación entre nivel de inglés y salario mensual</Typography>
      <Typography variant="body1" className="note">
        La gráfica muestra que los niveles intermedios y altos de inglés (B2, C1 y C2) están asociados con salarios más altos y una mayor diversidad en los ingresos, mientras que los niveles bajos o sin conocimiento del idioma tienen salarios más bajos y menos variación. Esto sugiere que el dominio del inglés puede influir positivamente en el acceso a mejores oportunidades salariales en el sector.
      </Typography>
      <Typography variant="h5">Cada caja representa el rango salarial por nivel</Typography>
      <div ref={d3Container} style={{ width: "100%", maxWidth: 800, margin: "0 auto" }} />
      
    </div>
  );
};

export default EnglishSalary;
