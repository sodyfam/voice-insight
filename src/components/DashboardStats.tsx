
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  // Supabase에서 대시보드 통계 데이터 가져오기
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        console.log('🔍 대시보드 데이터 조회 시작...');
        console.log('🔗 Supabase 연결 상태 확인 중...');
        
        // 0. 먼저 간단한 테이블 존재 확인
        console.log('🔍 테이블 존재 확인 중...');
        
        // 1. 총 의견 수 조회 (상세 오류 정보 포함)
        console.log('📊 총 의견 수 조회 중...');
        const { count: totalOpinions, error: countError } = await supabase
          .from('opinion')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('❌ 총 의견 수 조회 오류 상세:', {
            message: countError.message,
            details: countError.details,
            hint: countError.hint,
            code: countError.code
          });
          
          // 테이블이 없는 경우 빈 데이터 반환
          if (countError.code === 'PGRST116' || countError.message?.includes('does not exist')) {
            console.log('⚠️ opinion 테이블이 존재하지 않습니다. 빈 데이터를 반환합니다.');
            return {
              totalCnt: 0,
              userCnt: 0,
              processedCnt: 0,
              recentOpinions: [],
              categoryStats: [],
              companyStats: []
            };
          }
          
          throw countError;
        }
        console.log('✅ 총 의견 수:', totalOpinions);

        // 2. 참여자 수 조회 (고유 사용자)
        console.log('👥 참여자 수 조회 중...');
        const { data: uniqueUsers, error: usersError } = await supabase
          .from('opinion')
          .select('user_id')
          .not('user_id', 'is', null);
        
        if (usersError) {
          console.error('❌ 참여자 수 조회 오류:', {
            message: usersError.message,
            details: usersError.details,
            hint: usersError.hint,
            code: usersError.code
          });
          throw usersError;
        }
        
        const userCnt = new Set(uniqueUsers?.map(item => item.user_id)).size;
        console.log('✅ 참여자 수:', userCnt, '(고유 사용자 ID:', uniqueUsers?.length, '개)');

        // 3. 최근 의견 목록 조회 (간단한 쿼리로 변경)
        console.log('📝 최근 의견 목록 조회 중...');
        const { data: recentOpinions, error: recentError } = await supabase
          .from('opinion')
          .select('*')
          .order('reg_date', { ascending: false })
          .limit(10);

        if (recentError) {
          console.error('❌ 최근 의견 목록 조회 오류:', {
            message: recentError.message,
            details: recentError.details,
            hint: recentError.hint,
            code: recentError.code
          });
          throw recentError;
        } else {
          console.log('✅ 최근 의견 목록:', recentOpinions?.length, '개');
        }

        // 4. 처리 완료된 의견 수 조회
        console.log('⚡ 처리 완료 의견 수 조회 중...');
        const { count: processedCount, error: processedError } = await supabase
          .from('opinion')
          .select('*', { count: 'exact', head: true })
          .eq('status', '처리완료');

        if (processedError) {
          console.error('❌ 처리 완료 의견 수 조회 오류:', {
            message: processedError.message,
            details: processedError.details,
            hint: processedError.hint,
            code: processedError.code
          });
        } else {
          console.log('✅ 처리 완료 의견 수:', processedCount);
        }

        // 5. 카테고리별 분포 조회 (클라이언트 사이드 집계)
        console.log('📂 카테고리별 분포 조회 중...');
        let categoryStats = [];
        try {
          // 먼저 category 테이블 확인
          const { data: categories, error: categoriesError } = await supabase
            .from('category')
            .select('id, name');
          
          if (categoriesError) {
            console.error('❌ 카테고리 테이블 조회 오류:', {
              message: categoriesError.message,
              details: categoriesError.details,
              hint: categoriesError.hint,
              code: categoriesError.code
            });
          } else {
            console.log('✅ 카테고리 테이블:', categories?.length, '개');
            
            // opinion 테이블에서 category_id 조회
            const { data: allOpinions, error: opinionsError } = await supabase
              .from('opinion')
              .select('category_id');
            
            if (opinionsError) {
              console.error('❌ 카테고리 데이터 조회 오류:', opinionsError);
            } else if (allOpinions && categories) {
              // 클라이언트 사이드에서 GROUP BY 집계
              const categoryCount: { [key: string]: number } = {};
              allOpinions.forEach(opinion => {
                const category = categories.find(c => c.id === opinion.category_id);
                const categoryName = category?.name || '기타';
                categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
              });
              
              categoryStats = Object.entries(categoryCount).map(([name, count]) => ({
                category_name: name,
                count: count
              }));
            }
          }
          console.log('✅ 카테고리별 분포:', categoryStats);
        } catch (error) {
          console.error('❌ 카테고리 집계 오류:', error);
        }

        // 6. 계열사별 분포 조회 (클라이언트 사이드 집계)
        console.log('🏢 계열사별 분포 조회 중...');
        let companyStats = [];
        try {
          // 먼저 company_affiliate 테이블 확인
          const { data: companies, error: companiesError } = await supabase
            .from('company_affiliate')
            .select('id, name');
          
          if (companiesError) {
            console.error('❌ 계열사 테이블 조회 오류:', {
              message: companiesError.message,
              details: companiesError.details,
              hint: companiesError.hint,
              code: companiesError.code
            });
          } else {
            console.log('✅ 계열사 테이블:', companies?.length, '개');
            
            // opinion 테이블에서 company_id 조회
            const { data: allOpinions, error: opinionsError } = await supabase
              .from('opinion')
              .select('company_id');
            
            if (opinionsError) {
              console.error('❌ 계열사 데이터 조회 오류:', opinionsError);
            } else if (allOpinions && companies) {
              // 클라이언트 사이드에서 GROUP BY 집계
              const companyCount: { [key: string]: number } = {};
              allOpinions.forEach(opinion => {
                const company = companies.find(c => c.id === opinion.company_id);
                const companyName = company?.name || '기타';
                companyCount[companyName] = (companyCount[companyName] || 0) + 1;
              });
              
              companyStats = Object.entries(companyCount).map(([name, count]) => ({
                company_name: name,
                count: count
              }));
            }
          }
          console.log('✅ 계열사별 분포:', companyStats);
        } catch (error) {
          console.error('❌ 계열사 집계 오류:', error);
        }

        const result = {
          totalCnt: totalOpinions || 0,
          userCnt,
          processedCnt: processedCount || 0,
          recentOpinions: recentOpinions || [],
          categoryStats: categoryStats || [],
          companyStats: companyStats || []
        };

        console.log('🎉 최종 대시보드 데이터:', result);
        return result;
      } catch (error) {
        console.error('💥 Supabase 데이터 조회 전체 오류:', {
          error,
          message: error.message,
          stack: error.stack
        });
        throw error;
      }
    },
    refetchInterval: 30000, // 30초마다 새로고침
    retry: 1, // 재시도 횟수 제한
  });

  useEffect(() => {
    console.log('🔄 useEffect - isLoading:', isLoading, 'error:', error, 'data:', dashboardData);
    
    if (error) {
      console.error('🚨 대시보드 데이터 조회 오류:', error);
    }
    if (dashboardData) {
      console.log('📋 대시보드 데이터 수신 완료:', dashboardData);
    }
  }, [error, dashboardData, isLoading]);

  // 통계 계산
  const calculateStats = () => {
    console.log('🧮 통계 계산 시작, dashboardData:', dashboardData);
    
    if (!dashboardData) {
      console.log('❌ dashboardData가 없어서 기본값 반환');
      return {
        totalCnt: 0,
        userCnt: 0,
        participationRate: 0,
        processingRate: 0
      };
    }

    const { totalCnt, userCnt, processedCnt } = dashboardData;
    
    // 전체 직원 수를 2000명으로 가정 (실제로는 company_affiliate에서 가져와야 함)
    const participationRate = Math.floor((userCnt / 2000) * 100);
    const processingRate = totalCnt > 0 ? Math.floor((processedCnt / totalCnt) * 100) : 0;

    const result = {
      totalCnt,
      userCnt,
      participationRate,
      processingRate
    };
    
    console.log('📊 계산된 통계:', result);
    return result;
  };

  const stats = calculateStats();

  const statsCards = [
    {
      title: "📝 총 의견 수",
      value: isLoading ? "..." : stats.totalCnt.toString(),
      description: "제출된 전체 의견",
      icon: MessageSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: "up"
    },
    {
      title: "👥 참여자 수",
      value: isLoading ? "..." : stats.userCnt.toString(),
      description: "의견을 제출한 사용자",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up"
    },
    {
      title: "📊 참여율",
      value: isLoading ? "..." : `${stats.participationRate}%`,
      description: "전체 대비 참여 비율",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up"
    },
    {
      title: "⚡ 처리율",
      value: isLoading ? "..." : `${stats.processingRate}%`,
      description: "완료된 의견 비율",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up"
    }
  ];

  // 카테고리별 분포 데이터 처리
  const processCategoryData = () => {
    console.log('📊 카테고리 데이터 처리 시작:', dashboardData?.categoryStats);
    
    if (!dashboardData?.categoryStats || dashboardData.categoryStats.length === 0) {
      console.log('❌ 카테고리 데이터가 없음');
      return [];
    }

    const colors = [
      "hsl(25, 95%, 53%)", // orange-500
      "hsl(45, 93%, 47%)", // amber-500  
      "hsl(60, 84%, 60%)", // yellow-400
      "hsl(0, 84%, 60%)",  // red-500
      "hsl(330, 81%, 60%)", // pink-500
      "hsl(220, 13%, 46%)" // gray-600
    ];

    const result = dashboardData.categoryStats.map((item: any, index: number) => ({
      name: item.category_name || '기타',
      value: parseInt(item.count) || 0,
      fill: colors[index % colors.length]
    }));
    
    console.log('🎨 처리된 카테고리 차트 데이터:', result);
    return result;
  };

  const chartData = processCategoryData();

  // 계열사별 참여 현황 데이터 처리
  const processCompanyData = () => {
    console.log('🏢 계열사 데이터 처리 시작:', dashboardData?.companyStats);
    
    if (!dashboardData?.companyStats || dashboardData.companyStats.length === 0) {
      console.log('❌ 계열사 데이터가 없음');
      return [];
    }

    const maxCount = Math.max(...dashboardData.companyStats.map((item: any) => parseInt(item.count) || 0));
    const colors = ['bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-red-500'];

    const result = dashboardData.companyStats.map((item: any, index: number) => {
      const count = parseInt(item.count) || 0;
      return {
        name: item.company_name || '기타',
        count,
        percentage: maxCount > 0 ? Math.floor((count / maxCount) * 100) : 0,
        color: colors[index % colors.length]
      };
    });
    
    console.log('📊 처리된 계열사 데이터:', result);
    return result;
  };

  const affiliates = processCompanyData();

  // 최근 활동 데이터 처리
  const displayRecentActivities = () => {
    console.log('🕐 최근 활동 데이터 처리 시작:', dashboardData?.recentOpinions);
    
    if (!dashboardData?.recentOpinions || dashboardData.recentOpinions.length === 0) {
      console.log('❌ 최근 의견 데이터가 없음');
      return [{
        type: "정보",
        title: "아직 제출된 의견이 없습니다",
        author: "시스템",
        department: "",
        company: "",
        time: "지금",
        status: "안내",
        emoji: "📝",
        category: "",
        categoryColor: "bg-gray-50 text-gray-700 border-gray-300",
        isInappropriate: false
      }];
    }

    const result = dashboardData.recentOpinions
      .slice(0, 10)
      .map((opinion: any) => {
        console.log('📝 의견 처리 중:', opinion);
        
        const regDate = opinion.reg_date 
          ? new Date(opinion.reg_date).toLocaleDateString('ko-KR', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : "날짜 미상";

        // 부적절한 내용 확인 (negative_score >= 3)
        const inappropriateScore = opinion.negative_score || 0;
        const isInappropriate = inappropriateScore >= 3;

        const title = isInappropriate 
          ? "AI 자동 분석 결과, 부적절한 내용이 감지되어 비공개 처리 되었습니다."
          : opinion.title || "제목 없음";

        const name = isInappropriate ? "익명" : "OOO"; // 개인정보 보호를 위해 마스킹
        
        // 카테고리와 계열사 정보는 별도 조회가 필요하므로 기본값 사용
        const category = "기타"; // 추후 category_id로 조회 가능
        const status = opinion.status || "접수";
        const company = ""; // 추후 company_id로 조회 가능
        const department = ""; // 추후 user_id로 조회 가능

        const getEmojiByCategory = (cat: string) => {
          const emojiMap: { [key: string]: string } = {
            '업무개선': '💼',
            '복리후생': '🎁',
            '교육/훈련': '📚',
            '조직문화': '🤝',
            '시설환경': '🏢',
            '기타': '💭'
          };
          return emojiMap[cat] || '💭';
        };

        const getCategoryColor = (cat: string) => {
          const colorMap: { [key: string]: string } = {
            '업무개선': 'bg-blue-50 text-blue-700 border-blue-300',
            '복리후생': 'bg-green-50 text-green-700 border-green-300',
            '교육/훈련': 'bg-purple-50 text-purple-700 border-purple-300',
            '조직문화': 'bg-pink-50 text-pink-700 border-pink-300',
            '시설환경': 'bg-indigo-50 text-indigo-700 border-indigo-300',
            '기타': 'bg-gray-50 text-gray-700 border-gray-300'
          };
          return colorMap[cat] || 'bg-gray-50 text-gray-700 border-gray-300';
        };

        return {
          type: "의견",
          title,
          author: name,
          department,
          company,
          time: regDate,
          status,
          emoji: getEmojiByCategory(category),
          category,
          categoryColor: getCategoryColor(category),
          isInappropriate
        };
      });
      
    console.log('✅ 처리된 최근 활동:', result);
    return result;
  };

  const recentActivities = isLoading 
    ? [{ 
        type: "로딩", 
        title: "데이터를 불러오는 중입니다...", 
        author: "시스템", 
        department: "",
        company: "",
        time: "지금", 
        status: "로딩", 
        emoji: "⏳", 
        category: "",
        categoryColor: "bg-blue-50 text-blue-700 border-blue-300",
        isInappropriate: false
      }]
    : error 
    ? [{ 
        type: "오류",
        title: `데이터를 불러올 수 없습니다: ${error.message || '알 수 없는 오류'}`, 
        author: "시스템", 
        department: "",
        company: "",
        time: "지금", 
        status: "오류", 
        emoji: "❌", 
        category: "",
        categoryColor: "bg-red-50 text-red-700 border-red-300",
        isInappropriate: false
      }]
    : displayRecentActivities();

  // 오류 상태일 때 전체 대시보드에 오류 표시
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>데이터 로딩 오류</span>
            </CardTitle>
            <CardDescription className="text-red-600">
              Supabase 연결 또는 데이터 조회 중 오류가 발생했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-800 font-mono">
                {error.message || '알 수 없는 오류가 발생했습니다.'}
              </p>
              {(error as any).details && (
                <p className="text-xs text-gray-600 mt-2 font-mono">
                  세부사항: {(error as any).details}
                </p>
              )}
              {(error as any).hint && (
                <p className="text-xs text-blue-600 mt-2 font-mono">
                  힌트: {(error as any).hint}
                </p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Badge variant="outline" className="text-red-700 border-red-300">
                브라우저 콘솔(F12)에서 자세한 오류 정보를 확인하세요
              </Badge>
              <div className="text-sm text-gray-600">
                <p>가능한 해결 방법:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Supabase 프로젝트에서 테이블이 생성되었는지 확인</li>
                  <li>RLS(Row Level Security) 정책 비활성화 또는 수정</li>
                  <li>마이그레이션 파일 실행 여부 확인</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  {isLoading && <span className="text-sm text-gray-500">로딩 중...</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Layout - Recent Activity on Left, Others on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>🕐 최근 활동</span>
            </CardTitle>
            <CardDescription>
              최근 제출된 의견들 {isLoading && "(로딩 중...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl">{activity.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 ${activity.categoryColor}`}
                      >
                        {activity.category || activity.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{activity.author}</span>
                      {activity.department && (
                        <>
                          <span>•</span>
                          <span>{activity.department}</span>
                        </>
                      )}
                      {activity.company && (
                        <>
                          <span>•</span>
                          <span>{activity.company}</span>
                        </>
                      )}
                      <span>•</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1 py-0"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Charts and Stats */}
        <div className="space-y-6">
          {/* Category Distribution - Pie Chart */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>📊 카테고리별 분포</span>
              </CardTitle>
              <CardDescription>
                의견 유형별 현황 {isLoading && "(로딩 중...)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[250px] text-gray-500">
                  <span>카테고리 데이터를 불러오는 중...</span>
                </div>
              ) : chartData.length > 0 ? (
                <ChartContainer
                  config={{}}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-500">
                  <span>카테고리 데이터가 없습니다</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affiliate Participation */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <span>🏢 계열사별 참여 현황</span>
              </CardTitle>
              <CardDescription>
                계열사별 의견 제출 현황 {isLoading && "(로딩 중...)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">
                  계열사별 데이터를 불러오는 중...
                </div>
              ) : affiliates.length > 0 ? (
                affiliates.map((affiliate, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{affiliate.name}</span>
                      <span className="text-sm text-gray-500">{affiliate.count}건</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${affiliate.color} transition-all duration-500`}
                        style={{ width: `${affiliate.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  계열사별 데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
