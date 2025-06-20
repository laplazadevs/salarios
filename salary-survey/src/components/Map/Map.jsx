import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";
import "./Map.scss";

const Map = () => {
  const ref = useRef();

  useEffect(() => {
    // Limpia el contenedor completamente
    d3.select(ref.current).select("*").remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 30 };
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    Promise.all([
      d3.json("/data/colombia.geo.json"),
      d3.csv("/data/20250603.csv")
    ]).then(([geoData, rawData]) => {
      const deptKey = "¿En qué departamento vive actualmente?";

      const normalizaNombre = (nombre) =>
        nombre
          ? nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim()
          : "";

      const conteo = d3.rollup(
        rawData,
        (v) => v.length,
        (d) => normalizaNombre(d[deptKey])
      );

      const projection = d3.geoMercator().fitSize([width, height], geoData);
      const path = d3.geoPath().projection(projection);

      const maxValue = d3.max(Array.from(conteo.values()));
      const color = d3.scaleSequential().domain([1, maxValue]).interpolator(d3.interpolateYlOrBr);

      d3.select(ref.current).select("svg").remove();
      const svg = d3
        .select(ref.current)
        .append("svg")
        .attr("width", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Tooltip
      let tooltip = d3.select("body").select(".map-tooltip");
      if (tooltip.empty()) {
        tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "map-tooltip")
          .style("position", "absolute")
          .style("background", "#222")
          .style("color", "#fff")
          .style("padding", "6px 10px")
          .style("border-radius", "4px")
          .style("pointer-events", "none")
          .style("font-size", "14px")
          .style("opacity", 0);
      }

      // Dibuja los departamentos
      g.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
          const cantidad = conteo.get(normalizaNombre(d.properties.NOMBRE_DPT)) || 0;
          return cantidad > 0 ? color(cantidad) : "#e0e0e0";
        })
        .attr("stroke", "#222")
        .attr("stroke-width", 1.5)
        .on("mouseover", function (event, d) {
          const nombre = d.properties.NOMBRE_DPT;
          const cantidad = conteo.get(normalizaNombre(nombre)) || 0;
          tooltip
            .style("opacity", 1)
            .html(`<strong>${nombre}</strong><br/>${cantidad} desarrolladores`)
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
    });
  }, []);

  return (
     <div className="map-container">
    <Typography variant="h4" gutterBottom>
      Desarrolladores por departamento
    </Typography>
    <Typography variant="body1" className="map-description">
      Gracias a los 1001 desarrolladores que respondieron la encuesta. Su participación fue clave para recolectar datos valiosos sobre las realidades laborales, tendencias tecnológicas y salarios en el desarrollo de software en Colombia para el 2025. Este proyecto no sería posible sin ustedes. ¡Mil gracias!
    </Typography>

    <div className="map-wrapper">
      <div ref={ref} className="map-svg" />
      <div className="map-legend">
        <p>Menos desarrolladores</p>
        <div className="legend-gradient" />
        <p>Más desarrolladores</p>
        
      </div>
    </div>
  </div>
  );
};

export default Map;
