import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link");
    }
  }, [token, email]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, token, newPassword });
      setMessage(res.data?.message || "Password reset successful");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md surface-card">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="text-sm text-slate-500">Set a new password for your account.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" type="password" className="w-full rounded-2xl border px-4 py-3" />
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" type="password" className="w-full rounded-2xl border px-4 py-3" />
        {error && <div className="text-sm text-red-600">{error}</div>}
        {message && <div className="text-sm text-emerald-600">{message}</div>}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary rounded-3xl px-4 py-3">{loading ? "Saving..." : "Set password"}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary rounded-3xl px-4 py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
