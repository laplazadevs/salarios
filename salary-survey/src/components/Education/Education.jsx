import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";

const Education = () => {
  const ref = useRef();

  useEffect(() => {
    d3.select(ref.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("/data/20250603.csv").then(data => {
      const eduKey = "¿Cuál es su nivel de formación académica?";
      const salarioKey = "Total COP";

      // Agrupa salarios por nivel académico
      const grupos = d3.groups(
        data.filter(d => d[eduKey] && d[salarioKey] && !isNaN(+d[salarioKey])),
        d => d[eduKey]
      );

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
        .style("font-size", "14px");

      // Eje Y
      svg.append("g")
        .call(d3.axisLeft(y).ticks(8).tickFormat(d => d3.format(",.0f")(d / 1_000_000)));

      // Etiquetas de ejes
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 70)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Nivel de formación académica");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Salario mensual (COP)");
      
        svg.selectAll("text.cantidad")
          .data(boxData)
          .join("text")
          .attr("class", "cantidad")
          .attr("x", d => x(d.nivel) + x.bandwidth() / 2)
          .attr("y", -10) // Arriba del gráfico
          .attr("text-anchor", "middle")
          .attr("font-size", "13px")
          .attr("fill", "#fff")
          .text(d => {
            const grupo = grupos.find(g => g[0] === d.nivel);
            return grupo ? `${grupo[1].length} personas` : "";
          });

      // Tooltip
      let tooltip = d3.select("body").select(".education-box-tooltip");
      if (tooltip.empty()) {
        tooltip = d3.select("body")
          .append("div")
          .attr("class", "education-box-tooltip")
          .style("position", "absolute")
          .style("background", "#222")
          .style("color", "#fff")
          .style("padding", "6px 10px")
          .style("border-radius", "4px")
          .style("pointer-events", "none")
          .style("font-size", "14px")
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
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

      // Cajas (q1-q3)
      svg.selectAll("boxes")
        .data(boxData)
        .join("rect")
        .attr("x", d => x(d.nivel))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.q3))
        .attr("height", d => y(d.q1) - y(d.q3))
        .attr("stroke", "#333")
        .attr("fill", "#4f8cff")
        .attr("opacity", 0.7)
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
          d3.select(this).attr("fill", "#1d3557");
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this).attr("fill", "#4f8cff");
        });

      // Línea de la mediana
      svg.selectAll("medianLines")
        .data(boxData)
        .join("line")
        .attr("x1", d => x(d.nivel))
        .attr("x2", d => x(d.nivel) + x.bandwidth())
        .attr("y1", d => y(d.median))
        .attr("y2", d => y(d.median))
        .attr("stroke", "#d7263d")
        .attr("stroke-width", 3);
    });
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Relación entre salario y nivel de formación académica
      </Typography>
      <Typography variant="body1">
        Aunque parece que quienes tienen más estudios ganan más, esta diferencia podría deberse a que hay muchas más personas con pregrado y posgrado en la muestra. Al comparar bien, los salarios medianos no varían tanto entre niveles y muchos rangos se cruzan, así que la diferencia no necesariamente es tan grande o importante como parece.
      </Typography>
      <div ref={ref} style={{ width: "100%", minHeight: 400 }} />
      
    </div>
  );
};

export default Education;