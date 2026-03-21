import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubjectById, deleteSubject, updateSubject, finalizeSubject, resetSubjectStatus } from "../services/subjectService";
import { getTasksBySubjectId, createTask } from "../services/taskService";
import { getAllSemesters } from "../services/semesterService";
import SubjectHero from "../components/subjects/SubjectHero";
import SubjectTasksSection from "../components/subjects/SubjectTasksSection";
import FinalizeModal from "../components/subjects/FinalizeModal";
import SubjectForm from "../components/subjects/SubjectForm";
import TaskForm from "../components/tasks/TaskForm";
import ExamForm from "../components/tasks/ExamForm";
import Modal from "../components/common/Modal";
import Button from "../components/ui/Button";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function SubjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectData, tasksData, semestersData] = await Promise.all([
          getSubjectById(Number(id)),
          getTasksBySubjectId(Number(id)),
          getAllSemesters(),
        ]);
        setSubject(subjectData);
        setTasks(tasksData);
        setSemesters(semestersData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load subject details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <span style={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div style={styles.centered}>
        <span style={styles.errorText}>{error || "Subject not found"}</span>
        <Button onClick={() => navigate("/subjects")}>Back to Subjects</Button>
      </div>
    );
  }

  const handleAddTask = async (formData) => {
    try {
      const newTask = await createTask({ ...formData, subjectId: Number(id) });
      setTasks([...tasks, newTask]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to create assignment. Please try again.");
    }
  };

  const handleAddExam = async (formData) => {
    try {
      const newTask = await createTask({ ...formData, subjectId: Number(id) });
      setTasks([...tasks, newTask]);
      setIsExamModalOpen(false);
    } catch (err) {
      console.error("Failed to create exam:", err);
      alert("Failed to create exam. Please try again.");
    }
  };

  const handleUpdateTask = (updatedTask) =>
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

  const handleDeleteTask = (taskId) =>
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

  const handleDeleteSubject = async () => {
    if (!window.confirm(`Delete "${subject.name}" and all its assignments?`)) return;
    try {
      await deleteSubject(Number(id));
      navigate("/subjects");
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert("Failed to delete subject. Please try again.");
    }
  };

  const handleEditSubject = async (formData) => {
    try {
      const updated = await updateSubject(Number(id), formData);
      setSubject(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update subject:", err);
      alert("Failed to update subject. Please try again.");
    }
  };

  const handleFinalizeSave = async (subjectId, payload) => {
    const updated = await finalizeSubject(subjectId, payload);
    setSubject(updated);
  };

  const handleReset = async () => {
    try {
      const updated = await resetSubjectStatus(Number(id));
      setSubject(updated);
    } catch {
      alert("Failed to reset subject. Please try again.");
    }
  };

  // Computed stats — derived here, passed as plain values to children
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isTaskOverdue = (t) => t.status === "TODO" && t.dueDate && new Date(t.dueDate) < todayStart;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueTasks = tasks.filter(isTaskOverdue).length;
  const todoTasks = tasks.filter((t) => t.status === "TODO" && !isTaskOverdue(t)).length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0);
  const earnedPoints = tasks
    .filter((t) => t.status === "DONE")
    .reduce((sum, t) => sum + (t.earnedPoints != null ? t.earnedPoints : t.points || 0), 0);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/subjects")} style={styles.backBtn}>
        <ArrowLeft size={15} />
        Back to Subjects
      </button>

      <SubjectHero
        subject={subject}
        onEditSubject={() => setIsEditModalOpen(true)}
        onFinalize={() => setIsFinalizeModalOpen(true)}
        onReset={handleReset}
        completionPct={completionPct}
        todoTasks={todoTasks}
        overdueTasks={overdueTasks}
        completedTasks={completedTasks}
        earnedPoints={earnedPoints}
        totalPoints={totalPoints}
      />

      <SubjectTasksSection
        tasks={tasks}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onTaskUpdate={handleUpdateTask}
        onTaskDelete={handleDeleteTask}
        onAddTask={() => setIsModalOpen(true)}
        onAddExam={() => setIsExamModalOpen(true)}
      />

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Subject">
        <SubjectForm
          initialData={subject}
          onSubmit={handleEditSubject}
          onCancel={() => setIsEditModalOpen(false)}
          semesters={semesters}
        />
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Assignment">
        <TaskForm onSubmit={handleAddTask} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Add Exam">
        <ExamForm onSubmit={handleAddExam} onCancel={() => setIsExamModalOpen(false)} />
      </Modal>

      <div style={styles.dangerZone}>
        <button onClick={handleDeleteSubject} style={styles.deleteBtn}>
          <Trash2 size={15} />
          Delete subject
        </button>
      </div>

      <Modal
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        title={`Finalize · ${subject.name}`}
      >
        <FinalizeModal
          subject={{ ...subject, totalPoints: earnedPoints }}
          onClose={() => setIsFinalizeModalOpen(false)}
          onSave={handleFinalizeSave}
        />
      </Modal>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 14px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    color: "var(--ink-3)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    marginBottom: "20px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dangerZone: {
    marginTop: "48px",
    paddingTop: "16px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    justifyContent: "flex-end",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "transparent",
    border: "1px solid var(--color-overdue)30",
    borderRadius: "var(--r-sm)",
    color: "var(--color-overdue)",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    opacity: 0.7,
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    gap: "16px",
  },
  loadingText: { fontSize: "15px", color: "var(--ink-3)" },
  errorText: { fontSize: "15px", color: "var(--color-overdue)" },
};
