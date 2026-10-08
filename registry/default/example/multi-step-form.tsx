"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale/fa-IR";
import { Check, ChevronRight, ChevronLeft, CalendarIcon } from "lucide-react";
import { useForm, FormProvider as Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";

const TEAM_SIZE_OPTIONS = [
  { label: "اندازه تیم را انتخاب کنید", value: null },
  { label: "۱ تا ۵ نفر", value: "1-5" },
  { label: "۵ تا ۱۰ نفر", value: "5-10" },
  { label: "بیش از ۱۰ نفر", value: "10+" },
];

const PRIORITY_OPTIONS = [
  { label: "اولویت را انتخاب کنید", value: null },
  { label: "کم", value: "Low" },
  { label: "متوسط", value: "Medium" },
  { label: "زیاد", value: "High" },
  { label: "بحرانی", value: "Critical" },
];

const formSchema = z.object({
  "project-name": z.string().optional(),
  "due-date": z.date().optional(),
  description: z.string().optional(),
  "team-size": z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  tag: z.array(z.string()).optional(),
  mood: z.string().optional(),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<number>();
  const [ref, bounds] = useMeasure();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "project-name": "",
      "due-date": undefined,
      description: "",
      "team-size": null,
      priority: null,
      tag: [],
      mood: "",
      comment: "",
    },
  });

  function onSubmit(values: FormValues) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("ارسال فرم ناموفق بود. دوباره تلاش کنید.");
    }
  }

  const nextStep = () => {
    if (currentStep === 2) {
      form.handleSubmit(onSubmit)();
      return;
    }
    if (currentStep < 2) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Change Here
  const stepTitles = [
    {
      title: "ایجاد پروژهٔ جدید",
      description: "جزئیات اصلی فضای کاری را وارد کنید.",
    },
    {
      title: "پیکربندی",
      description: "دسترسی تیم و اولویت پروژه را تنظیم کنید.",
    },
    {
      title: "حال‌وهوای شروع پروژه",
      description: "چقدر به این پروژهٔ جدید اطمینان دارید؟",
    },
  ];

  const watchedValues = form.watch();

  const content = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 py-4">
            <Field>
              <FieldLabel htmlFor="project-name">نام پروژه</FieldLabel>
              <Input
                id="project-name"
                placeholder="مثلاً طراحی وب‌سایت"
                {...form.register("project-name")}
              />
              <FieldError>
                {form.formState.errors["project-name"]?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="due-date">مهلت تحویل</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-start font-normal",
                        !watchedValues["due-date"] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="me-2 h-4 w-4" />
                      {watchedValues["due-date"] ? (
                        format(watchedValues["due-date"] as Date, "PPP", {
                          locale: faIR,
                        })
                      ) : (
                        <span>تاریخ را انتخاب کنید</span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent
                  dir="rtl"
                  lang="fa"
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    jalali
                    mode="single"
                    selected={watchedValues["due-date"]}
                    onSelect={(date) => form.setValue("due-date", date)}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldError>
                {form.formState.errors["due-date"]?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">توضیحات</FieldLabel>
              <Textarea
                id="description"
                placeholder="اهداف و دامنهٔ پروژه را شرح دهید..."
                className="min-h-[100px]"
                {...form.register("description")}
              />
              <FieldError>
                {form.formState.errors.description?.message}
              </FieldError>
            </Field>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="team-size">اندازه تیم</FieldLabel>
                <Select
                  dir="rtl"
                  items={TEAM_SIZE_OPTIONS}
                  value={watchedValues["team-size"] ?? null}
                  onValueChange={(val) => form.setValue("team-size", val)}
                >
                  <SelectTrigger id="team-size" className="w-full text-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl" lang="fa">
                    {TEAM_SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.label} value={opt.value as any}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>
                  {form.formState.errors["team-size"]?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="priority">اولویت</FieldLabel>
                <Select
                  dir="rtl"
                  items={PRIORITY_OPTIONS}
                  value={watchedValues["priority"] ?? null}
                  onValueChange={(val) => form.setValue("priority", val)}
                >
                  <SelectTrigger id="priority" className="w-full text-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl" lang="fa">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.label} value={opt.value as any}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>
                  {form.formState.errors.priority?.message}
                </FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="tag">برچسب‌ها</FieldLabel>
              <div className="space-y-2">
                <div className="mb-2 flex flex-wrap gap-2">
                  {watchedValues["tag"]?.map((t, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {t}
                      <button
                        type="button"
                        onClick={() => {
                          const tags = form.getValues("tag") || [];
                          form.setValue(
                            "tag",
                            tags.filter((_, index) => index !== i)
                          );
                        }}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  id="tag"
                  placeholder="مثلاً طراحی، بازاریابی"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        const tags = form.getValues("tag") || [];
                        if (!tags.includes(val)) {
                          form.setValue("tag", [...tags, val]);
                        }
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
              </div>
              <FieldError>{form.formState.errors.tag?.message}</FieldError>
            </Field>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 py-4">
            <div className="relative overflow-hidden rounded-xl border bg-background">
              <div className="flex w-full divide-x border-b bg-muted/5">
                {[
                  { emoji: "😰", value: "anxious", label: "مضطرب" },
                  { emoji: "😟", value: "worried", label: "نگران" },
                  { emoji: "😐", value: "neutral", label: "خنثی" },
                  { emoji: "🙂", value: "good", label: "خوب" },
                  { emoji: "🤩", value: "excited", label: "هیجان‌زده" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "flex-1 p-3 text-2xl transition-all hover:bg-muted focus:outline-none md:p-4 md:text-3xl",
                      watchedValues["mood"] === option.value
                        ? "bg-primary/10 grayscale-0"
                        : "grayscale-[1] hover:grayscale-0"
                    )}
                    type="button"
                    title={option.label}
                    onClick={() => form.setValue("mood", option.value)}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
              <Textarea
                id="comment"
                placeholder="نظر خود را بنویسید..."
                className="min-h-[140px] resize-none rounded-none border-0 bg-transparent p-4 placeholder:text-muted-foreground/60 focus-visible:ring-0"
                {...form.register("comment")}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              بازخورد شما به درک حال‌وهوای شروع پروژه کمک می‌کند.
            </p>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, form, watchedValues]);

  const variants = {
    initial: (direction: number) => {
      return { x: `${-110 * direction}%`, opacity: 0 };
    },
    animate: { x: "0%", opacity: 1 },
    exit: (direction: number) => {
      return { x: `${110 * direction}%`, opacity: 0 };
    },
  };

  return (
    <Form {...form}>
      <MotionConfig
        transition={{
          duration: 0.5,
          type: "spring",
          bounce: 0,
        }}
      >
        <div
          dir="rtl"
          lang="fa"
          className="flex w-full items-center justify-center bg-muted/10 p-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
        >
          <Card className="w-full max-w-xl overflow-hidden border bg-background shadow-none">
            <motion.div layout>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 py-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl">
                    {stepTitles[currentStep].title}
                  </CardTitle>
                  <CardDescription>
                    {stepTitles[currentStep].description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {stepTitles.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        currentStep === index
                          ? "w-8 bg-primary"
                          : "w-2 bg-primary/20"
                      )}
                    />
                  ))}
                </div>
              </CardHeader>

              <motion.div
                animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
                className="relative overflow-hidden"
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              >
                <div ref={ref}>
                  <CardContent className="relative px-6 py-2">
                    <AnimatePresence
                      mode="popLayout"
                      initial={false}
                      custom={direction}
                    >
                      <motion.div
                        key={currentStep}
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full"
                        custom={direction}
                      >
                        {content}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </div>
              </motion.div>

              <CardFooter className="flex items-center justify-between border-t py-4">
                <Button
                  variant={"secondary"}
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                  بازگشت
                </Button>
                <Button type="button" onClick={nextStep}>
                  {currentStep === stepTitles.length - 1 ? (
                    <>
                      پایان <Check className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      ادامه <ChevronLeft className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          </Card>
        </div>
      </MotionConfig>
    </Form>
  );
}
