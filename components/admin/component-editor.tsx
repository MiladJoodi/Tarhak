"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

import { ComponentLivePreview } from "@/components/admin/live-preview";
import { ComponentTags } from "@/components/admin/component-tags";
import { DependencyTags } from "@/components/admin/dependency-tags";
import { PreviewHint } from "@/components/open/preview-hint";
import { detectDependencies } from "@/lib/admin/detect-code";
import { generateComponentCopy } from "@/lib/admin/generate-copy";
import { extractHints } from "@/lib/open/mdx-extract";
import { normalizeTags } from "@/lib/component-tags";
import {
  DEFAULT_PREVIEW_BACKGROUNDS,
  NONE_PREVIEW_BACKGROUND,
  isPreviewBackgroundNone,
  parsePreviewBackgrounds,
  resolvePreviewBackground,
  serializePreviewBackgrounds,
} from "@/lib/open/preview-background";
import {
  PREVIEW_HINT_KINDS,
  PREVIEW_HINT_PRESETS,
  hintToneForBackground,
  parsePreviewHint,
  resolvePreviewHint,
  type PreviewHintKind,
} from "@/lib/open/preview-hint-config";
import { Index } from "@/registry/__index__";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  title: string;
  description: string;
  code: string;
  dependencies: string;
  features: string;
  tags: string[];
};

const EMPTY: FormState = {
  name: "",
  title: "",
  description: "",
  code: `"use client";

import { motion } from "motion/react";

export default function Example() {
  return (
    <motion.div className="flex flex-col items-center gap-4 p-8">
      <p className="text-lg font-medium">Hello</p>
    </motion.div>
  );
}
`,
  dependencies: "motion, clsx, tailwind-merge",
  features: "",
  tags: [],
};

