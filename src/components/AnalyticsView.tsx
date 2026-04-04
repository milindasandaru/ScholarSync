import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line,
} from "recharts";

const questionsPerModule = [
  { module: "CS301", questions: 45 },
  { module: "CS201", questions: 61 },
  { module: "CS401", questions: 37 },
  { module: "CS302", questions: 28 },
  { module: "CS501", questions: 50 },
  { module: "CS202", questions: 32 },
];

const participationTrend = [
  { week: "W1", students: 120 },
  { week: "W2", students: 148 },
  { week: "W3", students: 190 },
  { week: "W4", students: 170 },
  { week: "W5", students: 200 },
  { week: "W6", students: 275 },
  { week: "W7", students: 310 },
];

const popularTags = [
  { name: "SQL", value: 35, color: "hsl(230, 80%, 25%)" },
  { name: "Trees", value: 20, color: "hsl(25, 95%, 55%)" },
  { name: "Networks", value: 15, color: "hsl(145, 65%, 40%)" },
  { name: "SOLID", value: 18, color: "hsl(0, 0%, 55%)" },
  { name: "ML", value: 12, color: "hsl(40, 90%, 50%)" },
];

const topContributors = [
  { rank: 1, name: "Maria Garcia", answers: 42, votes: 156 },
  { rank: 2, name: "James Wilson", answers: 38, votes: 134 },
  { rank: 3, name: "Alex Johnson", answers: 35, votes: 128 },
  { rank: 4, name: "Emily Brown", answers: 31, votes: 112 },
];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }: any) => {
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs fill-foreground"
    >
      {name} {value}%
    </text>
  );
};

const AnalyticsView = () => {
  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Analytics</h2>
      <p className="text-muted-foreground">
        
      </p>

      {/* Grid with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Questions per Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={questionsPerModule}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,85%)" vertical={false} />
                <XAxis dataKey="module" stroke="hsl(0,0%,40%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(0,0%,90%)", borderRadius: 8 }} />
                <Bar dataKey="questions" fill="hsl(230, 80%, 25%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Student Participation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={participationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,85%)" vertical={false} />
                <XAxis dataKey="week" stroke="hsl(0,0%,40%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(0,0%,90%)", borderRadius: 8 }} />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(25, 95%, 55%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(25, 95%, 55%)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Popular Tags</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularTags}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  strokeWidth={0}
                  label={renderCustomLabel}
                  labelLine={{ stroke: "hsl(25, 95%, 55%)", strokeWidth: 1 }}
                >
                  {popularTags.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topContributors.map((c) => (
              <div
                key={c.rank}
                className="flex items-center gap-4 bg-muted/50 rounded-lg p-4"
              >
                <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                  {c.rank}
                </span>
                <div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.answers} answers · {c.votes} votes
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AnalyticsView;
