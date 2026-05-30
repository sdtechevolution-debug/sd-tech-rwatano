import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Logo from "../../components/layout/Logo";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/95 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/40">
        <div className="text-center mb-8">
          <Logo className="mx-auto justify-center" />
          <p className="mt-4 text-sm text-slate-400">{t("accessDashboard")}</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">{t("email")}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">{t("password")}</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>
          {error && <div role="alert" className="rounded-3xl border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-amber-600 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-400">
          <div>{t("useCredentials")}</div>
          <div className="mt-3">
            <a href="/forgot-password" className="text-amber-400 hover:underline">Forgot password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
