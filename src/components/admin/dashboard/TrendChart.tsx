"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface TrendChartProps {
    data: any[];
    dataKeys: Array<{
        key: string;
        name: string;
        color: string;
    }>;
    xAxisKey: string;
    height?: number;
}

export function TrendChart({
    data,
    dataKeys,
    xAxisKey,
    height = 300,
}: TrendChartProps) {
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

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
                <XAxis
                    dataKey={xAxisKey}
                    stroke="var(--neutral-600)"
                    style={{ fontSize: "12px" }}
                />
                <YAxis
                    stroke="var(--neutral-600)"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => {
                        // Format Y-axis values with thousand separators
                        if (typeof value === 'number') {
                            return value.toLocaleString("vi-VN");
                        }
                        return value;
                    }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid var(--neutral-200)",
                        borderRadius: "8px",
                        fontSize: "12px",
                    }}
                    formatter={(value: any, name?: string) => {
                        // Format numbers with thousand separators
                        if (typeof value === 'number') {
                            return [value.toLocaleString("vi-VN"), name || ''];
                        }
                        return [value, name || ''];
                    }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                {dataKeys.map((dataKey) => (
                    <Line
                        key={dataKey.key}
                        type="monotone"
                        dataKey={dataKey.key}
                        stroke={dataKey.color}
                        strokeWidth={2}
                        name={dataKey.name}
                        dot={{ fill: dataKey.color, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
