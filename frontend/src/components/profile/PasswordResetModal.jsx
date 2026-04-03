import { useState } from "react";
import { X } from "lucide-react";
import { changePassword } from "../../services/authService";
import { useErrorHandler } from "../../hooks/useErrorHandler";

export default function PasswordResetModal({ isOpen, onClose }) {
  const { handleError } = useErrorHandler();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );
      setSuccess("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1500);
    } catch (err) {
      const userMessage = handleError(err, 'PasswordResetModal');
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={s.title}>Change Password</h2>
          <button style={s.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {error && <div style={s.errorMsg}>{error}</div>}
          {success && <div style={s.successMsg}>{success}</div>}

          <div style={s.field}>
            <label style={s.label}>Current Password *</label>
            <input
              style={s.input}
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
              disabled={loading}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>New Password *</label>
            <input
              style={s.input}
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 6 characters)"
              required
              disabled={loading}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm New Password *</label>
            <input
              style={s.input}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              disabled={loading}
            />
          </div>

          <div style={s.actions}>
            <button
              type="button"
              style={s.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.6 : 1 }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "28px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--ink)",
    margin: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--ink-3)",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
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
    background: "var(--surface-2)",
    color: "var(--ink)",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    justifyContent: "flex-end",
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
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  successMsg: {
    fontSize: "13px",
    color: "#10b981",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid #10b981",
    borderRadius: "var(--r-sm)",
    padding: "8px 12px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};
