import { useState } from "react";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!currentPassword || !newPassword) return setError("Please fill both fields");
    if (newPassword !== confirmPassword) return setError("New passwords do not match");
    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", { currentPassword, newPassword });
      setMessage(res.data?.message || "Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // optional: navigate back to dashboard after short delay
      setTimeout(() => navigate("/"), 900);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card max-w-xl">
      <h1 className="text-2xl font-semibold">{t("profile")}</h1>
      <p className="text-sm text-slate-500 mt-1">Change your account password</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700">Current password</label>
          <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">New password</label>
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {message && <div className="text-sm text-emerald-600">{message}</div>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary rounded-3xl px-4 py-3">{loading ? "Saving..." : "Change password"}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary rounded-3xl px-4 py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
