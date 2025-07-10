import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, Calendar, User, MessageSquare, FileText, CalendarRange, List, Grid, Eye, X } from "lucide-react";

interface Opinion {
  id: string;
  title: string;
  content: string;
  category: string;
  affiliate: string;
  department: string;
  employeeId: string;
  name: string;
  status: "submitted" | "in_review" | "actioned" | "deferred" | "rejected";
  submittedAt: string;
  updatedAt: string;
  aiSummary?: string;
  keywords?: string[];
}

interface OpinionListProps {
  isAdmin: boolean;
}

export const OpinionList = ({ isAdmin }: OpinionListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewType, setViewType] = useState("card"); // 기본을 카드로 변경
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Mock data - 실제 구현에서는 API에서 가져올 데이터
  const mockOpinions: Opinion[] = [
    {
      id: "1",
      title: "사내 카페테리아 메뉴 개선 요청",
      content: "현재 사내 카페테리아의 메뉴가 너무 단조롭고 가격이 비싸다고 생각합니다. 더 다양하고 건강한 메뉴 옵션을 제공해주시면 좋겠습니다.",
      category: "복리후생 혁신",
      affiliate: "오케이저축은행",
      department: "총무팀",
      employeeId: "2024001",
      name: "김직원",
      status: "in_review",
      submittedAt: "2024-01-15",
      updatedAt: "2024-01-16",
      aiSummary: "사내 카페테리아의 메뉴 다양성과 가격 개선을 요청하는 의견",
      keywords: ["카페테리아", "메뉴", "가격", "건강식"]
    },
    {
      id: "2", 
      title: "재택근무 정책 확대 건의",
      content: "코로나19 이후 재택근무의 효율성이 입증되었습니다. 주 2-3일 재택근무를 정규 정책으로 도입해주시면 워라밸 개선에 도움이 될 것 같습니다.",
      category: "근무환경 개선",
      affiliate: "오케이캐피탈",
      department: "영업팀",
      employeeId: "2024002",
      name: "이사원",
      status: "actioned",
      submittedAt: "2024-01-10",
      updatedAt: "2024-01-20",
      aiSummary: "재택근무 정책의 정규화 및 확대를 건의하는 의견",
      keywords: ["재택근무", "워라밸", "정책", "효율성"]
    },
    {
      id: "3",
      title: "팀 간 소통 도구 개선",
      content: "현재 사용 중인 메신저 도구가 불편합니다. 더 효율적인 협업 도구 도입을 검토해주세요.",
      category: "소통/문화 변화",
      affiliate: "오케이홀딩스",
      department: "IT팀",
      employeeId: "2024003",
      name: "박대리",
      status: "submitted",
      submittedAt: "2024-01-25",
      updatedAt: "2024-01-25",
      aiSummary: "팀 간 소통 및 협업 도구의 개선을 요청하는 의견",
      keywords: ["소통", "협업도구", "메신저", "효율성"]
    }
  ];

  const getStatusColor = (status: Opinion["status"]) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "actioned":
        return "bg-green-100 text-green-800";
      case "deferred":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Opinion["status"]) => {
    switch (status) {
      case "submitted":
        return "제출됨";
      case "in_review":
        return "검토 중";
      case "actioned":
        return "처리됨";
      case "deferred":
        return "보류";
      case "rejected":
        return "거부됨";
      default:
        return "알 수 없음";
    }
  };

  const filteredOpinions = mockOpinions.filter(opinion => {
    const matchesSearch = opinion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opinion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || opinion.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || opinion.category === categoryFilter;
    
    // 기간 필터링
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && opinion.submittedAt >= dateFrom;
    }
    if (dateTo) {
      matchesDate = matchesDate && opinion.submittedAt <= dateTo;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  const handleViewDetail = (opinionId: string) => {
    const opinion = mockOpinions.find(op => op.id === opinionId);
    if (opinion) {
      setSelectedOpinion(opinion);
      setShowDetailDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowDetailDialog(false);
    setSelectedOpinion(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>필터 및 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="제목이나 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="submitted">제출됨</SelectItem>
                <SelectItem value="in_review">검토 중</SelectItem>
                <SelectItem value="actioned">처리됨</SelectItem>
                <SelectItem value="deferred">보류</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                <SelectItem value="근무환경 개선">근무환경 개선</SelectItem>
                <SelectItem value="복리후생 혁신">복리후생 혁신</SelectItem>
                <SelectItem value="소통/문화 변화">소통/문화 변화</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">📅 시작일</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">📅 종료일</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* View Type Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Label className="text-sm font-medium">📋 보기 형식:</Label>
              <RadioGroup
                value={viewType}
                onValueChange={setViewType}
                orientation="horizontal"
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center space-x-1 cursor-pointer">
                    <Grid className="h-4 w-4" />
                    <span>카드</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="list" id="list" />
                  <Label htmlFor="list" className="flex items-center space-x-1 cursor-pointer">
                    <List className="h-4 w-4" />
                    <span>리스트</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              📊 총 {filteredOpinions.length}건의 의견
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opinion Display */}
      {viewType === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOpinions.map((opinion) => (
            <Card key={opinion.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base md:text-lg line-clamp-2 flex-1">
                    {opinion.title}
                  </CardTitle>
                  <Badge className={getStatusColor(opinion.status)}>
                    {getStatusText(opinion.status)}
                  </Badge>
                </div>
                <CardDescription className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{opinion.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{opinion.submittedAt}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {opinion.category}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {opinion.content}
                </p>
                
                {/* Keywords */}
                {opinion.keywords && (
                  <div className="flex flex-wrap gap-1">
                    {opinion.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {opinion.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{opinion.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">
                    {opinion.affiliate} • {opinion.department}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetail(opinion.id)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    상세보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">📅 날짜</TableHead>
                    <TableHead className="min-w-[120px]">🏷️ 키워드</TableHead>
                    <TableHead className="min-w-[200px]">📝 제목</TableHead>
                    <TableHead className="min-w-[120px]">🏢 계열사</TableHead>
                    <TableHead className="min-w-[100px]">🏷️ 부서</TableHead>
                    <TableHead className="min-w-[80px]">🔢 사번</TableHead>
                    <TableHead className="min-w-[80px]">👤 이름</TableHead>
                    <TableHead className="min-w-[100px]">📊 상태</TableHead>
                    <TableHead className="min-w-[100px]">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpinions.map((opinion) => (
                    <TableRow key={opinion.id}>
                      <TableCell className="text-sm">{opinion.submittedAt}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {opinion.keywords?.slice(0, 2).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{opinion.title}</TableCell>
                      <TableCell className="text-sm">{opinion.affiliate}</TableCell>
                      <TableCell className="text-sm">{opinion.department}</TableCell>
                      <TableCell className="text-sm">{opinion.employeeId}</TableCell>
                      <TableCell className="text-sm">{opinion.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(opinion.status)}>
                          {getStatusText(opinion.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetail(opinion.id)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredOpinions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">🔍 검색 조건에 맞는 의견이 없습니다.</p>
          </CardContent>
        </Card>
      )}

      {/* Opinion Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-600 flex items-center justify-between">
              <span>📝 의견 상세보기</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDialog}
                className="hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOpinion && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">제출자 정보</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p><strong>이름:</strong> {selectedOpinion.name}</p>
                    <p><strong>사번:</strong> {selectedOpinion.employeeId}</p>
                    <p><strong>소속:</strong> {selectedOpinion.affiliate} • {selectedOpinion.department}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">제출 정보</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p><strong>제출일:</strong> {selectedOpinion.submittedAt}</p>
                    <p><strong>수정일:</strong> {selectedOpinion.updatedAt}</p>
                    <p><strong>상태:</strong> 
                      <Badge className={`ml-2 ${getStatusColor(selectedOpinion.status)}`}>
                        {getStatusText(selectedOpinion.status)}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Title and Category */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">카테고리</Label>
                  <Badge variant="outline" className="ml-2">{selectedOpinion.category}</Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">제목</Label>
                  <h3 className="text-lg font-semibold mt-1">{selectedOpinion.title}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">내용</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedOpinion.content}
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              {selectedOpinion.aiSummary && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">AI 요약</Label>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800">{selectedOpinion.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Keywords */}
              {selectedOpinion.keywords && selectedOpinion.keywords.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">키워드</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpinion.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">관리자 액션</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      상태 변경
                    </Button>
                    <Button variant="outline" size="sm">
                      답변 작성
                    </Button>
                    <Button variant="outline" size="sm">
                      이력 확인
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
