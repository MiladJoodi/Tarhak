"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Minus, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

const months = [
  { label: "ماه", value: "mm" },
  { label: "۰۱", value: "01" },
  { label: "۰۲", value: "02" },
  { label: "۰۳", value: "03" },
  { label: "۰۴", value: "04" },
  { label: "۰۵", value: "05" },
  { label: "۰۶", value: "06" },
  { label: "۰۷", value: "07" },
  { label: "۰۸", value: "08" },
  { label: "۰۹", value: "09" },
  { label: "۱۰", value: "10" },
  { label: "۱۱", value: "11" },
  { label: "۱۲", value: "12" },
];

const years = [
  { label: "سال", value: "yyyy" },
  { label: "۱۴۰۳", value: "1403" },
  { label: "۱۴۰۴", value: "1404" },
  { label: "۱۴۰۵", value: "1405" },
  { label: "۱۴۰۶", value: "1406" },
  { label: "۱۴۰۷", value: "1407" },
  { label: "۱۴۰۸", value: "1408" },
];

const COUPON_CODE = "SAVE10";
const COUPON_DISCOUNT_RATE = 0.1;
const REVEAL_EASE = [0.76, 0, 0.24, 1] as const;
const REVEAL_DURATION = 0.8;
const REVEAL_STAGGER = 0.05;

const initialCartItems = [
  {
    id: "headphones",
    name: "هدفون بی‌سیم",
    variant: "مشکی نیمه‌شب",
    price: 7_499_000,
    quantity: 1,
    imageClassName: "bg-zinc-900",
  },
  {
    id: "tote",
    name: "کیف دستی چرمی",
    variant: "قهوه‌ای · متوسط",
    price: 4_450_000,
    quantity: 2,
    imageClassName: "bg-amber-700",
  },
  {
    id: "mug",
    name: "ست ماگ سرامیکی",
    variant: "۴ تکه",
    price: 1_725_000,
    quantity: 1,
    imageClassName: "bg-sky-200",
  },
];

type CartItem = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  imageClassName: string;
};

type RevealDirection = "left" | "right";

const RevealContext = createContext<RevealDirection>("right");

type DrawerRevealProps = {
  children: ReactNode;
  direction: RevealDirection;
  open?: boolean;
};

const DrawerReveal = ({
  children,
  direction,
  open = false,
}: DrawerRevealProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <RevealContext.Provider value={direction}>
      <motion.div
        initial={false}
        animate={open ? "show" : "hidden"}
        variants={{
          show: {
            transition: shouldReduceMotion
              ? { duration: 0 }
              : { staggerChildren: REVEAL_STAGGER },
          },
          hidden: {
            transition: shouldReduceMotion
              ? { duration: 0 }
              : { staggerChildren: REVEAL_STAGGER, staggerDirection: -1 },
          },
        }}
      >
        {children}
      </motion.div>
    </RevealContext.Provider>
  );
};

const RevealItem = ({
  className,
  children,
  role,
}: {
  className?: string;
  children: ReactNode;
  role?: string;
}) => {
  const direction = useContext(RevealContext);
  const shouldReduceMotion = useReducedMotion();
  const offsetX = direction === "left" ? -42 : 42;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, x: offsetX, filter: "blur(12px)" },
        show: shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, x: 0, filter: "blur(0px)" },
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: REVEAL_DURATION, ease: REVEAL_EASE }
      }
      role={role}
    >
      {children}
    </motion.div>
  );
};

const formatPrice = (amount: number) =>
  `${toFaDigits(amount.toLocaleString("fa-IR"))} تومان`;

type DrawerFieldContentProps = {
  revealOpen?: boolean;
};

