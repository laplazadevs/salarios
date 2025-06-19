import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from '@mui/material/Typography';
import "./TypeOfCompany.scss"

const TypeOfCompany = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    d3.select(d3Container.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 120 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    function wrap(texts) {
      texts.each(function () {
        const text = d3.select(this),
          words = text.text().split(/\n/),
          y = text.attr("y"),
          x = text.attr("x");

        text.text(null);

        words.forEach((word, i) => {
          text.append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", `${i * 1.1}em`)
            .text(word);
        });
      });
    }

    d3.csv("/data/20250603.csv").then((data) => {
      const empresaKey = "¿Para qué tipo de empresa trabaja?";
      const salarioKey = "Total COP";

      const grupos = d3.groups(
        data.filter(d => d[empresaKey] && d[salarioKey] && !isNaN(+d[salarioKey])),
        d => d[empresaKey]
      );

      const boxData = grupos.map(([empresa, values]) => {
        const salarios = values.map(d => +d[salarioKey]).sort(d3.ascending);
        const q1 = d3.quantile(salarios, 0.25);
        const median = d3.quantile(salarios, 0.5);
        const q3 = d3.quantile(salarios, 0.75);
        const min = d3.min(salarios);
        const max = d3.max(salarios);
        return { empresa, min, q1, median, q3, max };
      });

      boxData.sort((a, b) => d3.descending(a.median, b.median));

      const y = d3.scaleBand()
        .domain(boxData.map(d => d.empresa))
        .range([0, height])
        .padding(0.3);

      const x = d3.scaleLinear()
        .domain([
          d3.min(boxData, d => d.min),
          d3.max(boxData, d => d.max)
        ])
        .nice()
        .range([0, width]);

      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3.axisBottom(x)
            .ticks(20)
            .tickFormat(d => (d / 1_000_000))
        );

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Salario Mensual (Mill COP)")

      svg.append("g")
        .call(
          d3.axisLeft(y)
            .tickFormat(d => d.split(' ').length > 2 ? d.replace(/(.+?\s.+?)\s(.+)/, '$1\n$2') : d)
        )
        .selectAll(".tick text")
        .call(wrap, margin.left - 20);

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 30)
        .attr("text-anchor", "middle")

      svg.selectAll("vertLines")
        .data(boxData)
        .join("line")
        .attr("x1", d => x(d.min))
        .attr("x2", d => x(d.max))
        .attr("y1", d => y(d.empresa) + y.bandwidth() / 2)
        .attr("y2", d => y(d.empresa) + y.bandwidth() / 2)
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

      svg.selectAll("boxes")
        .data(boxData)
        .join("rect")
        .attr("x", d => x(d.q1))
        .attr("width", d => x(d.q3) - x(d.q1))
        .attr("y", d => y(d.empresa) + y.bandwidth() / 4)
        .attr("height", y.bandwidth() / 2)
        .attr("stroke", "#333")
        .attr("fill", "#69b3a2")
        .attr("opacity", 0.7);

      svg.selectAll("medianLines")
        .data(boxData)
        .join("line")
        .attr("x1", d => x(d.median))
        .attr("x2", d => x(d.median))
        .attr("y1", d => y(d.empresa) + y.bandwidth() / 4)
        .attr("y2", d => y(d.empresa) + y.bandwidth() * 3 / 4)
        .attr("stroke", "#d7263d")
        .attr("stroke-width", 3);

      svg.selectAll("minTicks")
        .data(boxData)
        .join("line")
        .attr("x1", d => x(d.min))
        .attr("x2", d => x(d.min))
        .attr("y1", d => y(d.empresa) + y.bandwidth() / 3)
        .attr("y2", d => y(d.empresa) + y.bandwidth() * 2 / 3)
        .attr("stroke", "#333")
        .attr("stroke-width", 2);

      svg.selectAll("maxTicks")
        .data(boxData)
        .join("line")
        .attr("x1", d => x(d.max))
        .attr("x2", d => x(d.max))
        .attr("y1", d => y(d.empresa) + y.bandwidth() / 3)
        .attr("y2", d => y(d.empresa) + y.bandwidth() * 2 / 3)
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
    });
  }, []);

  return (
    <div className="company-section">
      <Typography variant="h4">Distribución de salario mensual según tipo de empresa</Typography>
      <div ref={d3Container} style={{ width: "100%", maxWidth: 900, margin: "0 auto" }} />
      <Typography variant="body1" className="note">
        de la grafica anterior, se puede inferir que las empresas extranjeras y el trabajo freelance ofrecen los salarios medianos más altos, superando ampliamente a las empresas colombianas, especialmente a las que operan solo en el mercado nacional, las cuales presentan menor variabilidad y los salarios más bajos.
      </Typography>
    </div>
  );
};

export default TypeOfCompany;
