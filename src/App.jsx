import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import Nav from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Footer from "./components/Footer/Footer"; 
import SalaryVsExperience from "./components/SalaryVsExperience/SalaryVsExperience";
import SalaryVsLanguage from "./components/SalaryVsLanguage/SalaryVsLanguage";
import TypeOfCompany from "./components/TipeOfCompany/TypeOfCompany"
import EnglishLevel from "./components/EnglishLevel/EnglishLevel";
import CirclePacking from "./components/Language/Language";
import Map from "./components/Map/Map";
import EnglishSalary from "./components/EnglishSalary/EnglishSalary";
import "./App.css";
import Education from "./components/Education/Education";
import Mode from "./components/Mode/Mode";

function App() {

  return (
    <ThemeProvider>
      <div >
        <Nav />
        <Hero />
        <Map/>
        <CirclePacking/>
        <Education/>
        <EnglishLevel />
        <EnglishSalary />
        <Mode/>
        <TypeOfCompany /> 
        <SalaryVsLanguage />
        <SalaryVsExperience/>
        <Footer/>
      </div>
    </ThemeProvider>
  )
}

export default App