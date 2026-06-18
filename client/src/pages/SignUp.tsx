import { ChangeEvent, SubmitEvent, useEffect, useState } from "react";
import Button from "../components/Button";
import PhoneInput, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { GrFormView, GrFormViewHide } from "react-icons/gr";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import parsePhoneNumberFromString from "libphonenumber-js/mobile";
import { toast } from "react-toastify";
import { SignUpProps } from "../types/globals";

const initialFormData: SignUpProps = {
  name: "",
  uname: "",
  email: "",
  phone: {
    dialCode: "",
    number: ""
  },
  password: "",
  confirmPassword: "",
};

const steps = ["Basic Info", "Contact Info", "Security"];

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpProps>(initialFormData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<SignUpProps>(initialFormData);
  const [buttonLoad, setButtonLoad] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  const { data, error, loading, post } = useApi("/auth/signup", { auto: false });
  const { state, dispatch } = useAuth();

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

  const handlePhoneNoChange = (phone: string, data: CountryData) => {
    setErrors((prev) => ({
      ...prev,
      phone: ""
    }));

    setFormData((prev) => ({
      ...prev,
      phone: {
        dialCode: data.dialCode,
        number: phone.slice(data.dialCode.length)
      }
    }));
  }

  const validateForm = (step: number) => {
    const newErrors: SignUpProps = { ...initialFormData, phone: "" };

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required.";
    } else if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format.";
      }
      if(formData.phone && typeof formData.phone === "object") {
        const phone =  parsePhoneNumberFromString("+" + formData.phone.dialCode + formData.phone.number);
        if(formData.phone.number !== "" && phone?.getType() !== "MOBILE") {
          newErrors.phone = "Invalid phone number.";
        }
      }

    } else if (step === 3) {
      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do NOT match.";
      }
    }

    return newErrors;
  };

  const handleNext = (step: number) => {
    const newErrors = validateForm(step);
    if (Object.values(newErrors).some(err => err !== "")) {
      setErrors(newErrors);
      return;
    }
    setStep(step);
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    setButtonLoad(true);
    e.preventDefault();
    const newErrors = validateForm(3);
    if (Object.values(newErrors).some(err => err != "")) {
      setErrors(newErrors);
      setButtonLoad(false);
      return;
    }
    await post(formData);
    setButtonLoad(false);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }

    if (data) {
      setButtonLoad(loading);
      dispatch({
        type: "LOGIN",
        payload: {
          user: data.user,
          token: data.accessToken,
        },
      });
      const names: string[] = data.user.name.split(" ");
      let finalName;
      if(names.length < 2) {
        finalName = names[0];
      } else {
        finalName = names.find(n => n.length > 5 );
      }
      finalName = finalName!.length > 10 ? `${finalName!.slice(0, 10)}...` : finalName;
      toast.success(`Sign In Successful! Welcome ${finalName}`);
      setFormData(initialFormData);
      setButtonLoad(false);
    }
  }, [data, error, loading]);

  if (state.token) return <Navigate to={"/profile"} replace />;

  return (
  <div className="relative w-full min-h-screen bg-black flex items-center justify-center px-4 py-16 overflow-hidden select-none">

    <div className="absolute w-150 h-150 rounded-full bg-primary/10 blur-3xl" />

    <form
      onSubmit={handleSubmit}
      className="relative w-full sm:w-[85%] md:w-2/3 lg:w-2/5 max-w-xl border border-zinc-600/60
        rounded-3xl flex flex-col gap-6 px-8 py-12 bg-[#111112]/60 backdrop-blur-xl
        shadow-2xl z-10
      "
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xl text-primary font-bold tracking-widest drop-shadow-[0_0_8px_rgba(232,126,54,0.5)]">
          ॐ
        </span>

        <h1
          className="text-4xl font-black uppercase tracking-tight text-white"
          style={{
            WebkitTextStroke: "0.5px rgba(255,255,255,0.05)",
          }}
        >
          Sign Up
        </h1>

        <p className="text-zinc-400 text-sm">
          Begin your journey through Tulunadu
        </p>
      </div>

      <div className="flex justify-center items-center gap-3">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center
                text-sm font-bold transition-all duration-300

                ${
                  step === i
                    ? "bg-primary text-black shadow-[0_0_20px_rgba(232,126,54,0.4)]"
                    : "border border-zinc-700 text-zinc-500"
                }
              `}
            >
              {i + 1}
            </div>

            <span
              className={`
                hidden lg:block text-xs uppercase tracking-widest
                ${
                  step === i
                    ? "text-white"
                    : "text-zinc-500"
                }
              `}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Full Name
            </label>

            <input
              className="
                w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
                rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
                focus:ring-primary/40 transition-all duration-300
              "
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormDataChange}
            />

            {errors.name && (
              <p className="text-red-500 text-xs">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Username (Optional)
            </label>

            <input
              className="
                w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
                rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
                focus:ring-primary/40 transition-all duration-300
              "
              type="text"
              name="uname"
              value={formData.uname}
              onChange={handleFormDataChange}
            />
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Email Address
            </label>

            <input
              className="
                w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
                rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
                focus:ring-primary/40 transition-all duration-300
              "
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormDataChange}
            />

            {errors.email && (
              <p className="text-red-500 text-xs">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Phone Number (Optional)
            </label>

            <PhoneInput
              country={"in"}
              value={
                typeof formData.phone === "object"
                  ? formData.phone.dialCode + formData.phone.number
                  : formData.phone
              }
              onChange={handlePhoneNoChange}
              containerStyle={{
                width: "100%",
              }}
              inputStyle={{
                width: "100%",
                height: "52px",
                background: "rgba(0,0,0,.4)",
                color: "white",
                border: "1px solid rgb(39 39 42)",
                borderRadius: "12px",
                fontSize: "16px",
              }}
              buttonStyle={{
                background: "rgba(0,0,0,.4)",
                border: "1px solid rgb(39 39 42)",
              }}
            />

            {errors.phone &&
              typeof errors.phone === "string" && (
                <p className="text-red-500 text-xs">
                  {errors.phone}
                </p>
              )}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-widest text-zinc-400">
                Password
              </label>

              <button
                type="button"
                className="text-zinc-500 hover:text-primary text-xl transition-colors"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <GrFormViewHide />
                ) : (
                  <GrFormView />
                )}
              </button>
            </div>

            <input
              className="
                w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
                rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
                focus:ring-primary/40 transition-all duration-300
              "
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleFormDataChange}
            />

            {errors.password && (
              <p className="text-red-500 text-xs">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Confirm Password
            </label>

            <input
              className="
                w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
                rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
                focus:ring-primary/40 transition-all duration-300
              "
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleFormDataChange}
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-between items-center mt-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => prev - 1)}
            className="
              flex items-center gap-2 px-5 py-3 rounded-full border
              border-zinc-700 text-zinc-300 hover:border-primary
              hover:text-primary transition-all
            "
          >
            <FaArrowLeft />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => handleNext(step + 1)}
            className="
              flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-700
              text-zinc-300 hover:border-primary hover:text-primary transition-all
            "
          >
            Next
            <FaArrowRight />
          </button>
        ) : (
          <Button
            loading={buttonLoad}
            loadingText="Creating Account..."
            className="
              text-sm font-bold tracking-widest uppercase py-3.5
              px-8 rounded-full bg-primary hover:bg-[#d46f2a] text-black
            "
            type="submit"
            content="Create Account"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
        <span>Already have an account?</span>

        <a
          href="/login"
          className="text-primary hover:underline"
        >
          Sign In
        </a>
      </div>
    </form>
  </div>
);
};

export default SignUp;

