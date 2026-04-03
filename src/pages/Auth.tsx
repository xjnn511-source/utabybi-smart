import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import logo from "@/assets/logo.png";
import { Mail, Lock, User, Eye, EyeOff, Phone, ArrowLeft } from "lucide-react";

type AuthMode = "login" | "signup" | "otp-send" | "otp-verify";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد التسجيل.");
      }
    }
    setLoading(false);
  };

  const handleOtpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formattedPhone = phone.startsWith("+") ? phone : `+966${phone.replace(/^0/, "")}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      setError(error.message);
    } else {
      setPhone(formattedPhone);
      setMode("otp-verify");
      setSuccess("تم إرسال رمز التحقق إلى جوالك 📲");
    }
    setLoading(false);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otpCode,
      type: "sms",
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setError(error.message || "حدث خطأ أثناء تسجيل الدخول بـ Google");
    }
    setGoogleLoading(false);
  };

  const isOtpMode = mode === "otp-send" || mode === "otp-verify";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 notranslate" translate="no">
      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-2xl bg-card border border-border p-1 mb-5 shadow-sm">
            <img src={logo} alt="عتيبي ذكي" className="w-full h-full rounded-xl object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-primary">عُتيبي ذكي Ai 🤖</h1>
          <p className="text-xs text-muted-foreground mt-2">منصة SaaS للحلول البرمجية والذكاء الاصطناعي</p>
          <p className="text-[9px] text-muted-foreground mt-1">🇸🇦 🇦🇪 🇶🇦 🇧🇭 🇰🇼 🇴🇲 دول الخليج العربي</p>
        </div>

        {/* Form Card */}
        <div className="card-neon p-7">
          {/* Toggle: Email vs OTP */}
          {!isOtpMode ? (
            <>
              <div className="flex rounded-lg bg-secondary p-1 mb-4">
                <button
                  onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-md transition-all ${
                    mode === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  دخول
                </button>
                <button
                  onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-md transition-all ${
                    mode === "signup" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  تسجيل جديد
                </button>
              </div>

              {/* OTP shortcut */}
              <button
                onClick={() => { setMode("otp-send"); setError(""); setSuccess(""); }}
                className="w-full flex items-center justify-center gap-2 py-2 mb-5 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                دخول برقم الجوال (OTP)
              </button>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="الاسم الكامل"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg py-3.5 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg py-3.5 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg py-3.5 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-destructive text-xs text-center bg-destructive/10 rounded-lg py-2.5">{error}</p>
                )}
                {success && (
                  <p className="text-green-700 text-xs text-center bg-green-50 rounded-lg py-2.5">{success}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3.5 px-6 text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {loading ? "جاري المعالجة..." : mode === "login" ? "دخول" : "إنشاء حساب"}
                </button>
              </form>

              {/* Separator */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">أو</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {googleLoading ? "جاري التحميل..." : "المتابعة مع Google"}
              </button>
            </>
          ) : (
            <>
              {/* OTP Mode */}
              <button
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-5 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                العودة للدخول بالبريد
              </button>

              {mode === "otp-send" && (
                <form onSubmit={handleOtpSend} className="space-y-5">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-2 block">
                      أدخل رقم جوالك (دول الخليج)
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="05XXXXXXXX أو +966XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-input border border-border rounded-lg py-3.5 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                        dir="ltr"
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1.5">🇸🇦 🇦🇪 🇶🇦 🇧🇭 🇰🇼 🇴🇲 مدعوم لجميع دول الخليج</p>
                  </div>

                  {error && (
                    <p className="text-destructive text-xs text-center bg-destructive/10 rounded-lg py-2.5">{error}</p>
                  )}
                  {success && (
                    <p className="text-green-700 text-xs text-center bg-green-50 rounded-lg py-2.5">{success}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3.5 px-6 text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {loading ? "جاري الإرسال..." : "إرسال رمز التحقق 📲"}
                  </button>
                </form>
              )}

              {mode === "otp-verify" && (
                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-2 block">
                      أدخل رمز التحقق المرسل إلى {phone}
                    </label>
                    <input
                      type="text"
                      placeholder="XXXXXX"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg py-3.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center tracking-[0.5em]"
                      required
                      maxLength={6}
                      dir="ltr"
                    />
                  </div>

                  {error && (
                    <p className="text-destructive text-xs text-center bg-destructive/10 rounded-lg py-2.5">{error}</p>
                  )}
                  {success && (
                    <p className="text-green-700 text-xs text-center bg-green-50 rounded-lg py-2.5">{success}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3.5 px-6 text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {loading ? "جاري التحقق..." : "تأكيد الرمز ✓"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("otp-send")}
                    className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    إعادة إرسال الرمز
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-6 px-2">
          <p className="text-[8px] text-muted-foreground/60 text-center leading-relaxed">
            ⚖️ إخلاء مسؤولية: هذا التطبيق أداة تقنية مساعدة فقط. المسؤولية النهائية عن دقة البيانات تقع على عاتق المستخدم وحده.
            لا يُعد هذا التطبيق بديلاً عن الاستشارة المتخصصة.
          </p>
        </div>

        <p className="text-center text-[9px] text-muted-foreground mt-4">
          عُتيبي ذكي Ai 🤖 — منصة SaaS للحلول البرمجية والذكاء الاصطناعي
        </p>
      </div>
    </div>
  );
};

export default Auth;
