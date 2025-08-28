import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import Nav from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import SalaryVsExperience from "./components/SalaryVsExperience/SalaryVsExperience";
import SalaryVsLanguage from "./components/SalaryVsLanguage/SalaryVsLanguage";
import TypeOfCompany from "./components/TipeOfCompany/TypeOfCompany"
import EnglishLevel from "./components/EnglishLevel/EnglishLevel";
import LanguageChart from "./components/Language/Language";
import Map from "./components/Map/Map";
import EnglishSalary from "./components/EnglishSalary/EnglishSalary";
import "./App.css";
import Education from "./components/Education/Education";
import Mode from "./components/Mode/Mode";
import ScrollControls from "./components/ScrollControls/ScrollControls";

function App() {

  return (
    <ThemeProvider>
      <div className="app-container">
        <Nav />
        <main className="main-content">
          <section id="hero" className="section">
            <Hero />
          </section>
          <section id="map" className="section">
            <Map/>
          </section>
          <section id="languages" className="section">
            <LanguageChart/>
          </section>
          <section id="education" className="section">
            <Education/>
          </section>
          <section id="english-level" className="section">
            <EnglishLevel />
          </section>
          <section id="english-salary" className="section">
            <EnglishSalary />
          </section>
          <section id="work-mode" className="section">
            <Mode/>
          </section>
          <section id="company-type" className="section">
            <TypeOfCompany /> 
          </section>
          <section id="salary-language" className="section">
            <SalaryVsLanguage />
          </section>
          <section id="salary-experience" className="section">
            <SalaryVsExperience/>
          </section>
        </main>
        <ScrollControls />
      </div>
    </ThemeProvider>
  )
}

export default App