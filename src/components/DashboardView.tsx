import { BookOpen, HelpCircle, MessageCircle, Users, ChevronUp, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const stats = [
  { label: "My Modules", value: "3", icon: BookOpen, change: "" },
  { label: "Total Questions", value: "7", icon: HelpCircle, change: "" },
  { label: "Answers Given", value: "142", icon: MessageCircle, change: "" },
  { label: "Active Students", value: "328", icon: Users, change: "+12 this week" },
];

const questionsPerModule = [
  { module: "CS301", questions: 45 },
  { module: "CS201", questions: 61 },
  { module: "CS401", questions: 37 },
  { module: "CS302", questions: 28 },
  { module: "CS501", questions: 50 },
];

const answerRateData = [
  { name: "Answered", value: 72 },
  { name: "Pending", value: 28 },
];

const ANSWER_COLORS = ["hsl(230, 80%, 25%)", "hsl(30, 95%, 55%)"];

const unansweredQuestions = [
  { id: "1", title: "How does a Binary Search Tree maintain balance?", tags: ["Data Structures", "Trees", "BST", "Balancing"], author: "James Wilson", date: "2026-02-14", upvotes: 18, comments: 3 },
  { id: "2", title: "Gradient Descent vs Stochastic Gradient Descent", tags: ["Machine Learning", "Optimization", "ML"], author: "David Lee", date: "2026-02-11", upvotes: 22, comments: 6 },
  { id: "3", title: "Best practices for normalizing a relational database?", tags: ["Database Systems", "Normalization", "Database Design"], author: "Sophie Turner", date: "2026-02-10", upvotes: 12, comments: 2 },
];

const yourModules = [
  { code: "CS301", questions: 45 },
  { code: "CS401", questions: 38 },
  { code: "CS202", questions: 33 },
];

const DashboardView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome, Dr. Sarah Chen!</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your modules and student questions</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                  {s.change && <p className="text-xs text-success mt-1">{s.change}</p>}
                </div>
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="animate-fade-in" style={{ animationDelay: "320ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Questions per Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={questionsPerModule}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" vertical={false} />
                <XAxis dataKey="module" stroke="hsl(0, 0%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(0, 0%, 50%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(0, 0%, 90%)", borderRadius: 8 }} />
                <Bar dataKey="questions" fill="hsl(230, 80%, 25%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Answer Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={answerRateData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={95} strokeWidth={0}>
                  {answerRateData.map((_, i) => (
                    <Cell key={i} fill={ANSWER_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 text-sm mt-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: ANSWER_COLORS[0] }} />
                Answered (72%)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: ANSWER_COLORS[1] }} />
                Pending (28%)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-warning" />
          Unanswered Questions
        </h3>
        {unansweredQuestions.map((q, i) => (
          <Card key={q.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5 flex gap-5">
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground min-w-[40px]">
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm font-semibold text-foreground">{q.upvotes}</span>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <MessageCircle className="h-3 w-3" />
                  {q.comments}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm">{q.title}</h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {q.tags.map((tag) => (
                    <Badge key={tag} className="text-xs font-normal bg-secondary">{tag}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">by {q.author} · {q.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Your Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {yourModules.map((m, i) => (
            <Card key={m.code} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4 flex items-center justify-between">
                <Badge className="font-semibold bg-secondary">{m.code}</Badge>
                <span className="text-sm text-muted-foreground">{m.questions} questions</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
