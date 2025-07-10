
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertCircle } from "lucide-react";

interface UserInfo {
  company?: string;
  dept?: string;
  id?: string;
  name?: string;
}

export const OpinionSubmissionForm = () => {
  const [formData, setFormData] = useState({
    category: "",
    affiliate: "",
    department: "",
    employeeId: "",
    name: "",
    title: "",
    currentSituation: "",
    suggestion: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // localStorage에서 사용자 정보 가져오기
  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo: UserInfo = JSON.parse(userInfoStr);
        setFormData(prev => ({
          ...prev,
          affiliate: userInfo.company || "",
          department: userInfo.dept || "",
          employeeId: userInfo.id || "",
          name: userInfo.name || ""
        }));
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
      }
    }
  }, []);

  const categories = [
    "💼 근무환경 개선",
    "🎁 복리후생 혁신", 
    "⚡ 업무 프로세스 개선",
    "📚 교육/개발 제안",
    "💬 소통/문화 변화",
    "💡 기타 혁신 아이디어"
  ];

  const affiliates = [
    "🏦 오케이저축은행",
    "💳 오케이캐피탈",
    "🏢 오케이홀딩스",
    "💻 오케이데이터시스템"
  ];

  // 이모지 제거 함수
  const removeEmojis = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  };

  // seq 값 생성 함수 (현재 타임스탬프 기반)
  const generateSeq = () => {
    return Date.now().toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.affiliate || !formData.department || 
        !formData.employeeId || !formData.name || !formData.title ||
        !formData.currentSituation || !formData.suggestion) {
      toast({
        title: "⚠️ 입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 쿠키에서 사용자 정보 가져오기
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const userInfo = {
        dept: getCookie('dept') || formData.department,
        id: getCookie('id') || formData.employeeId,
        name: getCookie('name') || formData.name,
        email: getCookie('email') || ""
      };

      // 제출할 데이터 준비 (이모지 제거, affiliate를 company로 변경, seq를 null로 설정)
      const submitData = {
        seq: null, // seq 키값을 null로 설정
        category: removeEmojis(formData.category),
        company: removeEmojis(formData.affiliate),
        department: formData.department,
        employeeId: formData.employeeId,
        name: formData.name,
        title: formData.title,
        currentSituation: formData.currentSituation,
        suggestion: formData.suggestion,
        userInfo: userInfo,
        timestamp: new Date().toISOString()
      };

      console.log("제출 데이터:", submitData);

      // Make.com webhook으로 데이터 전송
      const response = await fetch("https://hook.us2.make.com/vplimw73admlz31a4qaxzj1ue3778e31", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: "✨ 의견이 성공적으로 제출되었습니다!",
          description: "검토 후 처리 결과를 알려드리겠습니다.",
        });
        
        // 폼 초기화 (사용자 정보는 유지)
        const userInfoStr = localStorage.getItem('userInfo');
        let userInfo: UserInfo = {};
        if (userInfoStr) {
          try {
            userInfo = JSON.parse(userInfoStr);
          } catch (error) {
            console.error("사용자 정보 파싱 오류:", error);
          }
        }
        
        setFormData({
          category: "",
          affiliate: userInfo.company || "",
          department: userInfo.dept || "",
          employeeId: userInfo.id || "",
          name: userInfo.name || "",
          title: "",
          currentSituation: "",
          suggestion: ""
        });
      } else {
        throw new Error("서버 응답 오류");
      }
    } catch (error) {
      console.error("의견 제출 오류:", error);
      toast({
        title: "❌ 제출 실패",
        description: "의견 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardDescription>
          여러분의 소중한 의견을 부담 갖지 마시고 자유롭게 등록해 주세요. 😊
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 계열사 & 부서 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>계열사</Label>
              <Input
                value={formData.affiliate}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
                placeholder="자동으로 설정됩니다"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">부서</Label>
              <Input
                id="department"
                value={formData.department}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
                placeholder="자동으로 설정됩니다"
              />
            </div>
          </div>

          {/* 사번 & 이름 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="employeeId">사번</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
                placeholder="자동으로 설정됩니다"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={formData.name}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
                placeholder="자동으로 설정됩니다"
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div className="space-y-1.5">
            <Label>📋 카테고리 <span className="text-red-500">*</span></Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 제목 */}
          <div className="space-y-1.5">
            <Label htmlFor="title">📝 제목 <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              maxLength={100}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.title.length}/100
            </div>
          </div>

          {/* 현재상황 */}
          <div className="space-y-1.5">
            <Label htmlFor="currentSituation">📊 현재상황 <span className="text-red-500">*</span></Label>
            <Textarea
              id="currentSituation"
              placeholder="현재 상황을 자세히 설명해주세요"
              value={formData.currentSituation}
              onChange={(e) => setFormData(prev => ({ ...prev, currentSituation: e.target.value }))}
              maxLength={1000}
              className="min-h-[80px]"
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.currentSituation.length}/1000
            </div>
          </div>

          {/* 제안사항 */}
          <div className="space-y-1.5">
            <Label htmlFor="suggestion">💡 제안사항 <span className="text-red-500">*</span></Label>
            <Textarea
              id="suggestion"
              placeholder="구체적인 제안사항을 작성해주세요"
              value={formData.suggestion}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestion: e.target.value }))}
              maxLength={1000}
              className="min-h-[80px]"
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.suggestion.length}/1000
            </div>
          </div>

          {/* 주의사항 */}
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">제출 전 확인사항</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>🔒 제출된 의견은 수정이 불가능합니다</li>
                <li>🚫 허위 사실이나 타인을 비방하는 내용은 제재를 받을 수 있습니다</li>
              </ul>
            </div>
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>⏳ 처리 중...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                의견 제출하기
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
