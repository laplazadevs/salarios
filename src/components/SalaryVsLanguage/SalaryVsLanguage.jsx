import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from '@mui/material/Typography';
import d3Tip from "d3-tip";
import "./SalaryVsLanguage.scss";

const SalaryVsLanguage = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    d3.select(d3Container.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 180 },
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
      const langKey = "¿En cuál de los siguientes lenguajes de programación ocupa la mayor parte de su tiempo laboral?";
      const salarioKey = "Total COP";

      const salarioPorLenguaje = d3.rollups(
      data.filter(d =>
        d[langKey]?.trim() &&
        d[salarioKey] &&
        !isNaN(+d[salarioKey].replace(/[^0-9.-]+/g, ""))
      ),
      v => d3.mean(v, d => +d[salarioKey].replace(/[^0-9.-]+/g, "")),
      d => d[langKey].trim()
    );

      const sorted = salarioPorLenguaje
        .sort((a, b) => d3.descending(a[1], b[1]))
        .map(([language, avgSalary]) => ({
          language,
          avgSalary
        }));

      const x = d3.scaleLinear()
        .domain([0, d3.max(sorted, d => d.avgSalary)])
        .range([0, width]);

      const y = d3.scaleBand()
        .domain(sorted.map(d => d.language))
        .range([0, height])
        .padding(0.2);

      const color = d3.scaleOrdinal()
        .domain(sorted.map(d => d.language))
        .range(d3.schemeCategory10);

      const tip = d3Tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(d => `<strong>${d.language}</strong><br/>Salario promedio: $${d3.format(",.0f")(d.avgSalary)}`);
      
      svg.append("text")
        .attr("x", (width) / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .text("Cifras en millones COP");


      svg.call(tip);

      svg.selectAll("rect")
        .data(sorted)
        .join("rect")
        .attr("y", d => y(d.language))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.avgSalary))
        .attr("fill", d => color(d.language))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('mouseover', function(event, d) {
            console.log(d); 
            tip.show.call(this, d);
          })

      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(15).tickFormat(d => d3.format(",.0f")(d / 1_000_000)));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("fill","white")
        .text("Salario Mensual")

      svg.append("g")
        .call(d3.axisLeft(y));

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 30)
        .attr("text-anchor", "middle")
    });
  }, []);

  return (
    <div className="language-section">
      <Typography variant="h4">Salario promedio por Lenguaje de Programación</Typography>
      <Typography variant="body1" className="note">
        Esta gráfica muestra que algunos lenguajes menos comunes, como Scala, Rust, Elixir y C, presentan los salarios promedio más altos. Esto podría indicar una alta demanda combinada con una baja oferta de profesionales especializados en estas tecnologías.
        En contraste, lenguajes ampliamente utilizados como TypeScript, JavaScript, Python y Java registran salarios promedio más bajos, lo cual podría reflejar una mayor disponibilidad de talento en el mercado. 
      </Typography>
      <div ref={d3Container} style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}  />
      <style>{`
        .d3-tip {
          background: rgba(0,0,0,0.8);
          color: #fff;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default SalaryVsLanguage;