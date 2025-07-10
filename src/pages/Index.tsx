import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3, Users, Settings, Send, TrendingUp, Menu, History, LogOut, X } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { DashboardStats } from "@/components/DashboardStats";
import { OpinionSubmissionForm } from "@/components/OpinionSubmissionForm";
import { OpinionList } from "@/components/OpinionList";
import { UserManagement } from "@/components/UserManagement";
import { OpinionDetail } from "@/components/OpinionDetail";
import { AdminPanel } from "@/components/AdminPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("submit");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedOpinionId, setSelectedOpinionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 사용자 정보 확인 및 관리자 권한 설정
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setIsAdmin(user.role === '관리자');
      if (user.role === '관리자') {
        setActiveTab("dashboard");
      } else {
        setActiveTab("submit");
      }
    }
  }, []);

  // URL 해시 파라미터 처리
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash.startsWith('opinion/')) {
        const opinionId = hash.split('/')[1];
        setSelectedOpinionId(opinionId);
        setActiveTab('opinion-detail');
      } else if (hash) {
        setActiveTab(hash);
        setSelectedOpinionId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    // 쿠키 삭제
    const cookies = ['company', 'dept', 'id', 'name', 'email', 'role', 'isAdmin'];
    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // localStorage 삭제
    localStorage.removeItem('userInfo');
    
    // 로그인 페이지로 이동
    window.location.href = '/login';
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-bold text-orange-600">열린마음 협의회</h1>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              {isAdmin && (
                <button
                  onClick={() => handleTabChange("dashboard")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "dashboard"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>대시보드</span>
                </button>
              )}
              
              <button
                onClick={() => handleTabChange("submit")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "submit"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <Send className="h-4 w-4" />
                <span>의견제출</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleTabChange("admin")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "admin"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>의견관리</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleTabChange("users")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "users"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>사용자</span>
                </button>
              )}
            </nav>

            {/* Desktop Logout Button */}
            <div className="hidden md:block">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 pb-3 pt-2">
              <div className="space-y-1">
                {isAdmin && (
                  <button
                    onClick={() => handleTabChange("dashboard")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "dashboard"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>대시보드</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleTabChange("submit")}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "submit"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>의견제출</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleTabChange("admin")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "admin"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>의견관리</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleTabChange("users")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "users"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>사용자</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="animate-fade-in">
          {activeTab === "dashboard" && (
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <div className="text-left space-y-2 md:space-y-4">
                <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">대시보드</h2>
              </div>
              <DashboardStats />
            </div>
          )}

          {activeTab === "submit" && (
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <div className="max-w-4xl mx-auto text-left space-y-2 md:space-y-4">
                <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">의견 제출</h2>
              </div>
              <div className="max-w-4xl mx-auto">
                <OpinionSubmissionForm />
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <div className="text-left space-y-2 md:space-y-4">
                <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">이력</h2>
                <p className="text-base md:text-lg lg:text-xl text-gray-600">제출한 의견들의 이력을 확인해보세요</p>
              </div>
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
                      <History className="h-4 w-4 md:h-5 md:w-5" />
                      <span>나의 의견 제출 이력</span>
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      지금까지 제출한 의견들을 확인할 수 있습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm md:text-base">아직 제출한 의견이 없습니다.</p>
                      <p className="text-xs md:text-sm">의견을 제출하면 여기에서 확인할 수 있습니다.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <UserManagement />
            </div>
          )}

          {activeTab === "admin" && (
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <AdminPanel />
            </div>
          )}

          {activeTab === "opinion-detail" && selectedOpinionId && (
            <OpinionDetail opinionId={selectedOpinionId} isAdmin={isAdmin} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
