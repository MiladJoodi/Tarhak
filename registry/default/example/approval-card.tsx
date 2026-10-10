"use client";
// Adapted from beui.dev/components/agents/approval-card

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  LoaderCircle,
  MessageSquareText,
  RotateCcw,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ApprovalCardStatus =
  | "pending"
  | "submitting"
  | "approved"
  | "rejected"
  | "changes-requested"
  | "answered";

export type ApprovalCardOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ApprovalCardQuestion = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  options?: ApprovalCardOption[];
  multiple?: boolean;
  autoAdvance?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
};

export type ApprovalCardAnswer = {
  selected: string[];
  custom?: string;
};

export type ApprovalCardAnswers = Record<string, ApprovalCardAnswer>;

export type ApprovalCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  questions?: ApprovalCardQuestion[];
  status?: ApprovalCardStatus;
  answers?: ApprovalCardAnswers;
  defaultAnswers?: ApprovalCardAnswers;
  onAnswersChange?: (answers: ApprovalCardAnswers) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  onSubmit?: (answers: ApprovalCardAnswers) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestChanges?: () => void;
  onDismiss?: () => void;
  approveLabel?: ReactNode;
  requestChangesLabel?: ReactNode;
  rejectLabel?: ReactNode;
  submitLabel?: ReactNode;
  result?: ReactNode;
  className?: string;
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_SWAP = {
  type: "spring" as const,
  stiffness: 460,
  damping: 30,
  mass: 0.55,
};

const EMPTY_ANSWER: ApprovalCardAnswer = { selected: [], custom: "" };

function getStatusLabel(status: ApprovalCardStatus) {
  if (status === "submitting") return "در حال ارسال";
  if (status === "approved") return "تأیید شد";
  if (status === "rejected") return "رد شد";
  if (status === "changes-requested") return "درخواست اصلاح";
  if (status === "answered") return "پاسخ ثبت شد";
  return "نیاز به تصمیم";
}

function getStatusClass(status: ApprovalCardStatus) {
  if (status === "approved" || status === "answered") {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (status === "rejected") return "text-rose-600 dark:text-rose-400";
  if (status === "changes-requested") {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-muted-foreground";
}

function getStatusBadgeClass(status: ApprovalCardStatus) {
  if (status === "pending" || status === "changes-requested") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  if (status === "submitting") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
  }
  if (status === "approved" || status === "answered") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
}

function isAnswered(answer: ApprovalCardAnswer) {
  return answer.selected.length > 0 || Boolean(answer.custom?.trim());
}

function AgentDisclosure({
  open,
  openHeight = "auto",
  className,
  style,
  transition,
  ...props
}: Omit<HTMLMotionProps<"div">, "animate" | "initial"> & {
  open: boolean;
  openHeight?: CSSProperties["height"];
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      {...props}
      aria-hidden={!open}
      {...(!open ? ({ inert: "" } as object) : null)}
      initial={false}
      animate={
        reduce
          ? { opacity: open ? 1 : 0 }
          : {
              opacity: open ? 1 : 0,
              clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
              y: open ? 0 : -4,
            }
      }
      transition={
        transition ?? {
          duration: reduce ? 0 : open ? 0.22 : 0.14,
          ease: EASE_OUT,
        }
      }
      className={cn("overflow-hidden", className)}
      style={{
        ...style,
        height: open ? openHeight : 0,
        pointerEvents: open ? undefined : "none",
        transformOrigin: "top",
      }}
    />
  );
}

function TitleSwap({ value, children }: { value: string; children: ReactNode }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <span className="relative block overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-70%", opacity: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.28, ease: EASE_OUT }
          }
          className="block"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function OptionRow({
  checked,
  disabled,
  label,
  multiple,
  name,
  value,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  multiple: boolean;
  name: string;
  value: string;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 text-sm text-foreground outline-none transition-colors",
        "hover:bg-background/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        id={id}
        type={multiple ? "checkbox" : "radio"}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          "size-4 shrink-0 border-border text-primary accent-primary",
          multiple ? "rounded-[4px]" : "rounded-full",
        )}
      />
      <span className="min-w-0 flex-1 leading-5">{label}</span>
    </label>
  );
}

