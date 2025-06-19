import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import Nav from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Footer from "./components/Footer/Footer"; 
import SalaryvsExperience from "./components/SalaryVsExperience/SalaryvsExperience"; 
import SalaryVsLanguage from "./components/SalaryVsLanguage/SalaryVsLanguage";
import TypeOfCompany from "./components/TipeOfCompany/TypeOfCompany"
import EnglishLevel from "./components/EnglishLevel/EnglishLevel";
import "./App.css";

function App() {

  return (
    <ThemeProvider>
      <div >
        <Nav />
        <Hero />
        <SalaryvsExperience/>
        <SalaryVsLanguage />
        <TypeOfCompany /> 
        <EnglishLevel />
        <Footer/>

      </div>
    </ThemeProvider>
  )
}

export default App
