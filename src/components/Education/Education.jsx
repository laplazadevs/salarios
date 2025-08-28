import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";
import "./Education.scss";

const Education = () => {
  const ref = useRef();

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      d3.select(ref.current).selectAll("*").remove();
      d3.select("body").select(".education-tooltip").remove();
    };
    
    cleanup();

    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(`${import.meta.env.BASE_URL}data/20250603_normalized.csv`).then(data => {
      const eduKey = "¿Cuál es su nivel de formación académica?";
      const salarioKey = "Total COP";

      console.log("Loading normalized data...");
      console.log("Raw data sample:", data.slice(0, 2));
      
      // Filter and clean data more robustly
      const validData = data.filter(d => {
        const education = d[eduKey];
        const salary = d[salarioKey];
        
        // Check if education and salary exist and salary is a valid number
        return education && 
               education.trim() !== "" && 
               salary && 
               salary.trim() !== "" && 
               !isNaN(+salary) && 
               +salary > 0;
      });

      console.log("Valid data count:", validData.length);
      console.log("Education levels found:", [...new Set(validData.map(d => d[eduKey]))]);

      if (validData.length === 0) {
        console.error("No valid data found for education analysis");
        return;
      }

      // Group salaries by education level
      const grupos = d3.groups(validData, d => d[eduKey]);

      // Calcula boxplot stats para cada grupo
      const boxData = grupos.map(([nivel, values]) => {
        const salarios = values.map(d => +d[salarioKey]).sort(d3.ascending);
        const q1 = d3.quantile(salarios, 0.25);
        const median = d3.quantile(salarios, 0.5);
        const q3 = d3.quantile(salarios, 0.75);
        const min = d3.min(salarios);
        const max = d3.max(salarios);
        return { nivel, min, q1, median, q3, max };
      });

      // Ordena por mediana descendente
      boxData.sort((a, b) => d3.descending(a.median, b.median));

      const niveles = boxData.map(d => d.nivel);

      // Escalas
      const x = d3.scaleBand()
        .domain(niveles)
        .range([0, width])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([
          0,
          d3.max(boxData, d => d.max)
        ])
        .nice()
        .range([height, 0]);

      // Eje X
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .style("fill", "#37353E");

      // Eje Y
      svg.append("g")
        .call(d3.axisLeft(y).ticks(8).tickFormat(d => d3.format(",.0f")(d / 1_000_000)))
        .selectAll("text")
        .style("fill", "#37353E");

      // Style axis lines
      svg.selectAll(".domain, .tick line")
        .style("stroke", "#37353E");

      // Etiquetas de ejes
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .attr("fill", "#37353E")
        .style("font-size", "14px")
        .text("Salario mensual (millones COP)");
      
        svg.selectAll("text.cantidad")
          .data(boxData)
          .join("text")
          .attr("class", "cantidad")
          .attr("x", d => x(d.nivel) + x.bandwidth() / 2)
          .attr("y", -10) // Arriba del gráfico
          .attr("text-anchor", "middle")
          .attr("font-size", "13px")
          .attr("fill", "#37353E")
          .text(d => {
            const grupo = grupos.find(g => g[0] === d.nivel);
            return grupo ? `${grupo[1].length} personas` : "";
          });

      // Tooltip
      let tooltip = d3.select("body").select(".education-tooltip");
      if (tooltip.empty()) {
        tooltip = d3.select("body")
          .append("div")
          .attr("class", "education-tooltip")
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

      // Líneas verticales (min-max)
      svg.selectAll("vertLines")
        .data(boxData)
        .join("line")
        .attr("x1", d => x(d.nivel) + x.bandwidth() / 2)
        .attr("x2", d => x(d.nivel) + x.bandwidth() / 2)
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.max))
        .attr("stroke", "#37353E")
        .attr("stroke-width", 2);

      // Cajas (q1-q3)
      svg.selectAll("boxes")
        .data(boxData)
        .join("rect")
        .attr("x", d => x(d.nivel))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.q3))
        .attr("height", d => y(d.q1) - y(d.q3))
        .attr("stroke", "#37353E")
        .attr("stroke-width", 2)
        .attr("fill", "#44444E")
        .attr("opacity", 0.8)
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.nivel}</strong><br/>
              Mediana: $${d3.format(",.0f")(d.median)}<br/>
              Q1: $${d3.format(",.0f")(d.q1)}<br/>
              Q3: $${d3.format(",.0f")(d.q3)}<br/>
              Min: $${d3.format(",.0f")(d.min)}<br/>
              Max: $${d3.format(",.0f")(d.max)}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
          d3.select(this).attr("fill", "#715A5A");
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this).attr("fill", "#44444E");
        });

      // Línea de la mediana
      svg.selectAll("medianLines")
        .data(boxData)
        .join("line")
        .attr("x1", d => x(d.nivel))
        .attr("x2", d => x(d.nivel) + x.bandwidth())
        .attr("y1", d => y(d.median))
        .attr("y2", d => y(d.median))
        .attr("stroke", "#37353E")
        .attr("stroke-width", 3);
    }).catch(error => {
      console.error('Error loading education data:', error);
    });
    
    // Return cleanup function
    return cleanup;
  }, []);

  return (
    <div className="education-section" style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Salario y Nivel de Formación Académica
      </Typography>
      <Typography variant="body1">
        Aunque parece que quienes tienen más estudios ganan más, esta diferencia podría deberse a que hay muchas más personas con pregrado y posgrado en la muestra. Al comparar bien, los salarios medianos no varían tanto entre niveles y muchos rangos se cruzan, así que la diferencia no necesariamente es tan grande o importante como parece.
      </Typography>
      <div ref={ref} style={{ width: "100%", minHeight: 450 }} />
    </div>
  );
};

export default Education;