function QuestionOptions({
  question,
  answer,
  disabled,
  onChange,
  onSingleSelect,
}: {
  question: ApprovalCardQuestion;
  answer: ApprovalCardAnswer;
  disabled: boolean;
  onChange: (answer: ApprovalCardAnswer) => void;
  onSingleSelect?: () => void;
}) {
  const groupId = useId();
  const custom = answer.custom ?? "";

  return (
    <div className="mt-3">
      {question.options?.length ? (
        <div
          role={question.multiple ? "group" : "radiogroup"}
          aria-label={
            typeof question.title === "string" ? question.title : undefined
          }
          className="grid gap-0.5"
        >
          {question.options.map((option) => (
            <OptionRow
              key={option.value}
              name={groupId}
              value={option.value}
              label={option.label}
              multiple={Boolean(question.multiple)}
              checked={answer.selected.includes(option.value)}
              disabled={disabled || option.disabled}
              onChange={(checked) => {
                if (question.multiple) {
                  onChange({
                    ...answer,
                    selected: checked
                      ? [...answer.selected, option.value]
                      : answer.selected.filter((v) => v !== option.value),
                  });
                  return;
                }
                onChange({ selected: [option.value], custom: "" });
                onSingleSelect?.();
              }}
            />
          ))}
        </div>
      ) : null}

      {question.allowCustom ? (
        <input
          type="text"
          value={custom}
          disabled={disabled}
          placeholder={
            question.customPlaceholder ?? "پاسخ دیگری بنویسید…"
          }
          onChange={(e) =>
            onChange({
              selected: question.multiple ? answer.selected : [],
              custom: e.target.value,
            })
          }
          className={cn(
            "h-10 w-full rounded-xl border-0 bg-background/70 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus-visible:ring-2 focus-visible:ring-ring",
            question.options?.length && "mt-1.5",
          )}
        />
      ) : null}
    </div>
  );
}

function ProgressDots({ current, ids }: { current: number; ids: string[] }) {
  return (
    <span className="flex gap-1.5">
      <span className="sr-only">
        سوال {current + 1} از {ids.length}
      </span>
      {ids.map((id, index) => (
        <motion.span
          key={id}
          aria-hidden="true"
          initial={{
            scale: index === current ? 1 : 0.75,
            opacity: index <= current ? 1 : 0.35,
          }}
          animate={{
            scale: index === current ? 1 : 0.75,
            opacity: index <= current ? 1 : 0.35,
          }}
          transition={SPRING_SWAP}
          className="size-1.5 rounded-full bg-foreground"
        />
      ))}
    </span>
  );
}

