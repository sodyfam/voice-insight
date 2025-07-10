import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminPanelHeader } from "./admin/AdminPanelHeader";
import { SearchFilters } from "./admin/SearchFilters";
import { SearchResults } from "./admin/SearchResults";
import { UserList } from "./admin/UserList";
import { LoadingState } from "./admin/LoadingState";
import { EmptyState } from "./admin/EmptyState";
import * as XLSX from 'xlsx';

interface AdminUser {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  affiliate: string;
  department: string;
  category: string;
  status: "active" | "inactive" | "pending";
  registeredAt: string;
}

interface OpinionData {
  id: string;
  seq: number;
  name: string;
  dept: string;
  company: string;
  category: string;
  title: string;
  tobe: string;
  status: string;
  reg_date: string;
  negative_score: number;
  prod_dept?: string;
  proc_desc?: string;
}

export const AdminPanel = () => {
  // Initialize with current year and current quarter based on current month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1
  const getCurrentQuarter = () => {
    if (currentMonth >= 1 && currentMonth <= 3) return "1";
    if (currentMonth >= 4 && currentMonth <= 6) return "2";
    if (currentMonth >= 7 && currentMonth <= 9) return "3";
    return "4";
  };
  
  const [year, setYear] = useState(currentYear.toString());
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  
  const [affiliateFilter, setAffiliateFilter] = useState("all");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [opinionData, setOpinionData] = useState<OpinionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  // Helper function to get quarter date range in YYYYMM format
  const getQuarterDateRange = (year: string, quarter: string) => {
    const quarterMap = {
      "1": { start: "01", end: "03" },
      "2": { start: "04", end: "06" },
      "3": { start: "07", end: "09" },
      "4": { start: "10", end: "12" }
    };
    
    const { start, end } = quarterMap[quarter as keyof typeof quarterMap];
    return {
      sDate: `${year}${start}`,
      eDate: `${year}${end}`
    };
  };

  // Add useEffect to automatically search when component mounts
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      const { sDate, eDate } = getQuarterDateRange(year, quarter);
      
      const searchParams = {
        sDate,
        eDate,
        company: affiliateFilter !== "all" ? affiliateFilter : "",
        employeeId: employeeIdFilter,
        category: categoryFilter !== "all" ? categoryFilter : "",
        status: statusFilter !== "all" ? statusFilter : ""
      };

      console.log("Sending search request:", searchParams);

      const response = await fetch("https://hook.us2.make.com/xa6akw0koxi856udayo40yxqh7ap0m97", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      
      // Handle different response formats
      let processedData: OpinionData[] = [];
      
      if (data.json) {
        // If response has json field with string, parse it
        const jsonString = data.json;
        processedData = JSON.parse(jsonString);
      } else if (Array.isArray(data)) {
        processedData = data;
      } else if (data.users) {
        // Legacy user data format
        const userData = Array.isArray(data.users) ? data.users : [];
        setUsers(userData);
        setHasSearched(true);
        
        toast({
          title: "조회 완료",
          description: `${userData.length}명의 사용자 정보를 조회했습니다.`,
        });
        setIsLoading(false);
        return;
      }
      
      setOpinionData(processedData);
      setHasSearched(true);
      
      toast({
        title: "조회 완료",
        description: `${processedData.length}건의 의견을 조회했습니다.`,
      });
      
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "조회 실패",
        description: "데이터 조회 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!opinionData || opinionData.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "조회된 데이터가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Filter out inappropriate content (negative_score >= 3)
      const filteredData = opinionData.filter(item => item.negative_score < 3);
      
      if (filteredData.length === 0) {
        toast({
          title: "내보내기 실패",
          description: "다운로드 가능한 데이터가 없습니다.",
          variant: "destructive"
        });
        return;
      }

      // Excel 데이터 구조 정의
      const excelData = filteredData.map((item, index) => ({
        'No': index + 1,
        '업무주관부서': item.prod_dept || '',
        '안건구분': item.category || '',
        '안건상세': item.title || '',
        '안건요청부서': item.dept || '',
        '상세내용': item.tobe || '',
        '답변': item.proc_desc || '',
        '등록일': item.reg_date || '',
        '상태': item.status || '',
        '작성자': item.name || '',
        '계열사': item.company || ''
      }));

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // 컬럼 너비 자동 조정
      const colWidths = [
        { wch: 5 },  // No
        { wch: 15 }, // 업무주관부서
        { wch: 20 }, // 안건구분
        { wch: 30 }, // 안건상세
        { wch: 15 }, // 안건요청부서
        { wch: 50 }, // 상세내용
        { wch: 50 }, // 답변
        { wch: 12 }, // 등록일
        { wch: 10 }, // 상태
        { wch: 10 }, // 작성자
        { wch: 15 }  // 계열사
      ];
      worksheet['!cols'] = colWidths;

      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(workbook, worksheet, '의견목록');

      // Excel 파일 다운로드
      const fileName = `의견목록_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      const excludedCount = opinionData.length - filteredData.length;
      const toastMessage = excludedCount > 0 
        ? `Excel 파일이 다운로드되었습니다. (부적절한 내용 ${excludedCount}건 제외)`
        : "Excel 파일이 다운로드되었습니다.";

      toast({
        title: "내보내기 완료",
        description: toastMessage,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "내보내기 실패",
        description: "Excel 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanelHeader />

      <SearchFilters
        year={year}
        setYear={setYear}
        quarter={quarter}
        setQuarter={setQuarter}
        affiliateFilter={affiliateFilter}
        setAffiliateFilter={setAffiliateFilter}
        employeeIdFilter={employeeIdFilter}
        setEmployeeIdFilter={setEmployeeIdFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onSearch={handleSearch}
        onExport={handleExport}
        isLoading={isLoading}
        hasSearched={hasSearched}
        userCount={opinionData.length}
      />

      {isLoading && <LoadingState />}

      {/* Search Results - Opinion Data */}
      {!isLoading && (
        <SearchResults 
          data={opinionData} 
          hasSearched={hasSearched}
        />
      )}

      {/* Legacy User List - for backward compatibility */}
      {hasSearched && !isLoading && users.length > 0 && (
        <UserList users={users} />
      )}

      {hasSearched && !isLoading && users.length === 0 && opinionData.length === 0 && (
        <EmptyState />
      )}
    </div>
  );
};
