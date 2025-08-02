// App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Calculator from "./tools/Calculator";
import BMICalculator from "./tools/BMI";
import WordCounter from "./tools/WordCounter";
import AgeCalculator from "./tools/AgeCalculator";
import SplitBillCalculator from "./tools/SplitBillCalculator";
import ColorTool from "./tools/ColorTool";
import AIChatbot from "./tools/AIChatbot";
import Currency from "./tools/Currency";
import Todolist from "./tools/Todolist";
import Weather from "./tools/Weather";
import TextSummarizer from "./tools/TextSummary"; 
import Password from "./tools/Password";
import News from "./tools/News"; 
import UnitConvert from "./tools/UnitConvert";
import Image from "./tools/Image";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/bmi" element={<BMICalculator />} /> 
      <Route path="/wordcounter" element={<WordCounter />} />
      <Route path="/agecalculator" element={<AgeCalculator />} />
      <Route path="/splitbill" element={<SplitBillCalculator />} />
      <Route path="/color" element={<ColorTool />} />
      <Route path="/chatbot" element={<AIChatbot />} />
      <Route path="/currency" element={<Currency />} />
      <Route path="/todo" element={<Todolist />} /> 
      <Route path="/weather" element={<Weather />} />
      <Route path="/summarizer" element={<TextSummarizer />} />
      <Route path="/password" element={<Password />} />
      <Route path="/news" element={<News />} /> 
      <Route path="/unitconvert" element={<UnitConvert />} />
      <Route path="/image" element={<Image />} />

    </Routes>
  );
}

export default App;