function ActionButton({
  children,
  className,
  disabled,
  onClick,
  size = "sm",
  variant = "default",
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "icon";
  variant?: "default" | "secondary" | "ghost";
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        size === "icon" ? "size-8" : "h-8 px-3",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" &&
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Human-in-the-loop card for approvals, multi-step questions, and recorded decisions. */
export function ApprovalCard({
  title = "نیاز به تأیید",
  description,
  children,
  questions = [],
  status = "pending",
  answers,
  defaultAnswers = {},
  onAnswersChange,
  step,
  defaultStep = 0,
  onStepChange,
  onSubmit,
  onApprove,
  onReject,
  onRequestChanges,
  onDismiss,
  approveLabel = "تأیید",
  requestChangesLabel = "درخواست اصلاح",
  rejectLabel = "رد",
  submitLabel = "ارسال پاسخ",
  result,
  className,
}: ApprovalCardProps) {
  const reduce = useReducedMotion() ?? false;
  const [internalAnswers, setInternalAnswers] =
    useState<ApprovalCardAnswers>(defaultAnswers);
  const [internalStep, setInternalStep] = useState(defaultStep);
  const autoAdvanceTimer = useRef<number | undefined>(undefined);
  const currentAnswers = answers ?? internalAnswers;
  const currentStep = Math.min(
    Math.max(0, step ?? internalStep),
    Math.max(0, questions.length - 1),
  );
  const question = questions[currentStep];
  const questionMode = questions.length > 0;
  const multipleQuestions = questions.length > 1;
  const pending = status === "pending";
  const busy = status === "submitting";
  const interactive = pending || busy;
  const currentAnswer = question
    ? (currentAnswers[question.id] ?? EMPTY_ANSWER)
    : EMPTY_ANSWER;
  const displayTitle = question?.title ?? title;
  const titleKey = question?.id ?? String(status);
  const statusLabel = getStatusLabel(status);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current === undefined) return;
    window.clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = undefined;
  }, []);

  useEffect(() => clearAutoAdvance, [clearAutoAdvance]);

  const setAnswers = useCallback(
    (next: ApprovalCardAnswers) => {
      if (answers === undefined) setInternalAnswers(next);
      onAnswersChange?.(next);
    },
    [answers, onAnswersChange],
  );

  const setStep = (next: number) => {
    clearAutoAdvance();
    if (step === undefined) setInternalStep(next);
    onStepChange?.(next);
  };

  const updateCurrentAnswer = (next: ApprovalCardAnswer) => {
    if (!question) return;
    setAnswers({ ...currentAnswers, [question.id]: next });
  };

  const continueQuestion = () => {
    if (currentStep < questions.length - 1) {
      setStep(currentStep + 1);
      return;
    }
    onSubmit?.(currentAnswers);
  };

  const queueAutoAdvance = () => {
    if (
      !question ||
      question.multiple ||
      question.autoAdvance === false ||
      currentStep >= questions.length - 1 ||
      busy
    ) {
      return;
    }

    clearAutoAdvance();
    autoAdvanceTimer.current = window.setTimeout(() => {
      setStep(currentStep + 1);
    }, 240);
  };

  return (
    <div
      dir="rtl"
      data-slot="approval-card"
      data-state={status}
      aria-busy={busy}
      className={cn(
        "w-full overflow-hidden rounded-2xl bg-muted p-4 text-sm text-start",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 shrink-0 place-items-center text-muted-foreground",
            getStatusClass(status),
          )}
        >
          {busy ? (
            <LoaderCircle className={cn("size-4", !reduce && "animate-spin")} />
          ) : interactive ? (
            questionMode ? (
              <CircleHelp className="size-4" />
            ) : (
              <MessageSquareText className="size-4" />
            )
          ) : status === "rejected" ? (
            <X className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-3">
            <h3 className="min-w-0 flex-1 text-base font-medium leading-5 text-foreground">
              <TitleSwap value={titleKey}>{displayTitle}</TitleSwap>
            </h3>
            {questionMode && interactive ? (
              multipleQuestions ? (
                <span
                  dir="ltr"
                  className="shrink-0 text-xs tabular-nums text-muted-foreground/65"
                >
                  {currentStep + 1}/{questions.length}
                </span>
              ) : null
            ) : (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  getStatusBadgeClass(status),
                )}
              >
                {statusLabel}
              </span>
            )}
            {onDismiss ? (
              <button
                type="button"
                aria-label="بستن"
                onClick={onDismiss}
                className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <AgentDisclosure open={interactive}>
            {questionMode && question ? (
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={question.id}
                  initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: 6 }}
                  transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }}
                >
                  {question.description ? (
                    <p className="mt-1 leading-5 text-muted-foreground">
                      {question.description}
                    </p>
                  ) : null}
                  <QuestionOptions
                    question={question}
                    answer={currentAnswer}
                    disabled={busy}
                    onChange={updateCurrentAnswer}
                    onSingleSelect={queueAutoAdvance}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div>
                {description ? (
                  <p className="mt-1 leading-5 text-muted-foreground">
                    {description}
                  </p>
                ) : null}
                {children ? <div className="mt-3">{children}</div> : null}
              </div>
            )}

            {questionMode ? (
              <div className="mt-4 flex items-center gap-3">
                {multipleQuestions ? (
                  <>
                    <ActionButton
                      variant="ghost"
                      size="icon"
                      aria-label="سوال قبلی"
                      disabled={busy || currentStep === 0}
                      onClick={() => setStep(currentStep - 1)}
                    >
                      <ArrowRight className="size-4" />
                    </ActionButton>
                    <ProgressDots
                      current={currentStep}
                      ids={questions.map((item) => item.id)}
                    />
                  </>
                ) : null}
                <ActionButton
                  size={
                    currentStep === questions.length - 1 ? "sm" : "icon"
                  }
                  aria-label={
                    currentStep === questions.length - 1
                      ? "ارسال پاسخ"
                      : "سوال بعدی"
                  }
                  disabled={busy || !isAnswered(currentAnswer)}
                  onClick={continueQuestion}
                  className="ms-auto"
                >
                  {busy ? (
                    <LoaderCircle
                      className={cn("size-4", !reduce && "animate-spin")}
                    />
                  ) : currentStep === questions.length - 1 ? (
                    <>
                      {submitLabel}
                      <ArrowLeft className="size-3.5" />
                    </>
                  ) : (
                    <ArrowLeft className="size-4" />
                  )}
                </ActionButton>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ActionButton size="sm" disabled={busy} onClick={onApprove}>
                  {approveLabel}
                </ActionButton>
                {onRequestChanges ? (
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={onRequestChanges}
                  >
                    {requestChangesLabel}
                  </ActionButton>
                ) : null}
                {onReject ? (
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={onReject}
                    className="text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    {rejectLabel}
                  </ActionButton>
                ) : null}
              </div>
            )}
          </AgentDisclosure>

          {!interactive ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {result ?? statusLabel}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const QUESTIONS: ApprovalCardQuestion[] = [
  {
    id: "scope",
    title: "تمرکز اولین انتشار چقدر باشد؟",
    options: [
      { value: "focused", label: "یک مجموعهٔ شروع متمرکز" },
      { value: "broad", label: "یک مجموعهٔ گسترده‌تر" },
      { value: "flagship", label: "یک تجربهٔ پرچم‌دار" },
    ],
    allowCustom: true,
    customPlaceholder: "محدودهٔ دیگری توصیف کنید…",
  },
  {
    id: "checks",
    title: "کدام بررسی‌ها انتشار را متوقف کنند؟",
    description: "هر بررسی‌ای که ایجنت باید قبل از ادامه پاس کند را انتخاب کنید.",
    multiple: true,
    options: [
      { value: "types", label: "ایمنی تایپ" },
      { value: "accessibility", label: "دسترس‌پذیری" },
      { value: "registry", label: "اعتبارسنجی رجیستری" },
    ],
  },
  {
    id: "preserve",
    title: "چیزی هست که ایجنت باید حفظ کند؟",
    allowCustom: true,
    customPlaceholder: "یک محدودیت پایانی اضافه کنید…",
  },
];

function QuestionFlow() {
  const [status, setStatus] = useState<ApprovalCardStatus>("pending");
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const submit = (_answers: ApprovalCardAnswers) => {
    setStatus("submitting");
    timer.current = window.setTimeout(() => setStatus("answered"), 750);
  };

  return (
    <ApprovalCard
      questions={QUESTIONS}
      status={status}
      onSubmit={submit}
      result="سه پاسخ برای ایجنت ارسال شد."
    />
  );
}

function ReviewFlow() {
  const [status, setStatus] = useState<ApprovalCardStatus>("pending");
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const finish = (next: ApprovalCardStatus) => {
    setStatus("submitting");
    timer.current = window.setTimeout(() => setStatus(next), 700);
  };

  return (
    <ApprovalCard
      title="به‌روزرسانی کامپوننت منتشر شود؟"
      description="ایجنت انتشار را آماده کرده و منتظر تصمیم شماست."
      status={status}
      onApprove={() => finish("approved")}
      onRequestChanges={() => finish("changes-requested")}
      onReject={() => finish("rejected")}
      result={
        status === "approved"
          ? "انتشار تأیید شد."
          : status === "changes-requested"
            ? "ایجنت منتظر یادداشت اصلاح می‌ماند."
            : "انتشار رد شد."
      }
    >
      <dl className="grid gap-1 text-xs">
        <div className="flex items-center justify-between gap-4 py-1">
          <dt className="text-muted-foreground">انتشار</dt>
          <dd dir="ltr" className="font-mono text-foreground/80">
            approval-card
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <dt className="text-muted-foreground">بررسی‌ها</dt>
          <dd className="text-foreground/80">۴ مورد پاس</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <dt className="text-muted-foreground">نمایش</dt>
          <dd className="text-foreground/80">رجیستری عمومی</dd>
        </div>
      </dl>
    </ApprovalCard>
  );
}

export default function ApprovalCardDemo() {
  const [questionRun, setQuestionRun] = useState(0);
  const [reviewRun, setReviewRun] = useState(0);

  return (
    <div
      dir="rtl"
      className="flex w-full max-w-lg flex-col gap-8 px-1 text-start"
    >
      <div className="relative">
        <QuestionFlow key={questionRun} />
        <button
          type="button"
          onClick={() => setQuestionRun((v) => v + 1)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-3" />
          پخش دوباره
        </button>
      </div>

      <div className="relative">
        <ReviewFlow key={reviewRun} />
        <button
          type="button"
          onClick={() => setReviewRun((v) => v + 1)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-3" />
          پخش دوباره
        </button>
      </div>
    </div>
  );
}
