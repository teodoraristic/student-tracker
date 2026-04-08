import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, X, Check, Lock, AlertTriangle } from "lucide-react";
import PasswordResetModal from "../components/profile/PasswordResetModal";
import { useAuth } from "../auth/useAuth";
import { deleteAccount } from "../services/authService";
import {
  getAllSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../services/semesterService";
import {
  getAllExamPeriods,
  createExamPeriod,
  updateExamPeriod,
  deleteExamPeriod,
} from "../services/examPeriodService";

const EMPTY_SEMESTER_FORM = {
  name: "",
  type: "WINTER",
  academicYear: "",
  startDate: "",
  endDate: "",
};

const EMPTY_EXAM_PERIOD_FORM = {
  name: "",
  startDate: "",
  endDate: "",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [examPeriods, setExamPeriods] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showSemesterForm, setShowSemesterForm] = useState(false);
  const [semesterForm, setSemesterForm] = useState(EMPTY_SEMESTER_FORM);
  const [editingSemesterId, setEditingSemesterId] = useState(null);

  const [showExamPeriodForm, setShowExamPeriodForm] = useState(false);
  const [examPeriodForm, setExamPeriodForm] = useState(EMPTY_EXAM_PERIOD_FORM);
  const [editingExamPeriodId, setEditingExamPeriodId] = useState(null);

  const [semesterError, setSemesterError] = useState(null);
  const [examPeriodError, setExamPeriodError] = useState(null);

  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  useEffect(() => {
    getAllSemesters().then(setSemesters).catch(() => {});
    getAllExamPeriods().then(setExamPeriods).catch(() => {});
  }, []);

  // ── Semester handlers ──────────────────────────────────────────────────────

  const handleSemesterChange = (e) => {
    const { name, value } = e.target;
    setSemesterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSemesterSubmit = async (e) => {
    e.preventDefault();
    setSemesterError(null);
    try {
      const payload = {
        name: semesterForm.name,
        type: semesterForm.type,
        academicYear: semesterForm.academicYear,
        startDate: semesterForm.startDate || null,
        endDate: semesterForm.endDate || null,
      };
      if (editingSemesterId != null) {
        const updated = await updateSemester(editingSemesterId, payload);
        setSemesters((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await createSemester(payload);
        setSemesters((prev) => [...prev, created]);
      }
      setShowSemesterForm(false);
      setEditingSemesterId(null);
      setSemesterForm(EMPTY_SEMESTER_FORM);
    } catch {
      setSemesterError("Failed to save semester. Please try again.");
    }
  };

  const handleEditSemester = (s) => {
    setEditingSemesterId(s.id);
    setSemesterForm({
      name: s.name,
      type: s.type,
      academicYear: s.academicYear,
      startDate: s.startDate || "",
      endDate: s.endDate || "",
    });
    setShowSemesterForm(true);
    setSemesterError(null);
  };

  const handleDeleteSemester = async (id) => {
    if (!window.confirm("Delete this semester?")) return;
    try {
      await deleteSemester(id);
      setSemesters((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete semester.");
    }
  };

  const handleCancelSemester = () => {
    setShowSemesterForm(false);
    setEditingSemesterId(null);
    setSemesterForm(EMPTY_SEMESTER_FORM);
    setSemesterError(null);
  };

  // ── Exam Period handlers ───────────────────────────────────────────────────

  const handleExamPeriodChange = (e) => {
    const { name, value } = e.target;
    setExamPeriodForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExamPeriodSubmit = async (e) => {
    e.preventDefault();
    setExamPeriodError(null);
    try {
      const payload = {
        name: examPeriodForm.name,
        startDate: examPeriodForm.startDate,
        endDate: examPeriodForm.endDate,
      };
      if (editingExamPeriodId != null) {
        const updated = await updateExamPeriod(editingExamPeriodId, payload);
        setExamPeriods((prev) => prev.map((ep) => (ep.id === updated.id ? updated : ep)));
      } else {
        const created = await createExamPeriod(payload);
        setExamPeriods((prev) => [...prev, created]);
      }
      setShowExamPeriodForm(false);
      setEditingExamPeriodId(null);
      setExamPeriodForm(EMPTY_EXAM_PERIOD_FORM);
    } catch {
      setExamPeriodError("Failed to save exam period. Please try again.");
    }
  };

  const handleEditExamPeriod = (ep) => {
    setEditingExamPeriodId(ep.id);
    setExamPeriodForm({
      name: ep.name,
      startDate: ep.startDate || "",
      endDate: ep.endDate || "",
    });
    setShowExamPeriodForm(true);
    setExamPeriodError(null);
  };

  const handleDeleteExamPeriod = async (id) => {
    if (!window.confirm("Delete this exam period?")) return;
    try {
      await deleteExamPeriod(id);
      setExamPeriods((prev) => prev.filter((ep) => ep.id !== id));
    } catch {
      alert("Failed to delete exam period.");
    }
  };

  const handleCancelExamPeriod = () => {
    setShowExamPeriodForm(false);
    setEditingExamPeriodId(null);
    setExamPeriodForm(EMPTY_EXAM_PERIOD_FORM);
    setExamPeriodError(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAccount();
      logout();
      navigate("/");
    } catch {
      setDeleteError("Failed to delete account. Please try again.");
      setDeleteLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Profile Settings</h1>
        <p style={s.subtitle}>Manage your account and academic information</p>
      </div>

      {/* ── Security section ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>Security</h2>
            <p style={s.sectionSubtitle}>Change your password</p>
          </div>
          <button
            style={s.addBtn}
            onClick={() => setShowPasswordResetModal(true)}
          >
            <Lock size={16} />
            Change Password
          </button>
        </div>
        <div style={s.securityInfo}>
          <p style={s.securityText}>
            Keep your account secure by regularly updating your password. You can reset your password up to 3 times per hour.
          </p>
        </div>
      </div>

      {/* ── Semesters section ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>Semesters</h2>
            <p style={s.sectionSubtitle}>Organise your subjects by semester</p>
          </div>
          {!showSemesterForm && (
            <button
              style={s.addBtn}
              onClick={() => {
                setShowSemesterForm(true);
                setEditingSemesterId(null);
                setSemesterForm(EMPTY_SEMESTER_FORM);
                setSemesterError(null);
              }}
            >
              <Plus size={16} />
              Add Semester
            </button>
          )}
        </div>

        {showSemesterForm && (
          <div style={s.formCard}>
            <div style={s.formCardHeader}>
              <span style={s.formCardTitle}>
                {editingSemesterId != null ? "Edit Semester" : "New Semester"}
              </span>
              <button style={s.iconBtn} onClick={handleCancelSemester}>
                <X size={16} />
              </button>
            </div>
            {semesterError && <div style={s.errorMsg}>{semesterError}</div>}
            <form onSubmit={handleSemesterSubmit} style={s.form}>
              <div style={s.formRow}>
                <div style={s.field}>
                  <label style={s.label}>Name *</label>
                  <input
                    style={s.input}
                    type="text"
                    name="name"
                    value={semesterForm.name}
                    onChange={handleSemesterChange}
                    placeholder="e.g. Winter 2024/25"
                    required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Type *</label>
                  <select
                    style={s.select}
                    name="type"
                    value={semesterForm.type}
                    onChange={handleSemesterChange}
                    required
                  >
                    <option value="WINTER">WINTER</option>
                    <option value="SUMMER">SUMMER</option>
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Academic Year *</label>
                  <input
                    style={s.input}
                    type="text"
                    name="academicYear"
                    value={semesterForm.academicYear}
                    onChange={handleSemesterChange}
                    placeholder="2024/25"
                    required
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.field}>
                  <label style={s.label}>Start Date (optional)</label>
                  <input
                    style={s.input}
                    type="date"
                    name="startDate"
                    value={semesterForm.startDate}
                    onChange={handleSemesterChange}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>End Date (optional)</label>
                  <input
                    style={s.input}
                    type="date"
                    name="endDate"
                    value={semesterForm.endDate}
                    onChange={handleSemesterChange}
                  />
                </div>
              </div>
              <div style={s.formActions}>
                <button type="button" style={s.cancelBtn} onClick={handleCancelSemester}>
                  Cancel
                </button>
                <button type="submit" style={s.submitBtn}>
                  <Check size={15} />
                  {editingSemesterId != null ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        )}

        {semesters.length === 0 && !showSemesterForm && (
          <div style={s.emptyState}>No semesters added yet.</div>
        )}

        <div style={s.list}>
          {semesters.map((sem) => (
            <div key={sem.id} style={s.listItem}>
              <div style={s.listItemLeft}>
                <div style={s.listItemName}>{sem.name}</div>
                <div style={s.listItemMeta}>
                  <span
                    style={{
                      ...s.typeBadge,
                      background: sem.type === "WINTER" ? "var(--color-future-bg)" : "var(--color-due-soon-bg)",
                      color: sem.type === "WINTER" ? "var(--color-future)" : "var(--color-due-soon)",
                      border: `1px solid ${sem.type === "WINTER" ? "var(--color-future)" : "var(--color-due-soon)"}`,
                    }}
                  >
                    {sem.type}
                  </span>
                  <span style={s.listItemYear}>{sem.academicYear}</span>
                  {(sem.startDate || sem.endDate) && (
                    <span style={s.listItemDates}>
                      {formatDate(sem.startDate)} – {formatDate(sem.endDate)}
                    </span>
                  )}
                </div>
              </div>
              <div style={s.listItemActions}>
                <button style={s.iconBtn} onClick={() => handleEditSemester(sem)} title="Edit">
                  <Pencil size={15} />
                </button>
                <button
                  style={{ ...s.iconBtn, color: "var(--color-overdue)" }}
                  onClick={() => handleDeleteSemester(sem.id)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Exam Periods section ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>Exam Periods</h2>
            <p style={s.sectionSubtitle}>Track when your exams take place</p>
          </div>
          {!showExamPeriodForm && (
            <button
              style={s.addBtn}
              onClick={() => {
                setShowExamPeriodForm(true);
                setEditingExamPeriodId(null);
                setExamPeriodForm(EMPTY_EXAM_PERIOD_FORM);
                setExamPeriodError(null);
              }}
            >
              <Plus size={16} />
              Add Exam Period
            </button>
          )}
        </div>

        {showExamPeriodForm && (
          <div style={s.formCard}>
            <div style={s.formCardHeader}>
              <span style={s.formCardTitle}>
                {editingExamPeriodId != null ? "Edit Exam Period" : "New Exam Period"}
              </span>
              <button style={s.iconBtn} onClick={handleCancelExamPeriod}>
                <X size={16} />
              </button>
            </div>
            {examPeriodError && <div style={s.errorMsg}>{examPeriodError}</div>}
            <form onSubmit={handleExamPeriodSubmit} style={s.form}>
              <div style={s.formRow}>
                <div style={s.field}>
                  <label style={s.label}>Name *</label>
                  <input
                    style={s.input}
                    type="text"
                    name="name"
                    value={examPeriodForm.name}
                    onChange={handleExamPeriodChange}
                    placeholder="e.g. January 2025"
                    required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Start Date *</label>
                  <input
                    style={s.input}
                    type="date"
                    name="startDate"
                    value={examPeriodForm.startDate}
                    onChange={handleExamPeriodChange}
                    required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>End Date *</label>
                  <input
                    style={s.input}
                    type="date"
                    name="endDate"
                    value={examPeriodForm.endDate}
                    onChange={handleExamPeriodChange}
                    required
                  />
                </div>
              </div>
              <div style={s.formActions}>
                <button type="button" style={s.cancelBtn} onClick={handleCancelExamPeriod}>
                  Cancel
                </button>
                <button type="submit" style={s.submitBtn}>
                  <Check size={15} />
                  {editingExamPeriodId != null ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        )}

        {examPeriods.length === 0 && !showExamPeriodForm && (
          <div style={s.emptyState}>No exam periods added yet.</div>
        )}

        <div style={s.list}>
          {examPeriods.map((ep) => (
            <div key={ep.id} style={s.listItem}>
              <div style={s.listItemLeft}>
                <div style={s.listItemName}>{ep.name}</div>
                <div style={s.listItemMeta}>
                  <span style={s.listItemDates}>
                    {formatDate(ep.startDate)} – {formatDate(ep.endDate)}
                  </span>
                </div>
              </div>
              <div style={s.listItemActions}>
                <button style={s.iconBtn} onClick={() => handleEditExamPeriod(ep)} title="Edit">
                  <Pencil size={15} />
                </button>
                <button
                  style={{ ...s.iconBtn, color: "var(--color-overdue)" }}
                  onClick={() => handleDeleteExamPeriod(ep.id)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div style={{ ...s.section, borderColor: "rgba(239,68,68,0.3)" }}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={{ ...s.sectionTitle, color: "#ef4444" }}>Danger Zone</h2>
            <p style={s.sectionSubtitle}>Irreversible actions for your account</p>
          </div>
        </div>
        <div style={s.securityInfo}>
          <p style={s.securityText}>
            Deleting your account will permanently remove all your data — subjects, tasks,
            semesters, study sessions, and account information. This cannot be undone.
          </p>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            style={s.deleteBtn}
            onClick={() => setShowDeleteConfirm(true)}
          >
            <AlertTriangle size={15} />
            Delete My Account
          </button>
        </div>
      </div>

      {/* ── Delete Account Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Delete your account?</h3>
            <p style={s.modalBody}>
              This will permanently delete all your data and cannot be undone.
              Are you absolutely sure?
            </p>
            {deleteError && <div style={s.errorMsg}>{deleteError}</div>}
            <div style={s.modalActions}>
              <button
                style={s.cancelBtn}
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                style={{ ...s.deleteBtn, opacity: deleteLoading ? 0.6 : 1 }}
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting…" : "Yes, Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Password Reset Modal ── */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
      />
    </div>
  );
}

const s = {
  container: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "400",
    color: "var(--ink)",
    margin: "0 0 8px 0",
    fontFamily: "'Instrument Serif', serif",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--ink-3)",
    margin: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  section: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "28px",
    marginBottom: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--ink)",
    margin: "0 0 4px 0",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  sectionSubtitle: {
    fontSize: "13px",
    color: "var(--ink-3)",
    margin: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 16px",
    background: "var(--rose-400)",
    color: "white",
    border: "none",
    borderRadius: "var(--r-md)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  formCard: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "20px",
    marginBottom: "16px",
  },
  formCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  formCardTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1 1 160px",
    minWidth: "140px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  input: {
    padding: "10px 12px",
    fontSize: "13px",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none",
    background: "var(--surface)",
    color: "var(--ink)",
  },
  select: {
    padding: "10px 12px",
    fontSize: "13px",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none",
    background: "var(--surface)",
    color: "var(--ink)",
    cursor: "pointer",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "4px",
  },
  cancelBtn: {
    padding: "8px 18px",
    background: "var(--surface-3)",
    color: "var(--ink)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 18px",
    background: "var(--rose-400)",
    color: "white",
    border: "none",
    borderRadius: "var(--r-md)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  errorMsg: {
    fontSize: "13px",
    color: "var(--color-overdue)",
    background: "var(--color-overdue-bg)",
    border: "1px solid var(--color-overdue)",
    borderRadius: "var(--r-sm)",
    padding: "8px 12px",
    marginBottom: "12px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  emptyState: {
    fontSize: "14px",
    color: "var(--ink-3)",
    padding: "16px 0",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
  },
  listItemLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  listItemName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  listItemMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  typeBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "99px",
    letterSpacing: "0.5px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  listItemYear: {
    fontSize: "13px",
    color: "var(--ink-3)",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  listItemDates: {
    fontSize: "13px",
    color: "var(--ink-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  listItemActions: {
    display: "flex",
    gap: "6px",
    flexShrink: 0,
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    cursor: "pointer",
    color: "var(--ink-3)",
    padding: 0,
  },
  securityInfo: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "16px",
  },
  securityText: {
    fontSize: "13px",
    color: "var(--ink-3)",
    margin: 0,
    lineHeight: "1.5",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 16px",
    background: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "var(--r-md)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "24px",
  },
  modal: {
    background: "var(--surface)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "var(--r-lg)",
    padding: "28px",
    maxWidth: 420,
    width: "100%",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ef4444",
    margin: "0 0 12px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  modalBody: {
    fontSize: "14px",
    color: "var(--ink-3)",
    margin: "0 0 20px",
    lineHeight: "1.6",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
};
