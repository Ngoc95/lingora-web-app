"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface DistributionChartProps {
    data: any[];
    dataKey: string;
    nameKey: string;
    type?: "bar" | "pie";
    height?: number;
    colors?: string[];
}

const DEFAULT_COLORS = [
    "#00BC7D", // primary
    "#00BBA7",
    "#00A63E",
    "#009689",
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
];

export function DistributionChart({
    data,
    dataKey,
    nameKey,
    type = "bar",
    height = 300,
    colors = DEFAULT_COLORS,
}: DistributionChartProps) {
    if (!data || data.length === 0) {
        return (
            <div
                className="flex items-center justify-center bg-[var(--neutral-50)] rounded-lg"
                style={{ height }}
            >
                <p className="text-[var(--neutral-500)]">Không có dữ liệu</p>
            </div>
        );
    }

    if (type === "pie") {
        return (
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry: any) => `${entry[nameKey]}: ${entry[dataKey]}`}
                    >
                        {data.map((index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid var(--neutral-200)",
                            borderRadius: "8px",
                            fontSize: "12px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
                <XAxis
                    dataKey={nameKey}
                    stroke="var(--neutral-600)"
                    style={{ fontSize: "12px" }}
                />
                <YAxis stroke="var(--neutral-600)" style={{ fontSize: "12px" }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid var(--neutral-200)",
                        borderRadius: "8px",
                        fontSize: "12px",
                    }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey={dataKey} fill={colors[0]} name="Số lượng" />
            </BarChart>
        </ResponsiveContainer>
    );
}
