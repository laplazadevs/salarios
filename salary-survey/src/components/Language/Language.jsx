import React, { useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import Typography from "@mui/material/Typography";
import "./Language.scss"

const CirclePacking = () => {
  const svgRef = useRef();
  const [totalesPorRango, setTotalesPorRango] = useState({});

  useEffect(() => {
    const width = 500;
    const height = 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    d3.csv("/data/20250603.csv").then((rawData) => {
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

      const agrupado = {};
      rawData.forEach((d) => {
        const r = rango(d[expKey]);
        const l = d[langKey];
        if (!r || !l) return;
        if (!agrupado[r]) agrupado[r] = {};
        agrupado[r][l] = (agrupado[r][l] || 0) + 1;
      });

      const data = {
        name: "Desarrolladores",
        children: Object.entries(agrupado).map(([rango, lenguajes]) => ({
          name: rango,
          children: Object.entries(lenguajes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([lenguaje, value]) => ({
              name: lenguaje,
              value,
            })),
        })),
      };

      const totalesPorRango = {};
      if (data && data.children) {
        data.children.forEach(rango => {
          totalesPorRango[rango.name] = rango.children.reduce((acc, l) => acc + l.value, 0);
        });
      }
      setTotalesPorRango(totalesPorRango);

      const root = d3
        .hierarchy(data)
        .sum((d) => d.value || 0)
        .sort((a, b) => b.value - a.value);

      d3.pack().size([width, height]).padding(5)(root);

      const g = svg
        .append("g")
        .attr("transform", `translate(0,0)`);

      const node = g
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      node.append("circle")
        .attr("r", (d) => d.r)
        .attr("fill", (d) =>
          d.depth === 1 ? "#f4a261" : d.depth === 2 ? "#e9c46a" : "#2a9d8f"
        )
        .attr("stroke", "#fff");

      node
        .filter((d) => d.depth === 2 && d.r > 18)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("font-size", "12px")
        .attr("fill", "#222")
        .text((d) => d.data.name);

      node
        .filter((d) => d.depth === 1)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em");

            // Tooltip
      let tooltip = d3.select("body").select(".tooltip");
      if (tooltip.empty()) {
        tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "#222")
          .style("color", "#fff")
          .style("padding", "6px 10px")
          .style("border-radius", "4px")
          .style("pointer-events", "none")
          .style("font-size", "14px")
          .style("opacity", 0);
      }

      node
        .filter((d) => d.depth === 2)
        .on("mouseover", function (event, d) {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>Rango: ${d.parent.data.name}</strong><br/>
               Lenguaje: ${d.data.name}<br/>
               <strong>${d.value}</strong> desarrolladores`
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
    });
  }, []);

  return (
    <div className="language-section">
      <Typography variant="h4">Desarrolladores por experiencia y lenguaje</Typography>
      <Typography variant="body1" style={{ marginTop: "20px" }}>
        En la gráfica se analizaron los rangos de experiencia definidos como: Junior (0 a 2 años), Mid (2 a 5 años) y Senior (más de 5 años, aunque este último depende más de habilidades que del tiempo).
        JavaScript, Python y TypeScript destacan como los lenguajes más populares en todos los niveles, lo que refleja su alta demanda en la industria.
        Los perfiles Junior y Mid muestran una mayor diversidad de lenguajes utilizados.
        En cambio, los desarrolladores Senior tienden a enfocarse en un número menor de tecnologías clave, lo que sugiere una mayor especialización con la experiencia.
      </Typography>
      <div style={{ margin: "20px 0", fontWeight: "bold", color: "#fff", fontSize: "18px" }}>
        {Object.entries(totalesPorRango).map(([rango, total]) => (
          <span key={rango} style={{ marginRight: 24 }}>
            {rango}: {total} desarrolladores
          </span>
      ))}
      </div>
      <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 600 600"
          width="100%"
          height="auto"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block", margin: "10px auto" }}
        />
      </div>
    </div>
  );
};

export default CirclePacking;
