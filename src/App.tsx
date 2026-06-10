import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import AutomationStudio from "./pages/AutomationStudio";
import MediaStudio from "./pages/MediaStudio";
import ProfessionalAppCore from "./components/ProfessionalAppCore";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Toaster position="top-center" richColors />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/editor" element={<ProfessionalAppCore />} />
      <Route path="/automation" element={<AutomationStudio />} />
      <Route path="/digital-processor" element={<MediaStudio />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
