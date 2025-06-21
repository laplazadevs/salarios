import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";

const Mode = () => {
  const ref = useRef();

  useEffect(() => {
    d3.select(ref.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 80, left: 60 },
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(`${import.meta.env.BASE_URL}data/20250603.csv`).then((data) => {
      const inglesKey = "¿Cuál es su nivel de inglés? Marco de referencia Europeo";
      const empresaKey = "¿Para qué tipo de empresa trabaja?";
      const niveles = ["A1", "A2", "B1", "B2", "C1", "C2"];

      // Define los tipos de empresa que quieres mostrar
      const tipos = [
        "Extranjera",
        "Colombiana",
        "Freelance"
      ];

      // Prepara los datos agrupados
      const conteo = niveles.map(nivel => {
        const nivelData = data.filter(d => {
          const match = d[inglesKey] && d[inglesKey].match(/(A1|A2|B1|B2|C1|C2)/);
          return match && match[1] === nivel;
        });
        const counts = tipos.map(tipo => ({
          tipo,
          cantidad: nivelData.filter(d => d[empresaKey] && d[empresaKey].toLowerCase().includes(tipo.toLowerCase())).length
        }));
        return { nivel, counts };
      });

      // Escalas
      const x0 = d3.scaleBand()
        .domain(niveles)
        .range([0, width])
        .padding(0.2);

      const x1 = d3.scaleBand()
        .domain(tipos)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const y = d3.scaleLinear()
        .domain([0, d3.max(conteo, d => d3.max(d.counts, c => c.cantidad)) * 1.1])
        .nice()
        .range([height, 0]);

      const color = d3.scaleOrdinal()
        .domain(tipos)
        .range(["#4f8cff", "#69b3a2", "#f9c846"]);

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
      tipos.forEach((tipo, i) => {
        legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 22)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color(tipo));
        legend.append("text")
          .attr("x", 25)
          .attr("y", i * 22 + 14)
          .attr("fill", "#fff")
          .attr("font-size", 14)
          .text(tipo);
      });

      // Tooltip
      let tooltip = d3.select("body").select(".mode-tooltip");
      if (tooltip.empty()) {
        tooltip = d3.select("body")
          .append("div")
          .attr("class", "mode-tooltip")
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
        .attr("x", d => x1(d.tipo))
        .attr("y", d => y(d.cantidad))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.cantidad))
        .attr("fill", d => color(d.tipo))
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(`<strong>Tipo:</strong> ${d.tipo}<br/><strong>Cantidad:</strong> ${d.cantidad}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
          d3.select(this).attr("fill", d3.rgb(color(d.tipo)).darker(1));
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", function (event, d) {
          tooltip.style("opacity", 0);
          d3.select(this).attr("fill", color(d.tipo));
        });

      // Etiquetas de cantidad sobre cada barra
      svg.selectAll("g.nivel")
        .selectAll("text.cantidad")
        .data(d => d.counts)
        .join("text")
        .attr("class", "cantidad")
        .attr("x", d => x1(d.tipo) + x1.bandwidth() / 2)
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
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4">Nivel de inglés vs Tipo de empresa</Typography>
      <Typography variant="body1">
        La asociacion de niveles intermedios de ingles y salario se refuerza al observar que, a partir del nivel B2, la mayoría de personas trabaja en empresas extranjeras, especialmente en los niveles C1 y C2, donde esta diferencia es aún más marcada. En contraste, el trabajo freelance es poco común en todos los niveles del idioma.
      </Typography>
      <div ref={ref} style={{ width: "100%", minHeight: 400 }} />
    </div>
  );
};

export default Mode;