export function ComponentEditor({
  mode,
  initialName,
}: {
  mode: "create" | "edit";
  initialName?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewBgLight, setPreviewBgLight] = useState<string>(DEFAULT_PREVIEW_BACKGROUNDS.light);
  const [previewBgDark, setPreviewBgDark] = useState<string>(DEFAULT_PREVIEW_BACKGROUNDS.dark);
  const [hintTop, setHintTop] = useState(80);
  const [showHint, setShowHint] = useState(false);
  const [hintKind, setHintKind] = useState<PreviewHintKind>("click");
  const [hintHeading, setHintHeading] = useState("");
  const [hintDescription, setHintDescription] = useState("");
  const [hintHideOnScroll, setHintHideOnScroll] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");
  const [previewKey, setPreviewKey] = useState(0);
  const [depsLocked, setDepsLocked] = useState(false);
  const [copyLocked, setCopyLocked] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !initialName) return;
    fetch(`/api/admin/components/${initialName}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setForm({
          name: data.item.name,
          title: data.item.title,
          description: data.item.description,
          code: data.code,
          dependencies: (data.item.dependencies || []).join(", "),
          features: data.mdx ? extractHints(data.mdx).join("\n") : "",
          tags: normalizeTags(data.controls?.tags),
        });
        setDepsLocked(true);
        setCopyLocked(true);
        const backgrounds = parsePreviewBackgrounds(data.controls?.previewBackground);
        setPreviewBgLight(backgrounds.light ?? DEFAULT_PREVIEW_BACKGROUNDS.light);
        setPreviewBgDark(backgrounds.dark ?? DEFAULT_PREVIEW_BACKGROUNDS.dark);
        const loadedHint =
          typeof data.controls?.hintTop === "number" ? data.controls.hintTop : 80;
        setHintTop(Math.min(200, Math.max(-200, Math.round(loadedHint))));
        const hint = parsePreviewHint(data.controls);
        setShowHint(hint.show);
        setHintKind(hint.kind);
        setHintHeading(hint.heading);
        setHintDescription(hint.description);
        setHintHideOnScroll(hint.hideOnScroll);
      })
      .catch((err) => setError(err.message));
  }, [mode, initialName]);

  useEffect(() => {
    if (depsLocked && mode === "edit") return;
    const timer = window.setTimeout(() => {
      const detected = detectDependencies(form.code);
      if (detected.length === 0) return;
      setForm((current) => {
        const existing = current.dependencies
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
        if (existing.length > 0 && depsLocked) return current;
        const merged = Array.from(new Set([...existing, ...detected])).sort((a, b) =>
          a.localeCompare(b),
        );
        const next = merged.join(", ");
        if (next === current.dependencies) return current;
        return { ...current, dependencies: next };
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form.code, depsLocked, mode]);

  useEffect(() => {
    if (mode !== "create" || copyLocked) return;
    const timer = window.setTimeout(() => {
      const generated = generateComponentCopy(form.code);
      setForm((current) => ({
        ...current,
        title: current.title.trim() ? current.title : generated.title,
        description: current.description.trim()
          ? current.description
          : generated.description,
        features: current.features.trim()
          ? current.features
          : generated.features.join("\n"),
      }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [form.code, mode, copyLocked]);

  const noPreviewBackground =
    isPreviewBackgroundNone(previewBgLight) &&
    isPreviewBackgroundNone(previewBgDark);

  const activePreviewBackground = useMemo(
    () =>
      resolvePreviewBackground(
        { light: previewBgLight, dark: previewBgDark },
        previewTheme,
      ),
    [previewBgLight, previewBgDark, previewTheme],
  );

  function applyGeneratedCopy(force = false) {
    const generated = generateComponentCopy(form.code);
    setForm((current) => ({
      ...current,
      title: force || !current.title.trim() ? generated.title : current.title,
      description:
        force || !current.description.trim()
          ? generated.description
          : current.description,
      features:
        force || !current.features.trim()
          ? generated.features.join("\n")
          : current.features,
    }));
    setCopyLocked(true);
    setMessage("Generated brief title, description, and features.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      ...(mode === "create" && form.name.trim() ? { name: form.name.trim() } : {}),
      title: form.title,
      description: form.description,
      code: form.code,
      dependencies: form.dependencies
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      features: form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      previewBackground: serializePreviewBackgrounds({
        light: previewBgLight,
        dark: previewBgDark,
      }),
      hintTop,
      showHint,
      hintKind,
      hintHeading,
      hintDescription,
      hintHideOnScroll,
      tags: form.tags,
    };

    const res = await fetch(
      mode === "edit" && initialName
        ? `/api/admin/components/${initialName}`
        : "/api/admin/components",
      {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }

    setMessage(`Saved ${data.name}.`);
    setForm((current) => ({ ...current, name: data.name }));
    setPreviewKey((key) => key + 1);
    setDepsLocked(true);
    setCopyLocked(true);
    router.refresh();
    if (mode === "create") {
      router.push(`/admin/${data.name}`);
    } else if (initialName && data.name !== initialName) {
      router.replace(`/admin/${data.name}`);
    }
  }


  const previewName = initialName || form.name.trim() || undefined;
  const Preview = previewName
    ? (Index[previewName]?.component as ComponentType<{ size?: string }> | undefined)
    : undefined;
  const previewHint = resolvePreviewHint({
    show: showHint,
    kind: hintKind,
    heading: hintHeading,
    description: hintDescription,
    hideOnScroll: hintHideOnScroll,
  });
  const hintTone = activePreviewBackground
    ? hintToneForBackground(activePreviewBackground)
    : previewTheme === "light"
      ? "light"
      : "dark";


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 w-fit text-muted-foreground",
            )}
          >
            <ArrowLeft data-icon="inline-start" />
            All components
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "create" ? "New component" : form.title || initialName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "create"
                ? "Paste source — copy and dependencies auto-fill. Save once to publish the live preview."
                : `Editing ${initialName}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {mode === "edit" && initialName ? (
            <Link
              href={`/docs/components/${initialName}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View open page
            </Link>
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
          </Button>
        </div>
      </div>

      {(error || message) && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            error
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
          )}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card size="sm">
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Basics</CardTitle>
                <CardDescription>Name and copy shown on browse / open.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyGeneratedCopy(true)}
              >
                <Sparkles data-icon="inline-start" />
                Generate
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => {
                      setCopyLocked(true);
                      setForm((f) => ({ ...f, title: e.target.value }));
                    }}
                  />
                </Field>
                <Field label="Slug">
                  <Input
                    placeholder="auto-from-title"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    disabled={mode === "edit"}
                  />
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => {
                    setCopyLocked(true);
                    setForm((f) => ({ ...f, description: e.target.value }));
                  }}
                />
              </Field>
              <ComponentTags
                value={form.tags}
                onChange={(tags) => setForm((f) => ({ ...f, tags }))}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
              <CardDescription>
                Auto-detected from imports. Edit to lock the list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DependencyTags
                value={form.dependencies}
                onChange={(dependencies) => {
                  setDepsLocked(true);
                  setForm((f) => ({ ...f, dependencies }));
                }}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                One perk per line — include a “Where to use” line when you can.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder={
                  "Motion-powered interactions\nAccessible keyboard support\nWhere to use: Landing pages and product demos"
                }
                value={form.features}
                onChange={(e) => {
                  setCopyLocked(true);
                  setForm((f) => ({ ...f, features: e.target.value }));
                }}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Preview backgrounds</CardTitle>
              <CardDescription>
                Light and dark colors for the open-page canvas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">No background</span>
                <input
                  type="checkbox"
                  checked={noPreviewBackground}
                  aria-label="Use the app canvas instead of a custom preview background"
                  className="size-4 accent-foreground"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreviewBgLight(NONE_PREVIEW_BACKGROUND);
                      setPreviewBgDark(NONE_PREVIEW_BACKGROUND);
                      return;
                    }
                    setPreviewBgLight(DEFAULT_PREVIEW_BACKGROUNDS.light);
                    setPreviewBgDark(DEFAULT_PREVIEW_BACKGROUNDS.dark);
                  }}
                />
              </label>
              {noPreviewBackground ? (
                <p className="text-xs text-muted-foreground">
                  Uses the app canvas behind the preview.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    label="Light"
                    value={previewBgLight}
                    fallback={DEFAULT_PREVIEW_BACKGROUNDS.light}
                    onChange={setPreviewBgLight}
                  />
                  <ColorField
                    label="Dark"
                    value={previewBgDark}
                    fallback={DEFAULT_PREVIEW_BACKGROUNDS.dark}
                    onChange={setPreviewBgDark}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Preview hint</CardTitle>
              <CardDescription>
                Overlay on the live preview and open page. Off by default.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Show hint</span>
                <input
                  type="checkbox"
                  checked={showHint}
                  aria-label="Show preview hint"
                  className="size-4 accent-foreground"
                  onChange={(e) => setShowHint(e.target.checked)}
                />
              </label>
              {showHint ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Hint</Label>
                    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
                      {PREVIEW_HINT_KINDS.map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                            hintKind === kind
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          onClick={() => setHintKind(kind)}
                        >
                          {kind === "custom" ? "Custom" : PREVIEW_HINT_PRESETS[kind].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hintKind === "custom" ? (
                    <div className="grid gap-3">
                      <Field label="Heading">
                        <Input
                          value={hintHeading}
                          placeholder="Click"
                          onChange={(e) => setHintHeading(e.target.value)}
                        />
                      </Field>
                      <Field label="Description">
                        <Textarea
                          rows={2}
                          value={hintDescription}
                          placeholder="برای امتحان کلیک کن"
                          onChange={(e) => setHintDescription(e.target.value)}
                        />
                      </Field>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {PREVIEW_HINT_PRESETS[hintKind].heading}
                      {" — "}
                      {PREVIEW_HINT_PRESETS[hintKind].description}
                    </p>
                  )}
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">Hide when scrolling</span>
                    <input
                      type="checkbox"
                      checked={hintHideOnScroll}
                      aria-label="Hide hint when scrolling"
                      className="size-4 accent-foreground"
                      onChange={(e) => setHintHideOnScroll(e.target.checked)}
                    />
                  </label>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs text-muted-foreground">Hint top</Label>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {hintTop}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-200}
                      max={200}
                      step={1}
                      value={hintTop}
                      aria-label="Preview hint top offset"
                      className="h-8 w-full cursor-pointer accent-foreground"
                      onChange={(e) => setHintTop(Number(e.target.value))}
                    />
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Source</CardTitle>
              <CardDescription>Component TSX written to the registry on save.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                required
                rows={18}
                spellCheck={false}
                className="min-h-[280px] font-mono text-xs leading-relaxed md:text-xs"
                value={form.code}
                onChange={(e) => {
                  setDepsLocked(false);
                  if (mode === "create") setCopyLocked(false);
                  setForm((f) => ({ ...f, code: e.target.value }));
                }}
              />
            </CardContent>
          </Card>

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-sm backdrop-blur">
            <p className="text-xs text-muted-foreground">
              {mode === "create" ? "Creates files + MDX locally." : "Writes files in place."}
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:max-h-[calc(100vh-5.5rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
          <ComponentLivePreview code={form.code} />

          <Card size="sm" className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Live preview</CardTitle>
                <CardDescription>Published registry component after save.</CardDescription>
              </div>
              <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
                {(["light", "dark"] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                      previewTheme === theme
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setPreviewTheme(theme)}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </CardHeader>
            <Separator />
            <div
              className={cn(
                "component-showcase flex min-h-[min(52vh,480px)] items-center justify-center overflow-hidden text-foreground",
                previewTheme === "dark" ? "dark" : "light",
                !activePreviewBackground && "bg-muted",
              )}
              style={
                {
                  ...(activePreviewBackground
                    ? { background: activePreviewBackground }
                    : {}),
                  "--preview-hint-top": `${hintTop}px`,
                } as CSSProperties
              }
            >
              {Preview ? (
                <Suspense
                  fallback={
                    <div className="flex size-24 items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  {previewHint ? (
                    <PreviewHint
                      heading={previewHint.heading}
                      description={previewHint.description}
                      tone={hintTone}
                      hideOnScroll={previewHint.hideOnScroll}
                      className="w-full self-stretch"
                    >
                      <div
                        key={previewKey}
                        className="flex h-full w-full items-center justify-center p-4"
                      >
                        <Preview size="lg" />
                      </div>
                    </PreviewHint>
                  ) : (
                    <div
                      key={previewKey}
                      className="flex h-full w-full items-center justify-center p-4"
                    >
                      <Preview size="lg" />
                    </div>
                  )}
                </Suspense>
              ) : (
                <p className="max-w-sm px-6 text-center text-sm text-muted-foreground">
                  Paste code and save once. The live preview appears here after publish.
                </p>
              )}
            </div>
          </Card>

        </div>
      </div>
    </form>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} preview background`}
          className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-card p-0.5"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          className="font-mono text-xs"
          placeholder={fallback}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
