import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MessageCircle,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Question = {
  id: string;
  title: string;
  tags: string[];
  answers: number;
  comments: number;
  lecturerAnswered: boolean;
  author: string;
  date: string;
};

type Module = {
  id: string;
  code: string;
  name: string;
  total: number;
  questions: Question[];
};

const sampleModules: Module[] = [
  {
    id: "1",
    code: "CS301",
    name: "Database Systems",
    total: 44,
    questions: [
      {
        id: "q1",
        title: "Difference between INNER JOIN and LEFT JOIN?",
        tags: ["SQL", "Joins"],
        answers: 24,
        comments: 5,
        lecturerAnswered: true,
        author: "Maria Garcia",
        date: "2026-02-15",
      },
      {
        id: "q2",
        title: "Best practices for normalizing a relational database?",
        tags: ["Database Systems", "Normalization", "Database Design"],
        answers: 18,
        comments: 4,
        lecturerAnswered: true,
        author: "Daniel Lee",
        date: "2026-02-18",
      },
    ],
  },
  {
    id: "2",
    code: "CS401",
    name: "Software Engineering",
    total: 38,
    questions: [
      {
        id: "q3",
        title: "Explain SOLID principles with examples",
        tags: ["SOLID", "Design Patterns"],
        answers: 31,
        comments: 7,
        lecturerAnswered: true,
        author: "Alex Johnson",
        date: "2026-02-13",
      },
    ],
  },
  {
    id: "3",
    code: "CS205",
    name: "Data Structures",
    total: 33,
    questions: [
      {
        id: "q4",
        title: "Difference between Stack and Queue?",
        tags: ["Stack", "Queue"],
        answers: 19,
        comments: 3,
        lecturerAnswered: true,
        author: "John Smith",
        date: "2026-02-12",
      },
    ],
  },
];

const ModulesView = () => {
  const [modules] = useState(sampleModules);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-100">

      {/* Header (same style) */}
      <div className="max-w-4xl mx-auto space-y-10 py-12">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Modules
          </h1>

          {/* Rectangle + Oval Button Style */}
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-blue-900 text-white hover:bg-blue-900 transition font-medium shadow"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-blue-900">
              <Plus className="w-4 h-4" />
            </span>
            Add Module
          </button>
        </div>

        {/* Modules */}
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-white border rounded-2xl p-6 shadow-sm"
          >
            {/* Module Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {module.name}
                </h2>

                <span className="inline-block mt-2 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {module.code}
                </span>

                <p className="text-sm text-gray-500 mt-3">
                  {module.total} questions total
                </p>
              </div>

              <div className="flex gap-4">
                <Pencil className="w-4 h-4 cursor-pointer text-gray-500" />
                <Trash2 className="w-4 h-4 cursor-pointer text-red-400" />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-5">
              {module.questions.map((q) => (
                <div
                  key={q.id}
                  className="border rounded-xl p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-6">

                    {/* Votes */}
                    <div className="flex flex-col items-center text-sm text-gray-500">
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">
                        {q.answers}
                      </span>

                      <MessageCircle className="w-4 h-4 mt-4 text-gray-600" />
                      <span className="font-medium text-gray-700">
                        {q.comments}
                      </span>
                    </div>

                    {/* Question */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        {q.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {q.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}

                        {q.lecturerAnswered && (
                          <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">
                            ✓ Lecturer Answered
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        by {q.author} · {q.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Module</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <Label>Module Code</Label>
                <Input placeholder="CS500" />
              </div>

              <div>
                <Label>Module Name</Label>
                <Input placeholder="Artificial Intelligence" />
              </div>
            </div>

            <DialogFooter>
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200"
              >
                Cancel
              </button>

              <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Add
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default ModulesView;