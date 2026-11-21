'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MovementData {
  date: string;
  in_count: number;
  out_count: number;
}

interface MovementsChartProps {
  data: MovementData[];
}

export function MovementsChart({ data }: MovementsChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Mouvements récents</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-xs"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [
              value,
              name === 'in' ? 'Entrées (IN)' : 'Sorties (OUT)',
            ]}
          />
          <Legend />
          <Bar
            dataKey="in_count"
            name="IN"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="out_count"
            name="OUT"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
