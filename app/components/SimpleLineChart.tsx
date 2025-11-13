import React from 'react';

// --- SVGグラフコンポーネント ---
const SimpleLineChart: React.FC<{ data: { label: string, value: number }[], width: number, height: number }> = ({ data, width, height }) => {
    if (!data.length || width <= 0 || height <= 0) return null;

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const values = data.map(d => d.value);
    const maxValueRaw = Math.max(...values);
    const minValueRaw = Math.min(...values);

    // すべて0の場合は、グラフの範囲を0-100に設定
    const minValue = maxValueRaw === 0 ? 0 : minValueRaw * 0.9;
    const maxValue = maxValueRaw === 0 ? 100 : maxValueRaw * 1.1;
    const valueRange = maxValue - minValue;

    const normalizedData = data.map(d => ({
        ...d,
        normalizedY: (d.value - minValue) / (valueRange || 1),
    }));

    // データが1つの場合はxStepを0にする（ゼロ除算を防ぐ）
    const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

    const pathData = normalizedData.map((d, i) => {
        const x = padding + i * xStep;
        const y = padding + chartHeight * (1 - d.normalizedY);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* グラフ背景色 */}
            <rect x="0" y="0" width={width} height={height} fill="#1f2937" rx="10" />

            {/* Y軸目盛り (最大値、最小値) */}
            {[minValue, maxValue].map((value, i) => (
                <text
                    key={i}
                    x={padding / 2}
                    y={i === 0 ? height - padding : padding}
                    textAnchor="end"
                    fontSize="10"
                    fill="#4b5563"
                    dominantBaseline="middle"
                >
                    {Math.round(value).toLocaleString()}
                </text>
            ))}

            {/* 折れ線グラフ */}
            <path
                d={pathData}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* データポイントとX軸ラベル */}
            {normalizedData.map((d, i) => {
                const x = padding + i * xStep;
                const y = padding + chartHeight * (1 - d.normalizedY);
                return (
                    <React.Fragment key={d.label}>
                        <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#059669"
                            stroke="#ffffff"
                            strokeWidth="2"
                        />
                        {/* X軸ラベル: Y位置を調整し、下部に配置 */}
                        <text
                            x={x}
                            y={height - padding / 2}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6b7280"
                        >
                            {d.label}
                        </text>
                    </React.Fragment>
                );
            })}
        </svg>
    );
};

export default SimpleLineChart;