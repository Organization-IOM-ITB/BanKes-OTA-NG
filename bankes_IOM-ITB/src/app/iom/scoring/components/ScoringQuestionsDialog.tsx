"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Question {
  id: number;
  question: string;
}

export default function ScoringQuestionDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const handleDeleteQuestion = (id: number) => {
    setQuestionToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Gagal memuat pertanyaan.");
      }
    }

    if (open) {
      fetchQuestions();
    }
  }, [open]);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error("Pertanyaan tidak boleh kosong.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/questions/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion }),
      });

      if (!res.ok) throw new Error("Failed to add question");

      const addedQuestion = await res.json();
      setQuestions([...questions, addedQuestion]);
      setNewQuestion("");
      toast.success("Pertanyaan berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Gagal menambahkan pertanyaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" richColors />

      <Button variant="default" className="bg-main" onClick={handleOpenDialog}>
        Edit Pertanyaan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pertanyaan Penilaian</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 w-full my-4">
            <Label htmlFor="new-question">Tambah Pertanyaan Baru</Label>
            <div className="flex gap-2">
              <Textarea
                id="new-question"
                placeholder="Masukkan pertanyaan penilaian baru..."
                rows={2}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="default"
                className="self-start mt-1 bg-main text-white"
                onClick={handleAddQuestion}
                disabled={isLoading}
              >
                {isLoading ? "Menambah..." : "Tambah"}
              </Button>
            </div>
          </div>

          <table className="w-full my-4 border rounded-md">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="text-left text-xs font-medium py-3 px-2 uppercase tracking-wider">No.</th>
                <th className="text-left text-xs font-medium py-3 px-2 uppercase tracking-wider">Pertanyaan</th>
                <th className="text-left text-xs font-medium py-3 px-2 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question, index) => (
                <tr key={question.id}>
                  <td className="whitespace-nowrap text-sm text-gray-900 py-3 px-2">{index + 1}</td>
                  <td className="whitespace-nowrap text-sm text-gray-900 py-3 px-2">{question.question}</td>
                  <td className="whitespace-nowrap text-sm text-gray-900 py-3 px-2">
                    <Button
                      type="button"
                      variant="default"
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={isLoading}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>

        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Pertanyaan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={async () => {
                  if (!questionToDelete) return;
                  try {
                    setLoading(true);
                    const res = await fetch("/api/questions/delete", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ question_id: questionToDelete }),
                    });

                    if (!res.ok) throw new Error("Failed to delete question");

                    setQuestions(questions.filter((q) => q.id !== questionToDelete));
                    toast.success("Pertanyaan berhasil dihapus.");
                  } catch (error) {
                    console.error("Error deleting question:", error);
                    toast.error("Gagal menghapus pertanyaan.");
                  } finally {
                    setLoading(false);
                    setQuestionToDelete(null);
                    setShowDeleteAlert(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    </>
  );
}