import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";
import "./EnglishSalary.scss";

const EnglishSalary = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      d3.select(d3Container.current).selectAll("*").remove();
      d3.select("body").select(".english-salary-tooltip").remove();
    };
    
    cleanup();

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

    d3.csv(`${import.meta.env.BASE_URL}data/20250603_normalized.csv`).then((data) => {
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
        .style("fill", "#D3DAD9");

      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat((d) => d3.format(",.0f")(d / 1_000_000)))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#D3DAD9");

      // Style axis lines
      svg.selectAll(".domain, .tick line")
        .style("stroke", "#44444E");

      // Tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "english-salary-tooltip")
        .style("position", "absolute")
        .style("background", "#37353E")
        .style("color", "#D3DAD9")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("border", "1px solid #44444E")
        .style("pointer-events", "none")
        .style("font-size", "13px")
        .style("opacity", 0);

      // Ejes etiquetas
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 35)
        .attr("text-anchor", "middle")
        .attr("fill", "#D3DAD9")
        .style("font-size", "14px")
        .text("Salario mensual (millones COP)");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .attr("fill", "#D3DAD9")
        .style("font-size", "14px")
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
          .attr("stroke", "#44444E")
          .attr("stroke-width", 2)
          .attr("fill", "#715A5A")
          .attr("opacity", 0.8)
          .style("cursor", "pointer")
          .on("mouseover", function (event) {
            tooltip
              .style("opacity", 1)
              .html(
                `<strong>Nivel:</strong> ${nivel}<br/>
                 <strong>Personas:</strong> ${values.length}<br/>
                 <strong>Mediana:</strong> ${d3.format(",.0f")(median / 1_000_000)} M COP<br/>
                 <strong>Q1:</strong> ${d3.format(",.0f")(q1 / 1_000_000)} M COP<br/>
                 <strong>Q3:</strong> ${d3.format(",.0f")(q3 / 1_000_000)} M COP<br/>
                 <strong>Rango:</strong> ${d3.format(",.0f")(min / 1_000_000)} - ${d3.format(",.0f")(max / 1_000_000)} M COP`
              )
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 30}px`);
              
            d3.select(this)
              .attr("opacity", 1)
              .attr("stroke-width", 3);
          })
          .on("mouseout", function () {
            tooltip.style("opacity", 0);
            d3.select(this)
              .attr("opacity", 0.8)
              .attr("stroke-width", 2);
          });

        // Línea mediana
        svg.append("line")
          .attr("x1", x(median))
          .attr("x2", x(median))
          .attr("y1", centerY - 15)
          .attr("y2", centerY + 15)
          .attr("stroke", "#D3DAD9")
          .attr("stroke-width", 3);

        // Líneas min y max (bigotes)
        svg.append("line")
          .attr("x1", x(min))
          .attr("x2", x(max))
          .attr("y1", centerY)
          .attr("y2", centerY)
          .attr("stroke", "#44444E")
          .attr("stroke-width", 2);

        // Líneas en extremos
        svg.append("line")
          .attr("x1", x(min))
          .attr("x2", x(min))
          .attr("y1", centerY - 10)
          .attr("y2", centerY + 10)
          .attr("stroke", "#44444E")
          .attr("stroke-width", 2);

        svg.append("line")
          .attr("x1", x(max))
          .attr("x2", x(max))
          .attr("y1", centerY - 10)
          .attr("y2", centerY + 10)
          .attr("stroke", "#44444E")
          .attr("stroke-width", 2);
      });
    }).catch(error => {
      console.error('Error loading english salary data:', error);
    });
    
    // Return cleanup function
    return cleanup;
  }, []);

  return (
    <div className="english-salary-section" style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Nivel de Inglés y Salario Mensual
      </Typography>
      <Typography variant="body1" className="note">
        La gráfica muestra que los niveles intermedios y altos de inglés (B2, C1 y C2) están asociados con salarios más altos y una mayor diversidad en los ingresos, mientras que los niveles bajos o sin conocimiento del idioma tienen salarios más bajos y menos variación. Esto sugiere que el dominio del inglés puede influir positivamente en el acceso a mejores oportunidades salariales en el sector.
      </Typography>
      <div ref={d3Container} style={{ width: "100%", minHeight: 450 }} />
      
    </div>
  );
};

export default EnglishSalary;
