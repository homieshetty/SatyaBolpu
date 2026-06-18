import { ChangeEvent, SubmitEvent, useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { GrFormView, GrFormViewHide } from "react-icons/gr";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LoginProps } from "../types/globals";

const initialLoginData = {
  email: "",
  password: ""
};

const Login = () => {
  const [formData, setFormData] = useState<LoginProps>(initialLoginData);
  const [errors, setErrors] = useState<LoginProps>(initialLoginData);
  const [apiError, setApiError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [buttonLoad, setButtonLoad] = useState<boolean>(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const { state, dispatch } = useAuth();
  const { data, error, loading, post } = useApi("/auth/login", { auto: false });
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: LoginProps = { ...initialLoginData };
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleFormDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.values(validationErrors).some(err => err !== "")) {
      setErrors(validationErrors);
      return;
    }

    await post(formData);
    setErrors(initialLoginData);
    setShowPassword(false);
  };

  useEffect(() => {
    setButtonLoad(loading);

    if (error) {
      console.error("Login error:", error);
      setApiError(error);
      return;
    }

    if (data && !loading) {
      setApiError("");
      dispatch({
        type: "LOGIN",
        payload: {
          user: data.user,
          token: data.accessToken,
        },
      });

      const userName = data.user?.name || "Explorer";
      const names: string[] = userName.split(" ");
      let finalName = names[0];

      if (names.length >= 2) {
        const structuralName = names.find(n => n.length > 5);
        if (structuralName) finalName = structuralName;
      }

      finalName = finalName.length > 10 ? `${finalName.slice(0, 10)}...` : finalName;
      toast.success(`Welcome back ${finalName}`);

      setFormData(initialLoginData);
      navigate("/profile");
    }
  }, [data, error, loading, dispatch, navigate]);

  if (state.token) return <Navigate to={"/profile"} replace />;

  return (
    <div className="relative w-full bg-black flex items-center justify-center px-4 py-16 overflow-hidden select-none">
      
      <form
        onSubmit={handleSubmit}
        className="relative w-full sm:w-[85%] md:w-2/3 lg:w-2/5 xl:w-[30%] max-w-lg border border-zinc-600/60 rounded-3xl 
        flex flex-col items-stretch gap-6 px-8 py-12 bg-[#111112]/60 backdrop-blur-xl shadow-2xl z-10"
      >
        <div className="flex flex-col items-center gap-2 mb-2 text-center">
          <span className="text-xl text-primary font-bold tracking-widest drop-shadow-[0_0_8px_rgba(232,126,54,0.5)]">
            ॐ
          </span>
          <h1 
            className="text-4xl font-black uppercase tracking-tight text-white"
            style={{ WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.05)' }}
          >
            Welcome Back
          </h1>
        </div>

        {apiError && (
          <div className="w-full bg-red-950/40 border border-red-800/50 rounded-xl p-3 text-center">
            <p className="text-xs tracking-wide text-red-400">{apiError}</p>
          </div>
        )}

        <div className="w-full flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs uppercase tracking-widest text-zinc-400">
            Email Address
          </label>
          <input
            className="w-full text-white bg-black/40 px-4 py-3.5 text-base border border-zinc-800 rounded-xl 
              focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
            type="email"
            id="email"
            name="email"
            placeholder="name@domain.com"
            value={formData.email}
            onChange={handleFormDataChange}
          />
          {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
        </div>

        <div className="w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs uppercase tracking-widest text-zinc-400">
              Password
            </label>
            <button
              type="button"
              className="text-zinc-500 hover:text-primary text-xl transition-colors focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <GrFormViewHide /> : <GrFormView />}
            </button>
          </div>
          <input
            className="w-full text-white bg-black/40 px-4 py-3.5 text-base border border-zinc-800 rounded-xl 
              focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="••••••••"
            ref={passwordRef}
            value={formData.password}
            onChange={handleFormDataChange}
          />
          {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 px-1 -mt-1">
          <Link to="/forgot-password" className="hover:text-white transition-colors">
            Forgot Password?
          </Link>
          <div className="flex items-center gap-1">
            <span>New here?</span>
            <Link to="/signup" className="text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <Button
            loading={buttonLoad}
            loadingText="Logging in..."
            className="w-full text-sm font-bold tracking-widest uppercase py-3.5 rounded-full bg-primary hover:bg-[#d46f2a] text-black transition-colors"
            type="submit"
            content="Log in"
          />
        </div>

      </form>
    </div>
  );
};

export default Login;
