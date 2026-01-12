"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Clock, Calendar, User, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { examAdminService } from "@/services/admin/exam.service";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminAttemptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: attemptIdStr } = use(params);
  const attemptId = Number(attemptIdStr);

  const [data, setData] = useState<any>(null); // Using any temporarily to match the nested structure flexibility
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await examAdminService.adminGetAttemptDetail(attemptId);
        setData(res.metaData);
      } catch (error) {
        toast.error("Không thể tải chi tiết bài thi");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [attemptId]);

  if (loading) return <div className="p-8 text-center">Đang tải chi tiết...</div>;
  if (!data || !data.attempt) return <div className="p-8 text-center">Không tìm thấy bài thi</div>;

  const { attempt, exam, scoreSummary, sections } = data;

  const getStatusBadge = (status: string) => {
    if (status === 'SUBMITTED') return <Badge className="bg-green-600 hover:bg-green-700">Hoàn thành</Badge>;
    if (status === 'IN_PROGRESS') return <Badge className="bg-blue-600 hover:bg-blue-700">Đang làm</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const bands = scoreSummary?.bands || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent hover:text-primary">
        <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
      </Button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-bold text-neutral-900">{exam?.title || "Unknown Exam"}</h1>
             {getStatusBadge(attempt.status)}
           </div>
           <p className="text-neutral-500 font-medium flex items-center gap-2">
             <FileText className="w-4 h-4" /> {exam?.code} • {exam?.examType}
           </p>
        </div>
        <div className="flex gap-4 text-sm text-neutral-600 bg-white p-3 rounded-lg border shadow-sm">
             <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                   <p className="text-xs text-gray-400 uppercase">Ngày làm bài</p>
                   <p className="font-medium">{attempt.startedAt ? new Date(attempt.startedAt).toLocaleDateString('vi-VN') : '-'}</p>
                </div>
             </div>
             <Separator orientation="vertical" className="h-10" />
             <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                   <p className="text-xs text-gray-400 uppercase">Bắt đầu</p>
                   <p className="font-medium">{attempt.startedAt ? new Date(attempt.startedAt).toLocaleTimeString('vi-VN') : '-'}</p>
                </div>
             </div>
             <Separator orientation="vertical" className="h-10" />
             <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <div>
                   <p className="text-xs text-gray-400 uppercase">Nộp bài</p>
                   <p className="font-medium">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString('vi-VN') : '-'}</p>
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User & Overview */}
          <div className="space-y-6">
              <Card>
                  <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" /> Thông tin thí sinh
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-3">
                          <div className="flex justify-between">
                              <span className="text-gray-500">ID</span>
                              <span className="font-medium">#{attempt.id}</span>
                          </div>
                          {/* Note: User info might need to be passed from backend if not in 'attempt' object directly. 
                              Based on user JSON, 'attempt' object didn't show user details. 
                              Usually attempts/admin has user info. Assuming it might be there or I can use what I have.
                              If 'user' is not distinct in JSON, I might miss it. 
                              But list view had it. Let's assume backend populates it in attempt or root. 
                              Checking JSON again: it doesn't show 'user' at root. It shows 'attempt', 'exam', 'scoreSummary'.
                              I will rely on 'data.user' if available, otherwise hide it or show ID.
                          */}
                          <div className="flex justify-between">
                              <span className="text-gray-500">Mode</span>
                              <Badge variant="secondary">{attempt.mode}</Badge>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2 text-center">
                      <CardTitle className="font-normal text-gray-600 text-sm uppercase tracking-wide">Overall Band Score</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                      <div className="text-6xl font-black text-primary">{bands.overall ?? "N/A"}</div>
                      <p className="text-sm text-gray-500 mt-2">IELTS Standard</p>
                  </CardContent>
              </Card>
          </div>

          {/* Right Column: Detailed Scores */}
          <div className="lg:col-span-2 space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Kết quả chi tiết</CardTitle>
                      <CardDescription>Điểm thành phần từng kỹ năng</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <ScoreCard title="Listening" score={bands.listening} icon="👂" />
                          <ScoreCard title="Reading" score={bands.reading} icon="📖" />
                          <ScoreCard title="Writing" score={bands.writing} icon="✍️" />
                          <ScoreCard title="Speaking" score={bands.speaking} icon="🗣️" />
                      </div>
                  </CardContent>
              </Card>

            {/* Sections Breakdown (if available) */}
            {scoreSummary?.sections && (
             <Card>
                  <CardHeader>
                      <CardTitle>Chi tiết phần thi</CardTitle>
                  </CardHeader>
                  <CardContent>
                        <div className="space-y-4">
                            {Object.entries(scoreSummary.sections).map(([key, val]: [string, any]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border text-xs font-bold shadow-sm">
                                            {key}
                                        </div>
                                        <div>
                                            <p className="font-medium">{val.sectionType}</p>
                                            <p className="text-xs text-gray-500">Correct: {val.correctCount}/{val.totalQuestions}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary">{val.band ?? "-"}</div>
                                        <div className="text-xs text-gray-500">Band</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                  </CardContent>
             </Card>
            )}
          </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, icon }: { title: string, score: number | null, icon: string }) {
    return (
        <div className="bg-white border rounded-xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
            <div className={`text-2xl font-bold ${score !== null ? 'text-neutral-900' : 'text-gray-300'}`}>
                {score ?? "-"}
            </div>
        </div>
    );
}
