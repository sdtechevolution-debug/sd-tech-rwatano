import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/request-reset", { email });
      setMessage(res.data?.message || "If the email exists we'll send a reset link");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md surface-card">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <p className="text-sm text-slate-500">Enter your account email to receive a reset link.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-2xl border px-4 py-3" />
        {error && <div className="text-sm text-red-600">{error}</div>}
        {message && <div className="text-sm text-emerald-600">{message}</div>}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary rounded-3xl px-4 py-3">{loading ? "Sending..." : "Send reset link"}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary rounded-3xl px-4 py-3">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