export const FieldDemo = ({ revealOpen }: DrawerFieldContentProps = {}) => {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="w-full max-w-md text-start text-foreground [&_input]:text-foreground [&_textarea]:text-foreground [&_[data-slot=select-trigger]]:text-foreground"
    >
      <DrawerReveal direction="right" open={revealOpen}>
        <form>
          <FieldGroup>
            <FieldSet>
              <RevealItem>
                <FieldLegend className="text-foreground">
                  روش پرداخت
                </FieldLegend>
                <FieldDescription className="text-zinc-500">
                  همهٔ تراکنش‌ها امن و رمزگذاری‌شده‌اند
                </FieldDescription>
              </RevealItem>
              <FieldGroup>
                <RevealItem>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-card-name-43j"
                      className="text-foreground"
                    >
                      نام روی کارت
                    </FieldLabel>
                    <Input
                      id="checkout-7j9-card-name-43j"
                      placeholder="علی محمدی"
                      required
                    />
                  </Field>
                </RevealItem>
                <RevealItem>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-card-number-uw1"
                      className="text-foreground"
                    >
                      شماره کارت
                    </FieldLabel>
                    <Input
                      id="checkout-7j9-card-number-uw1"
                      placeholder="۶۰۳۷-****-****-۱۲۳۴"
                      dir="ltr"
                      className="text-start"
                      required
                    />
                    <FieldDescription className="text-zinc-500">
                      شمارهٔ ۱۶ رقمی کارت را وارد کنید
                    </FieldDescription>
                  </Field>
                </RevealItem>
                <RevealItem className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-exp-month-ts6"
                      className="text-foreground"
                    >
                      ماه
                    </FieldLabel>
                    <Select>
                      <SelectTrigger id="checkout-exp-month-ts6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {months.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-exp-year-f59"
                      className="text-foreground"
                    >
                      سال
                    </FieldLabel>
                    <Select>
                      <SelectTrigger id="checkout-7j9-exp-year-f59">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {years.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-cvv"
                      className="text-foreground"
                    >
                      CVV
                    </FieldLabel>
                    <Input
                      id="checkout-7j9-cvv"
                      placeholder="۱۲۳"
                      dir="ltr"
                      className="text-start"
                      required
                    />
                  </Field>
                </RevealItem>
              </FieldGroup>
            </FieldSet>
            <RevealItem>
              <FieldSeparator />
            </RevealItem>
            <RevealItem>
              <FieldSet>
                <FieldLegend className="text-foreground">
                  آدرس صورتحساب
                </FieldLegend>
                <FieldDescription className="text-zinc-500">
                  آدرس صورتحساب مرتبط با روش پرداخت شما
                </FieldDescription>
                <FieldGroup>
                  <Field orientation="horizontal">
                    <input
                      id="checkout-7j9-same-as-shipping-wgm"
                      type="checkbox"
                      defaultChecked
                      className="size-4 shrink-0 rounded-[4px] border border-input accent-primary"
                    />
                    <FieldLabel
                      htmlFor="checkout-7j9-same-as-shipping-wgm"
                      className="font-normal text-foreground"
                    >
                      همان آدرس ارسال
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </RevealItem>
            <RevealItem>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-optional-comments"
                      className="text-foreground"
                    >
                      توضیحات
                    </FieldLabel>
                    <Textarea
                      id="checkout-7j9-optional-comments"
                      placeholder="توضیح اضافه‌ای دارید بنویسید"
                      className="resize-none"
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </RevealItem>
            <RevealItem>
              <Field orientation="horizontal">
                <Button type="submit">ثبت</Button>
                <Button
                  variant="outline"
                  type="button"
                  className="text-foreground"
                >
                  انصراف
                </Button>
              </Field>
            </RevealItem>
          </FieldGroup>
        </form>
      </DrawerReveal>
    </div>
  );
};

