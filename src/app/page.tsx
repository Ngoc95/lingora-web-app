import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// TODO: BE cần API GET /api/statistics để lấy số liệu thực
const STATS = {
  users: "10,000+",
  courses: "500+",
  words: "50,000+",
  tests: "1,000+",
};

const FEATURES = [
  {
    icon: BookOpen,
    title: "Học từ vựng thông minh",
    description: "Hệ thống flashcard và game tương tác giúp ghi nhớ từ vựng hiệu quả với spaced repetition.",
  },
  {
    icon: GraduationCap,
    title: "Luyện thi IELTS",
    description: "Đề thi thực tế với 4 kỹ năng: Listening, Reading, Writing, Speaking. Chấm điểm AI tự động.",
  },
  {
    icon: MessageCircle,
    title: "Trợ lý AI 24/7",
    description: "Chatbot thông minh hỗ trợ giải đáp mọi thắc mắc về tiếng Anh bất cứ lúc nào.",
  },
  {
    icon: Users,
    title: "Cộng đồng học tập",
    description: "Diễn đàn trao đổi, chia sẻ kinh nghiệm và tài liệu học tiếng Anh cùng cộng đồng.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Văn A",
    role: "Sinh viên",
    avatar: "A",
    content: "Lingora giúp tôi cải thiện điểm IELTS từ 5.5 lên 7.0 chỉ trong 3 tháng!",
  },
  {
    name: "Trần Thị B",
    role: "Nhân viên văn phòng",
    avatar: "B",
    content: "Học từ vựng chưa bao giờ dễ dàng đến thế. Tôi đã học được 2000 từ mới trong 2 tháng.",
  },
  {
    name: "Lê Văn C",
    role: "Giáo viên",
    avatar: "C",
    content: "Ứng dụng tuyệt vời để tự học và ôn luyện. Giao diện đẹp, dễ sử dụng.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[var(--neutral-200)] bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Button asChild className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)]">
              <Link href="/get-started">Đăng ký miễn phí</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-[var(--primary-600)]/20 to-[var(--primary-500)]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-500)]/10 px-4 py-2 text-sm font-medium text-[var(--primary-500)] mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Nền tảng học tiếng Anh #1 Việt Nam</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[var(--neutral-900)] md:text-6xl lg:text-7xl">
            Học tiếng Anh
            <span className="pb-5 block bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] bg-clip-text text-transparent">
              thông minh hơn
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--neutral-600)] md:text-xl">
            Lingora giúp bạn chinh phục tiếng Anh với phương pháp học hiện đại,
            trợ lý AI thông minh và cộng đồng năng động.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-lg px-8"
            >
              <Link href="/get-started">
                Bắt đầu học miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {[
              { value: STATS.users, label: "Học viên" },
              { value: STATS.courses, label: "Khóa học" },
              { value: STATS.words, label: "Từ vựng" },
              { value: STATS.tests, label: "Đề thi" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[var(--primary-500)] md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--neutral-600)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--neutral-50)] py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--neutral-900)] md:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="mt-4 text-[var(--neutral-600)]">
              Mọi thứ bạn cần để chinh phục tiếng Anh
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm transition-all hover:border-[var(--primary-500)] hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-lg shadow-[var(--primary-500)]/25">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[var(--neutral-900)] group-hover:text-[var(--primary-500)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--neutral-600)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Lingora Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-[var(--neutral-900)] md:text-4xl">
                Tại sao chọn Lingora?
              </h2>
              <p className="mt-4 text-[var(--neutral-600)]">
                Lingora được thiết kế dựa trên nghiên cứu khoa học về việc học ngôn ngữ,
                kết hợp công nghệ AI tiên tiến để mang đến trải nghiệm học tập hiệu quả nhất.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Phương pháp Spaced Repetition giúp ghi nhớ lâu",
                  "AI chấm điểm Speaking & Writing tức thì",
                  "Học mọi lúc, mọi nơi trên mọi thiết bị",
                  "Theo dõi tiến độ học tập chi tiết",
                  "Cộng đồng hỗ trợ nhiệt tình",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-[var(--primary-500)]" />
                    <span className="text-[var(--neutral-600)]">{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="mt-8 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)]"
              >
                <Link href="/get-started">
                  Trải nghiệm ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] p-1">
                <div className="h-full w-full rounded-[calc(1.5rem-4px)] bg-white p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Trophy className="mx-auto h-24 w-24 text-[var(--primary-500)]" />
                    <p className="mt-4 text-2xl font-bold text-[var(--neutral-900)]">
                      Đạt mục tiêu của bạn
                    </p>
                    <p className="mt-2 text-[var(--neutral-600)]">
                      Cùng Lingora chinh phục tiếng Anh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[var(--neutral-50)] py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--neutral-900)] md:text-4xl">
              Học viên nói gì về Lingora?
            </h2>
            <p className="mt-4 text-[var(--neutral-600)]">
              Hàng nghìn học viên đã cải thiện tiếng Anh cùng chúng tôi
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--neutral-900)]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[var(--neutral-600)]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-[var(--neutral-600)] italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] p-8 text-center md:p-16">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Sẵn sàng chinh phục tiếng Anh?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/90">
              Tham gia cùng hơn 10,000 học viên đang học tiếng Anh hiệu quả với Lingora.
              Đăng ký miễn phí ngay hôm nay!
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-white text-[var(--primary-500)] hover:bg-white/90 text-lg px-8"
              >
                <Link href="/get-started">
                  Đăng ký miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--neutral-200)] bg-[var(--neutral-50)] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Logo />
            <p className="text-sm text-[var(--neutral-600)]">
              © {new Date().getFullYear()} Lingora. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-[var(--neutral-600)] hover:text-[var(--primary-500)]">
                Điều khoản
              </Link>
              <Link href="#" className="text-sm text-[var(--neutral-600)] hover:text-[var(--primary-500)]">
                Chính sách
              </Link>
              <Link href="#" className="text-sm text-[var(--neutral-600)] hover:text-[var(--primary-500)]">
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}