"use client";
// Adapted from beui.dev/components/blocks/signup-form

import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type SignUpStatus = "idle" | "loading" | "success" | "error";

export type SignUpValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>;

export type SignUpFormClassNames = {
  root?: string;
  header?: string;
  title?: string;
  description?: string;
  fields?: string;
  strength?: string;
  terms?: string;
  submit?: string;
  footer?: string;
};

export type SignUpFormProps = {
  values?: SignUpValues;
  defaultValues?: Partial<SignUpValues>;
  onValuesChange?: (values: SignUpValues) => void;
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  validate?: (values: SignUpValues) => SignUpErrors;
  status?: SignUpStatus;
  errorMessage?: string;
  title?: ReactNode;
  description?: ReactNode;
  submitLabel?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  footer?: ReactNode;
  strengthMeter?: boolean;
  className?: string;
  classNames?: SignUpFormClassNames;
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_LAYOUT = {
  type: "spring" as const,
  stiffness: 360,
  damping: 32,
  mass: 0.6,
};
const SPRING_SWAP = {
  type: "spring" as const,
  stiffness: 460,
  damping: 30,
  mass: 0.55,
};

const EMPTY_VALUES: SignUpValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const STRENGTH_LABELS = [
  "خیلی کوتاه",
  "ضعیف",
  "متوسط",
  "خوب",
  "قوی",
] as const;

const STRENGTH_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-amber-500",
  "bg-amber-400",
  "bg-emerald-500",
] as const;

/** Length-weighted strength score, 0–4 (NIST-style length bias). */
export function passwordStrength(password: string): number {
  if (password.length < MIN_PASSWORD_LENGTH) return 0;

  let score = 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password),
  ).length;
  if (classes >= 3) score += 1;

  return Math.min(score, 4);
}

