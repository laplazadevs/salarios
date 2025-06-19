import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from '@mui/material/Typography';
import "./SalaryVsExperience.scss"

const SalaryvsExperience = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    d3.select(d3Container.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 180 },
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    const svg = d3
        .select(d3Container.current)
        .append("svg")
        .attr("width", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("/data/20250603.csv").then((data) => {

      const experienciaKey = "¿Cuántos años de experiencia en desarrollo de software tiene?";
      const salarioKey = "Total COP";

      const filtered = data
        .filter(
          (d) =>
            d[experienciaKey] &&
            d[salarioKey] &&
            !isNaN(+d[experienciaKey]) &&
            !isNaN(+d[salarioKey])
        )
        .map((d) => ({
          experiencia: +d[experienciaKey],
          salario: +d[salarioKey],
        }));

      // Escalas
      const x = d3
        .scaleLinear()
        .domain(d3.extent(filtered, (d) => d.experiencia))
        .nice()
        .range([0, width]);
      const y = d3
        .scaleLinear()
        .domain(d3.extent(filtered, (d) => d.salario))
        .nice()
        .range([height, 0]);

      // Ejes
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
      .ticks(10));
      svg.append("g")
        .call(
          d3.axisLeft(y)
            .ticks(15)
            .tickFormat(d => d3.format(",.0f")(d / 1_000_000))
        );

      // Etiquetas
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Años de experiencia");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Salario Mensual (Mill COP)")

      svg
        .selectAll("circle")
        .data(filtered)
        .join("circle")
        .attr("cx", (d) => x(d.experiencia))
        .attr("cy", (d) => y(d.salario))
        .attr("r", 6)
        .attr("fill", "#69b3a2")
        .attr("opacity", 0.7);
    });
  }, []);

  return (
    <div className="experience-section" >
      <Typography variant="h4">Años de experiencia y salario mensual</Typography>
      <div ref={d3Container} style={{ width: "100%", maxWidth: 900, margin: "0 auto" }} />
      <Typography variant="body1">
        De la grafica anterior se puede observar que la mayoría de los salarios altos se concentran entre 5 y 20 años de experiencia, encontrando que entre los encuestados las personas en este rango cuaentan con salarios mas altos. 
        La mayor parte de los ecuestados fueron personas entre 0 y 15 años de experiencia con salarios fluctuantes entre 1.5 y 20 millones de pesos colombianos mensuales.
      </Typography>
    </div>
  );
};

export default SalaryvsExperience;