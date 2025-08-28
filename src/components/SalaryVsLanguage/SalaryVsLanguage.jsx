import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from '@mui/material/Typography';
import "./SalaryVsLanguage.scss";

const SalaryVsLanguage = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      d3.select(d3Container.current).selectAll("*").remove();
      d3.select("body").select(".salary-language-tooltip").remove();
    };
    
    cleanup();

    const margin = { top: 40, right: 150, bottom: 40, left: 150 },
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      radius = Math.min(width, height) / 2;

    const svg = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left + width/2},${margin.top + height/2})`);

    d3.csv(`${import.meta.env.BASE_URL}data/20250603_normalized.csv`).then((data) => {
      const langKey = "¿En cuál de los siguientes lenguajes de programación ocupa la mayor parte de su tiempo laboral?";
      const salarioKey = "Total COP";

      // Filter and process data - the normalized CSV should have clean numbers
      const filteredData = data.filter(d =>
        d[langKey]?.trim() &&
        d[salarioKey] &&
        !isNaN(+d[salarioKey])
      );

      const salarioPorLenguaje = d3.rollups(
        filteredData,
        v => ({
          avgSalary: d3.mean(v, d => +d[salarioKey]),
          medianSalary: d3.median(v, d => +d[salarioKey]),
          count: v.length
        }),
        d => d[langKey].trim()
      );

      // Filter out languages with less than 3 people for statistical relevance
      const sorted = salarioPorLenguaje
        .filter(([language, stats]) => stats.count >= 3)
        .sort((a, b) => d3.descending(a[1].avgSalary, b[1].avgSalary))
        .map(([language, stats]) => ({
          language,
          avgSalary: stats.avgSalary,
          medianSalary: stats.medianSalary,
          count: stats.count
        }));

      // Create pie generator
      const pie = d3.pie()
        .value(d => d.count)
        .sort((a, b) => d3.descending(a.avgSalary, b.avgSalary));

      // Create arc generator
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

      // Create arc generator for labels
      const labelArc = d3.arc()
        .innerRadius(radius + 10)
        .outerRadius(radius + 10);

      // Use a more colorful and varied color scheme
      const color = d3.scaleOrdinal()
        .domain(sorted.map(d => d.language))
        .range([
          "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00",
          "#ffff33", "#a65628", "#f781bf", "#999999", "#66c2a5",
          "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f",
          "#e5c494", "#b3b3b3", "#1b9e77", "#d95f02", "#7570b3"
        ]);

      // Modern tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "salary-language-tooltip")
        .style("position", "absolute")
        .style("background", "#37353E")
        .style("color", "#D3DAD9")
        .style("padding", "10px 14px")
        .style("border-radius", "8px")
        .style("border", "1px solid #44444E")
        .style("pointer-events", "none")
        .style("font-size", "13px")
        .style("box-shadow", "0 4px 8px rgba(0,0,0,0.3)")
        .style("opacity", 0);

      // Create pie slices
      const pieData = pie(sorted);
      
      svg.selectAll("path")
        .data(pieData)
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.language))
        .attr("opacity", 0.8)
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
          
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.data.language}</strong><br/>
               <strong>Personas:</strong> ${d.data.count} (${percentage}%)<br/>
               <strong>Promedio:</strong> ${d3.format(",.0f")(d.data.avgSalary / 1_000_000)} M COP<br/>
               <strong>Mediana:</strong> ${d3.format(",.0f")(d.data.medianSalary / 1_000_000)} M COP`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
            
          d3.select(this)
            .attr("opacity", 1)
            .attr("stroke-width", 3);
        })
        .on("mouseout", function() {
          tooltip.style("opacity", 0);
          d3.select(this)
            .attr("opacity", 0.8)
            .attr("stroke-width", 1);
        });

      // Create legend
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${radius + 40}, ${-radius})`);

      const legendItems = legend.selectAll(".legend-item")
        .data(sorted)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 18})`);

      legendItems.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d.language))
        .attr("opacity", 0.8);

      legendItems.append("text")
        .attr("x", 18)
        .attr("y", 6)
        .attr("dy", "0.35em")
        .attr("fill", "#D3DAD9")
        .style("font-size", "11px")
        .text(d => {
          const shortName = d.language.length > 15 ? d.language.substring(0, 15) + "..." : d.language;
          return `${shortName} (${d.count})`;
        });

    }).catch(error => {
      console.error('Error loading salary vs language data:', error);
    });
    
    // Return cleanup function
    return cleanup;
  }, []);

  return (
    <div className="salary-language-section" style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Lenguajes de Programación
      </Typography>
      <Typography variant="body1" className="note">
        Este gráfico circular muestra la distribución de profesionales por lenguaje de programación. El tamaño de cada segmento representa la cantidad de desarrolladores que usan principalmente ese lenguaje. 
        Los tooltips muestran información detallada incluyendo salarios promedio y mediana para cada tecnología.
        Los lenguajes más populares como JavaScript, Python y Java dominan el mercado laboral colombiano.
      </Typography>
      <div ref={d3Container} style={{ width: "100%", minHeight: 650 }} />
    </div>
  );
};

export default SalaryVsLanguage;