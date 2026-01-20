// Dashboard API Response Types

// Date range filter
export interface DateRangeFilter {
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
}

// Overview Metrics
export interface OverviewMetrics {
    users: {
        total: number;
        active: number;
        new: number;
        growth: number; // percentage
    };
    studySets: {
        total: number;
        published: number;
        totalPurchases: number;
    };
    revenue: {
        total: number;
        thisPeriod: number;
        lastPeriod: number;
        growth: number; // percentage
    };
    exams: {
        total: number;
        published: number;
        totalAttempts: number;
        completedAttempts: number;
    };
}

// User Analytics
export interface UserAnalytics {
    growth: Array<{
        date: string;
        count: number;
    }>;
    byProficiency: Array<{
        proficiency: string;
        count: number;
    }>;
    byStatus: Array<{
        status: string;
        count: number;
    }>;
    activeUsers: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

// Learning Analytics
export interface LearningAnalytics {
    categories: {
        total: number;
        completedByUsers: number;
        avgProgress: string;
        popular: Array<{
            id: number;
            name: string;
            usersCount: number;
            avgProgress: string;
        }>;
    };
    topics: {
        total: number;
        completedByUsers: number;
        popular: Array<{
            id: number;
            name: string;
            usersCount: number;
        }>;
    };
    words: {
        total: number;
        learnedByUsers: number;
        avgPerUser: number;
    };
    learningTrend: Array<{
        date: string;
        wordsLearned: number;
        topicsCompleted: number;
    }>;
}

// Revenue Analytics
export interface RevenueAnalytics {
    trend: Array<{
        month: string;
        revenue: number;
        transactions: number;
    }>;
    transactions: {
        total: number;
        success: number;
        pending: number;
        failed: number;
        successRate: number;
    };
    topSelling: Array<{
        id: number;
        title: string;
        price: number;
        ownerUsername: string;
        sales: number;
        revenue: number;
    }>;
}

// Exam Analytics
export interface ExamAnalytics {
    overview: {
        totalExams: number;
        publishedExams: number;
        totalAttempts: number;
        completedAttempts: number;
        completionRate: number;
    };
    trend: Array<{
        date: string;
        attempts: number;
    }>;
    examPerformance: Array<{
        examId: number;
        title: string;
        code: string;
        attempts: number;
        completed: number;
        completionRate: number;
    }>;
    scoreDistribution: Array<{
        range: string;
        count: number;
    }>;
    averageScore: number;
    averageTimeMinutes: number;
}

// Recent Activity
export interface RecentActivity {
    type: 'USER_REGISTER' | 'PURCHASE' | 'EXAM_COMPLETED';
    timestamp: Date | string;
    user: {
        id: number;
        username: string;
        avatar?: string;
    };
    action: string;
    details?: any;
}
