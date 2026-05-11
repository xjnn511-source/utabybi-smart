import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import UserDashboard from "./pages/UserDashboard";
import DigitalIndicators from "./pages/DigitalIndicators";

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-slate-950 text-white">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/automation" element={<UserDashboard />} />
        <Route path="/digital-processor" element={<DigitalIndicators />} />
        <Route path="/ai-voice" element={<Index />} />
      </Routes>
      
      {/* هذا الشريط سيجعل الأزرار تعمل فوراً */}
      <div className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-md flex justify-around p-4 border-t border-slate-800 z-50">
        <Link to="/" className="flex flex-col items-center gap-1">🏠 <span className="text-[10px]">الرئيسية</span></Link>
        <Link to="/automation" className="flex flex-col items-center gap-1">⚙️ <span className="text-[10px]">الأتمتة</span></Link>
        <Link to="/digital-processor" className="flex flex-col items-center gap-1">📊 <span className="text-[10px]">المعالج</span></Link>
      </div>
    </div>
  </BrowserRouter>
);

export default App;
