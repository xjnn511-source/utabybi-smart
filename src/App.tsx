import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AutomationStudio from "./pages/AutomationStudio";
import MediaStudio from "./pages/MediaStudio";
import ProfessionalAppCore from "./components/ProfessionalAppCore";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Toaster position="top-center" richColors />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/editor"
        element={
          <ProtectedRoute>
            <ProfessionalAppCore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation"
        element={
          <ProtectedRoute>
            <AutomationStudio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/digital-processor"
        element={
          <ProtectedRoute>
            <MediaStudio />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