export const CartDemo = ({ revealOpen }: DrawerFieldContentProps = {}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => [
    ...initialCartItems,
  ]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const discount = appliedCoupon ? subtotal * COUPON_DISCOUNT_RATE : 0;
  const total = subtotal - discount;
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }),
    );
  };

  const handleApplyCoupon = () => {
    const normalizedCode = couponInput.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("کد تخفیف را وارد کنید");
      setAppliedCoupon(null);
      return;
    }

    if (normalizedCode !== COUPON_CODE) {
      setCouponError("کد تخفیف نامعتبر است");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(normalizedCode);
    setCouponError(null);
  };

  const handlePurchase = () => {};

  return (
    <div
      dir="rtl"
      lang="fa"
      className="w-full max-w-md text-start text-foreground [&_input]:text-foreground"
    >
      <DrawerReveal direction="left" open={revealOpen}>
        <div className="space-y-5">
          <RevealItem>
            <h2 className="text-base font-semibold text-foreground">
              سبد خرید شما
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {toFaDigits(itemCount)} کالا آمادهٔ تسویه
            </p>
          </RevealItem>

          <div className="space-y-3" role="list" aria-label="اقلام سبد">
            {cartItems.map((item) => (
              <RevealItem key={item.id} role="listitem">
                <div className="flex gap-3 rounded-xl border border-border p-3">
                  <div
                    aria-hidden="true"
                    className={cn(
                      "size-14 shrink-0 rounded-lg",
                      item.imageClassName,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.variant}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div
                        className="inline-flex items-center rounded-lg border border-border"
                        role="group"
                        aria-label={`تعداد ${item.name}`}
                      >
                        <button
                          type="button"
                          aria-label={`کاهش تعداد ${item.name}`}
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="flex size-7 items-center justify-center text-foreground transition-colors duration-200 ease hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span
                          className="min-w-8 px-1 text-center text-sm font-medium tabular-nums text-foreground"
                          aria-live="polite"
                        >
                          {toFaDigits(item.quantity)}
                        </span>
                        <button
                          type="button"
                          aria-label={`افزایش تعداد ${item.name}`}
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="flex size-7 items-center justify-center text-foreground transition-colors duration-200 ease hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 tabular-nums">
                        هر عدد {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>

          <RevealItem className="space-y-2 rounded-xl border border-border p-3">
            <FieldLabel htmlFor="cart-coupon-code" className="text-foreground">
              اعمال کد تخفیف
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="cart-coupon-code"
                value={couponInput}
                onChange={(event) => {
                  setCouponInput(event.target.value);
                  setCouponError(null);
                }}
                placeholder="کد را وارد کنید…"
                dir="ltr"
                className="min-w-0 flex-1 text-start"
                aria-describedby={
                  couponError
                    ? "cart-coupon-error"
                    : appliedCoupon
                      ? "cart-coupon-success"
                      : undefined
                }
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 text-foreground"
                onClick={handleApplyCoupon}
              >
                اعمال
              </Button>
            </div>
            {couponError ? (
              <p id="cart-coupon-error" className="text-xs text-destructive">
                {couponError}
              </p>
            ) : appliedCoupon ? (
              <p id="cart-coupon-success" className="text-xs text-emerald-600">
                {appliedCoupon} اعمال شد — {toFaDigits(COUPON_DISCOUNT_RATE * 100)}٪ تخفیف
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                برای ۱۰٪ تخفیف کد SAVE10 را امتحان کنید
              </p>
            )}
          </RevealItem>

          <RevealItem className="space-y-2 rounded-xl bg-muted/60 p-3 text-sm">
            <div className="flex items-center justify-between text-zinc-600">
              <span>جمع جزء</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between text-emerald-700">
                <span>تخفیف</span>
                <span className="tabular-nums">-{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-border pt-2 font-semibold text-foreground">
              <span>مبلغ کل</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
          </RevealItem>

          <RevealItem>
            <Button
              type="button"
              className="h-10 w-full"
              onClick={handlePurchase}
            >
              خرید · {formatPrice(total)}
            </Button>
          </RevealItem>
        </div>
      </DrawerReveal>
    </div>
  );
};
