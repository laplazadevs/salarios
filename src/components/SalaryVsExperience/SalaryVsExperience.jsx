import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from '@mui/material/Typography';
import "./SalaryVsExperience.scss";

const SalaryVsExperience = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      d3.select(d3Container.current).selectAll("*").remove();
      d3.select("body").select(".experience-tooltip").remove();
    };
    
    cleanup();

    const margin = { top: 40, right: 120, bottom: 60, left: 100 },
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(`${import.meta.env.BASE_URL}data/20250603_normalized.csv`).then((data) => {
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

      // Create bins for both dimensions
      const xBins = 15; // Experience bins
      const yBins = 12; // Salary bins
      
      const xExtent = d3.extent(filtered, d => d.experiencia);
      const yExtent = d3.extent(filtered, d => d.salario);
      
      const xScale = d3.scaleLinear()
        .domain(xExtent)
        .range([0, width]);
        
      const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([height, 0]);

      // Create bin boundaries
      const xStep = (xExtent[1] - xExtent[0]) / xBins;
      const yStep = (yExtent[1] - yExtent[0]) / yBins;
      
      // Create 2D bins
      const bins = [];
      for (let i = 0; i < xBins; i++) {
        for (let j = 0; j < yBins; j++) {
          bins.push({
            x0: xExtent[0] + i * xStep,
            x1: xExtent[0] + (i + 1) * xStep,
            y0: yExtent[0] + j * yStep,
            y1: yExtent[0] + (j + 1) * yStep,
            count: 0,
            data: []
          });
        }
      }
      
      // Populate bins
      filtered.forEach(d => {
        const xBin = Math.min(Math.floor((d.experiencia - xExtent[0]) / xStep), xBins - 1);
        const yBin = Math.min(Math.floor((d.salario - yExtent[0]) / yStep), yBins - 1);
        const binIndex = yBin * xBins + xBin;
        bins[binIndex].count++;
        bins[binIndex].data.push(d);
      });

      // Filter out empty bins
      const nonEmptyBins = bins.filter(d => d.count > 0);
      
      // Color scale based on count - darker = higher intensity
      const maxCount = d3.max(nonEmptyBins, d => d.count);
      const colorScale = d3.scaleSequential()
        .domain([1, maxCount])
        .interpolator(d3.interpolateRgb("#D3DAD9", "#715A5A"));

      // Tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "experience-tooltip")
        .style("position", "absolute")
        .style("background", "#37353E")
        .style("color", "#D3DAD9")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("border", "1px solid #44444E")
        .style("pointer-events", "none")
        .style("font-size", "13px")
        .style("opacity", 0);

      // Draw heatmap rectangles
      svg.selectAll("rect")
        .data(nonEmptyBins)
        .join("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.y1))
        .attr("width", d => xScale(d.x1) - xScale(d.x0))
        .attr("height", d => yScale(d.y0) - yScale(d.y1))
        .attr("fill", d => colorScale(d.count))
        .attr("stroke", "#37353E")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
          const avgSalary = d3.mean(d.data, p => p.salario);
          const avgExp = d3.mean(d.data, p => p.experiencia);
          
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>Experiencia:</strong> ${d.x0.toFixed(1)} - ${d.x1.toFixed(1)} años<br/>
               <strong>Salario:</strong> ${d3.format(",.0f")(d.y0 / 1_000_000)} - ${d3.format(",.0f")(d.y1 / 1_000_000)} M COP<br/>
               <strong>Personas:</strong> ${d.count}<br/>
               <strong>Promedio:</strong> ${d3.format(",.0f")(avgSalary / 1_000_000)} M COP`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
            
          d3.select(this)
            .attr("stroke-width", 2)
            .attr("stroke", "#D3DAD9");
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this)
            .attr("stroke-width", 0.5)
            .attr("stroke", "#37353E");
        });

      // Axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(8))
        .selectAll("text")
        .style("fill", "#D3DAD9")
        .style("font-size", "12px");

      svg.append("g")
        .call(d3.axisLeft(yScale)
          .ticks(8)
          .tickFormat(d => d3.format(",.0f")(d / 1_000_000)))
        .selectAll("text")
        .style("fill", "#D3DAD9")
        .style("font-size", "12px");

      // Style axis lines
      svg.selectAll(".domain, .tick line")
        .style("stroke", "#44444E");

      // Axis labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .attr("fill", "#D3DAD9")
        .style("font-size", "14px")
        .text("Años de experiencia");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .attr("fill", "#D3DAD9")
        .style("font-size", "14px")
        .text("Salario mensual (millones COP)");

      // Legend
      const legendWidth = 15;
      const legendHeight = 200;
      const legendSteps = 10;
      
      const legend = svg.append("g")
        .attr("transform", `translate(${width + 30}, ${(height - legendHeight) / 2})`);
        
      // Legend gradient
      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "heatmap-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%");
        
      for (let i = 0; i <= legendSteps; i++) {
        const t = i / legendSteps;
        gradient.append("stop")
          .attr("offset", `${t * 100}%`)
          .attr("stop-color", colorScale(1 + t * (maxCount - 1)));
      }
      
      legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#heatmap-gradient)")
        .style("stroke", "#44444E");
        
      // Legend scale
      const legendScale = d3.scaleLinear()
        .domain([1, maxCount])
        .range([legendHeight, 0]);
        
      legend.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(d3.axisRight(legendScale).ticks(5))
        .selectAll("text")
        .style("fill", "#D3DAD9")
        .style("font-size", "11px");
        
      legend.selectAll(".domain, .tick line")
        .style("stroke", "#44444E");
        
      legend.append("text")
        .attr("x", legendWidth + 35)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#D3DAD9")
        .style("font-size", "12px")
        .text("Personas");

    }).catch(error => {
      console.error('Error loading experience data:', error);
    });
    
    // Return cleanup function
    return cleanup;
  }, []);

  return (
    <div className="experience-section" style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Salarios por Experiencia
      </Typography>
      <Typography variant="body1" className="note">
        Este mapa de calor muestra la densidad de profesionales en diferentes rangos de experiencia y salario. Las áreas más oscuras representan mayor concentración de personas. 
        Se observa claramente que la mayoría de salarios altos se concentran entre 5 y 20 años de experiencia, mientras que los profesionales junior (0-5 años) tienden a tener salarios más bajos y consistentes.
        Los rangos con mayor densidad están entre 1.5 y 10 millones de pesos mensuales.
      </Typography>
      <div ref={d3Container} style={{ width: "100%", minHeight: 550 }} />
      
    </div>
  );
};

export default SalaryVsExperience;