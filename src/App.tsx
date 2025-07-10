
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { OpinionDetail } from "./components/OpinionDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <div className="min-h-screen w-full">
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/opinion/:id" element={<OpinionDetailPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Opinion Detail Page Component
const OpinionDetailPage = () => {
  const { id } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 실제 구현에서는 사용자 권한을 확인
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setIsAdmin(user.role === '관리자');
    }
  }, []);

  if (!id) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OpinionDetail opinionId={id} isAdmin={isAdmin} />
    </div>
  );
};

export default App;
