import React, { useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";
import "./Language.scss"

const LanguageChart = () => {
  const svgRef = useRef();
  const [totalesPorRango, setTotalesPorRango] = useState({});
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      d3.select(svgRef.current).selectAll("*").remove();
      d3.select("body").select(".language-tooltip").remove();
    };
    
    cleanup();

    const margin = { top: 40, right: 120, bottom: 80, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.csv(`${import.meta.env.BASE_URL}data/20250603_normalized.csv`).then((rawData) => {
      const expKey = "¿Cuántos años de experiencia en desarrollo de software tiene?";
      const langKey = "¿En cuál de los siguientes lenguajes de programación ocupa la mayor parte de su tiempo laboral?";

      const rango = (exp) => {
        if (exp === "" || isNaN(+exp)) return null;
        const n = +exp;
        if (n < 0) return null;
        if (n <= 2) return "Junior";
        if (n <= 5) return "Mid";
        return "Senior";
      };

      // Group data by experience and language
      const agrupado = {};
      rawData.forEach((d) => {
        const r = rango(d[expKey]);
        const l = d[langKey];
        if (!r || !l) return;
        if (!agrupado[r]) agrupado[r] = {};
        agrupado[r][l] = (agrupado[r][l] || 0) + 1;
      });

      // Get top languages overall to ensure consistency across groups
      const allLanguages = {};
      Object.values(agrupado).forEach(rangoData => {
        Object.entries(rangoData).forEach(([lang, count]) => {
          allLanguages[lang] = (allLanguages[lang] || 0) + count;
        });
      });

      const topLanguages = Object.entries(allLanguages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([lang]) => lang);

      // Transform data for grouped bar chart
      const chartData = topLanguages.map(language => {
        const data = { language };
        Object.keys(agrupado).forEach(rango => {
          data[rango] = agrupado[rango][language] || 0;
        });
        return data;
      });

      setChartData(chartData);

      // Calculate totals per experience level
      const totalesPorRango = {};
      Object.entries(agrupado).forEach(([rango, lenguajes]) => {
        totalesPorRango[rango] = Object.values(lenguajes).reduce((acc, count) => acc + count, 0);
      });
      setTotalesPorRango(totalesPorRango);

      // Create SVG with proper dimensions
      const svg = d3.select(svgRef.current)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const x0 = d3.scaleBand()
        .domain(chartData.map(d => d.language))
        .range([0, width])
        .padding(0.1);

      const x1 = d3.scaleBand()
        .domain(['Junior', 'Mid', 'Senior'])
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => Math.max(d.Junior, d.Mid, d.Senior))])
        .nice()
        .range([height, 0]);

      // Color scale with palette colors
      const colorScale = d3.scaleOrdinal()
        .domain(['Junior', 'Mid', 'Senior'])
        .range(['#37353E', '#44444E', '#D3DAD9']);

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#D3DAD9");

      g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#D3DAD9");

      // Add axis lines color
      g.selectAll(".domain, .tick line")
        .style("stroke", "#44444E");

      // Add Y axis label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#D3DAD9")
        .text("Número de desarrolladores");

      // Add bars
      const languageGroups = g.selectAll(".language-group")
        .data(chartData)
        .enter().append("g")
        .attr("class", "language-group")
        .attr("transform", d => `translate(${x0(d.language)},0)`);

      const experienceLevels = ['Junior', 'Mid', 'Senior'];
      
      languageGroups.selectAll(".bar")
        .data(d => experienceLevels.map(level => ({
          level,
          value: d[level],
          language: d.language
        })))
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x1(d.level))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colorScale(d.level))
        .style("stroke", "#44444E")
        .style("stroke-width", 1);

      // Add legend
      const legend = g.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

      const legendItems = legend.selectAll(".legend-item")
        .data(experienceLevels)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

      legendItems.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => colorScale(d))
        .style("stroke", "#44444E")
        .style("stroke-width", 1);

      legendItems.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .style("font-size", "14px")
        .style("fill", "#D3DAD9")
        .text(d => d);

      // Tooltip
      let tooltip = d3.select("body").select(".language-tooltip");
      if (tooltip.empty()) {
        tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "language-tooltip")
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

      languageGroups.selectAll(".bar")
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.value}</strong> desarrolladores`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
        });
    }).catch(error => {
      console.error('Error loading language data:', error);
    });
    
    // Return cleanup function
    return cleanup;
  }, []);

  return (
    <div className="language-section">
      <Typography variant="h4">Experiencia y Lenguaje</Typography>
      <Typography variant="body1" style={{ marginTop: "20px" }}>
        En la gráfica se analizaron los rangos de experiencia definidos como: Junior (0 a 2 años), Mid (2 a 5 años) y Senior (más de 5 años, aunque este último depende más de habilidades que del tiempo).
        JavaScript, Python y TypeScript destacan como los lenguajes más populares en todos los niveles, lo que refleja su alta demanda en la industria.
        Los perfiles Junior y Mid muestran una mayor diversidad de lenguajes utilizados.
        En cambio, los desarrolladores Senior tienden a enfocarse en un número menor de tecnologías clave, lo que sugiere una mayor especialización con la experiencia.
      </Typography>
      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="auto"
          style={{ display: "block", margin: "10px auto" }}
        />
      </div>
      <div style={{ margin: "20px 0", fontWeight: "bold", color: "#fff", fontSize: "18px" }}>
        {Object.entries(totalesPorRango).map(([rango, total]) => (
          <span key={rango} style={{ marginRight: 24 }}>
            {rango}: {total} desarrolladores
          </span>
      ))}
      </div>
    </div>
  );
};

export default LanguageChart;