function defaultValidate(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {};

  if (!values.name.trim()) {
    errors.name = "نام را وارد کنید.";
  }

  if (!values.email.trim()) {
    errors.email = "ایمیل را وارد کنید.";
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "این آدرس ایمیل درست به نظر نمی‌رسد.";
  }

  if (!values.password) {
    errors.password = "یک رمز عبور انتخاب کنید.";
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `حداقل ${MIN_PASSWORD_LENGTH} نویسه لازم است.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "رمز عبور را تأیید کنید.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "رمزها یکسان نیستند.";
  }

  if (!values.terms) {
    errors.terms = "برای ادامه باید شرایط را بپذیرید.";
  }

  return errors;
}

type FieldInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange"
> & {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string | boolean;
  reserveErrorLine?: boolean;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

function FieldInput({
  label,
  value = "",
  onChange,
  onFocus,
  onBlur,
  error,
  reserveErrorLine = false,
  success,
  leftIcon,
  rightIcon,
  className,
  disabled,
  id: idProp,
  type,
  ...rest
}: FieldInputProps) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const reduce = useReducedMotion() ?? false;
  const fieldRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : null;
  const rightSlot = success ? null : rightIcon;

  useEffect(() => {
    if (!fieldRef.current || reduce || !hasError) return;
    animate(
      fieldRef.current,
      { x: [0, -6, 6, -4, 4, -2, 0] },
      { duration: 0.45 },
    );
  }, [hasError, reduce]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="px-1 text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}

      <div
        ref={fieldRef}
        data-state={
          hasError
            ? "error"
            : success
              ? "success"
              : focused
                ? "focused"
                : "idle"
        }
        className={cn(
          "relative h-11 overflow-hidden rounded-full border border-border bg-background transition-colors duration-200",
          focused && !hasError && "border-foreground/40 ring-2 ring-ring/40",
          hasError && "border-destructive ring-2 ring-destructive/25",
          disabled && "opacity-60",
        )}
      >
        {leftIcon ? (
          <span className="pointer-events-none absolute start-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:size-4">
            {leftIcon}
          </span>
        ) : null}

        <input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
          {...rest}
          dir="rtl"
          // Inline styles beat UA LTR defaults on email/password inputs.
          style={{
            direction: "rtl",
            textAlign: "right",
            ...(rest.style as CSSProperties | undefined),
          }}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            "peer h-full w-full bg-transparent text-base leading-6 text-foreground caret-foreground outline-none",
            "placeholder:text-muted-foreground/60",
            leftIcon ? "ps-10" : "ps-3.5",
            rightSlot || success ? "pe-10" : "pe-3.5",
            disabled && "cursor-not-allowed",
          )}
        />

        {success ? (
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute end-3.5 top-1/2 size-5 -translate-y-1/2 text-emerald-500"
            aria-hidden
          >
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </motion.svg>
        ) : rightSlot ? (
          <span className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center [&_svg]:size-4">
            {rightSlot}
          </span>
        ) : null}
      </div>

      {reserveErrorLine || errorMessage ? (
        <div className="min-h-4 px-1">
          <AnimatePresence initial={false}>
            {errorMessage ? (
              <motion.p
                id={`${id}-error`}
                role="alert"
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4, filter: "blur(4px)" }
                }
                transition={{ duration: 0.2 }}
                className="text-xs text-destructive"
              >
                {errorMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}

function TermsCheckbox({
  checked,
  disabled,
  label,
  onCheckedChange,
  "aria-describedby": describedBy,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  "aria-describedby"?: string;
}) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-xl px-1 py-0.5 text-sm text-foreground",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded-[4px] border-border accent-primary"
      />
      <span className="min-w-0 flex-1 leading-5">{label}</span>
    </label>
  );
}

function StatefulSubmit({
  state,
  children,
  loadingText,
  successText,
  errorText,
  className,
  "aria-describedby": describedBy,
}: {
  state: SignUpStatus;
  children: ReactNode;
  loadingText: string;
  successText: string;
  errorText: string;
  className?: string;
  "aria-describedby"?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const label =
    state === "loading"
      ? loadingText
      : state === "success"
        ? successText
        : state === "error"
          ? errorText
          : children;

  return (
    <button
      type="submit"
      disabled={state === "loading" || state === "success"}
      aria-describedby={describedBy}
      className={cn(
        "relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors",
        "hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-80",
        state === "success" && "bg-emerald-600 hover:bg-emerald-600",
        state === "error" && "bg-destructive hover:bg-destructive",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "loading" ? (
          <motion.span
            key="loading-icon"
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={reduce ? { duration: 0 } : SPRING_SWAP}
            className="inline-grid place-items-center"
          >
            <Loader2 className="size-4 animate-spin" />
          </motion.span>
        ) : state === "success" ? (
          <motion.span
            key="success-icon"
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={reduce ? { duration: 0 } : SPRING_SWAP}
            className="inline-grid place-items-center"
          >
            <Check className="size-4" />
          </motion.span>
        ) : state === "error" ? (
          <motion.span
            key="error-icon"
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={reduce ? { duration: 0 } : SPRING_SWAP}
            className="inline-grid place-items-center"
          >
            <X className="size-4" />
          </motion.span>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(label)}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
          className="inline-block"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/** Composed sign-up form with blur-gated errors, strength meter, and submit lifecycle. */
export function SignUpForm({
  values: valuesProp,
  defaultValues,
  onValuesChange,
  onSubmit,
  validate,
  status: statusProp,
  errorMessage,
  title = "ساخت حساب کاربری",
  description = "در کمتر از یک دقیقه شروع کنید.",
  submitLabel = "ساخت حساب",
  loadingText = "در حال ساخت حساب",
  successText = "حساب ساخته شد",
  errorText = "دوباره تلاش کنید",
  footer,
  strengthMeter = true,
  className,
  classNames,
}: SignUpFormProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();

  const controlled = valuesProp !== undefined;
  const [internalValues, setInternalValues] = useState<SignUpValues>({
    ...EMPTY_VALUES,
    ...defaultValues,
  });
  const values = controlled ? valuesProp : internalValues;

  const [internalStatus, setInternalStatus] = useState<SignUpStatus>("idle");
  const status = statusProp ?? internalStatus;

  const [revealPassword, setRevealPassword] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof SignUpValues, boolean>>
  >({});

  const errors = useMemo(
    () => (validate ?? defaultValidate)(values),
    [values, validate],
  );

  const setValue = useCallback(
    <K extends keyof SignUpValues>(key: K, next: SignUpValues[K]) => {
      const nextValues = { ...values, [key]: next };
      if (!controlled) {
        setInternalValues(nextValues);
        if (statusProp === undefined) {
          setInternalStatus((current) =>
            current === "success" || current === "error" ? "idle" : current,
          );
        }
      }
      onValuesChange?.(nextValues);
    },
    [controlled, onValuesChange, statusProp, values],
  );

  const touch = useCallback((key: keyof SignUpValues) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const shownError = (key: keyof SignUpValues) =>
    touched[key] ? errors[key] : undefined;

  const isValid = (key: keyof SignUpValues) =>
    Boolean(touched[key]) && !errors[key] && Boolean(values[key]);

  const strength = passwordStrength(values.password);
  const showStrength = strengthMeter && values.password.length > 0;
  const isSubmitting = status === "loading";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (Object.keys(errors).length > 0) return;
    if (!onSubmit) return;

    if (statusProp === undefined) setInternalStatus("loading");
    try {
      await onSubmit(values);
      if (statusProp === undefined) setInternalStatus("success");
    } catch {
      if (statusProp === undefined) setInternalStatus("error");
    }
  };

  const termsErrorId = `${baseId}-terms-error`;
  const formErrorId = `${baseId}-form-error`;

  return (
    <form
      dir="rtl"
      noValidate
      data-slot="signup-form"
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-border bg-card p-6 text-start text-card-foreground shadow-sm",
        className,
        classNames?.root,
      )}
    >
      {title || description ? (
        <div className={cn("flex flex-col gap-1", classNames?.header)}>
          {title ? (
            <h2
              className={cn(
                "text-xl font-semibold text-foreground",
                classNames?.title,
              )}
            >
              {title}
            </h2>
          ) : null}
          {description ? (
            <p
              className={cn(
                "text-sm text-muted-foreground",
                classNames?.description,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={cn("flex flex-col gap-1", classNames?.fields)}>
        <FieldInput
          label="نام"
          autoComplete="name"
          placeholder="آدا لاولیس"
          leftIcon={<User />}
          disabled={isSubmitting}
          value={values.name}
          onChange={(next) => setValue("name", next)}
          onBlur={() => touch("name")}
          error={shownError("name")}
          reserveErrorLine
          success={isValid("name")}
        />

        <FieldInput
          label="ایمیل"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail />}
          disabled={isSubmitting}
          value={values.email}
          onChange={(next) => setValue("email", next)}
          onBlur={() => touch("email")}
          error={shownError("email")}
          reserveErrorLine
          success={isValid("email")}
        />

        <div className="flex flex-col gap-2">
          <FieldInput
            label="رمز عبور"
            type={revealPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="حداقل ۸ نویسه"
            leftIcon={<Lock />}
            rightIcon={
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setRevealPassword((prev) => !prev)}
                aria-label={
                  revealPassword ? "پنهان کردن رمز" : "نمایش رمز"
                }
                className="text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
              >
                {revealPassword ? <EyeOff /> : <Eye />}
              </button>
            }
            disabled={isSubmitting}
            value={values.password}
            onChange={(next) => setValue("password", next)}
            onBlur={() => touch("password")}
            error={shownError("password")}
            reserveErrorLine
          />

          <AnimatePresence initial={false}>
            {showStrength ? (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className={cn(
                  "flex flex-col gap-1.5 px-1",
                  classNames?.strength,
                )}
              >
                <div className="flex gap-1.5" aria-hidden>
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-muted-foreground/20"
                    >
                      <motion.span
                        initial={false}
                        animate={{ scaleX: index < strength ? 1 : 0 }}
                        transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                        className={cn(
                          "block h-full w-full origin-right rounded-full",
                          STRENGTH_COLORS[strength],
                        )}
                      />
                    </span>
                  ))}
                </div>
                <p aria-live="polite" className="text-xs text-muted-foreground">
                  قدرت رمز: {STRENGTH_LABELS[strength]}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <FieldInput
          label="تأیید رمز عبور"
          type={revealPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="رمز را دوباره وارد کنید"
          leftIcon={<Lock />}
          disabled={isSubmitting}
          value={values.confirmPassword}
          onChange={(next) => setValue("confirmPassword", next)}
          onBlur={() => touch("confirmPassword")}
          error={shownError("confirmPassword")}
          reserveErrorLine
          success={isValid("confirmPassword")}
        />
      </div>

      <div className={cn("flex flex-col gap-1.5", classNames?.terms)}>
        <TermsCheckbox
          checked={values.terms}
          disabled={isSubmitting}
          onCheckedChange={(next) => {
            setValue("terms", next);
            touch("terms");
          }}
          label="شرایط استفاده و حریم خصوصی را می‌پذیرم"
          aria-describedby={shownError("terms") ? termsErrorId : undefined}
        />
        <AnimatePresence initial={false}>
          {shownError("terms") ? (
            <motion.p
              id={termsErrorId}
              role="alert"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -4, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -4, filter: "blur(4px)" }
              }
              transition={{ duration: 0.2 }}
              className="px-1 text-xs text-destructive"
            >
              {shownError("terms")}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {errorMessage ? (
          <motion.p
            id={formErrorId}
            role="alert"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {errorMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <StatefulSubmit
        state={status}
        loadingText={loadingText}
        successText={successText}
        errorText={errorText}
        aria-describedby={errorMessage ? formErrorId : undefined}
        className={cn(classNames?.submit)}
      >
        {submitLabel}
      </StatefulSubmit>

      {footer ? (
        <div
          className={cn(
            "text-center text-sm text-muted-foreground",
            classNames?.footer,
          )}
        >
          {footer}
        </div>
      ) : null}
    </form>
  );
}

export default function SignUpFormDemo() {
  const [formError, setFormError] = useState<string>();
  const [run, setRun] = useState(0);

  return (
    <div dir="rtl" className="flex w-full justify-center px-1 py-2 text-start">
      <SignUpForm
        key={run}
        description="با taken@example.com ثبت‌نام کنید تا حالت خطا را ببینید."
        errorMessage={formError}
        onSubmit={async (values) => {
          setFormError(undefined);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (values.email.toLowerCase().startsWith("taken@")) {
            setFormError("این ایمیل قبلاً ثبت شده است.");
            throw new Error("Email already registered");
          }
        }}
        footer={
          <>
            قبلاً حساب دارید؟{" "}
            <button
              type="button"
              onClick={() => {
                setFormError(undefined);
                setRun((v) => v + 1);
              }}
              className="font-medium text-foreground underline underline-offset-4"
            >
              ورود
            </button>
          </>
        }
      />
    </div>
  );
}
