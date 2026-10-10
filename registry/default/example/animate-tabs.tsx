"use client";
// Adapted from animate-ui.com/docs/components/animate/tabs (demo-components-animate-tabs)
// Visual language: Estedad + filter-interaction tokens.

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
  TabsContent as TabsContentPrimitive,
  TabsContents as TabsContentsPrimitive,
  TabsHighlight as TabsHighlightPrimitive,
  TabsHighlightItem as TabsHighlightItemPrimitive,
  type TabsProps as TabsPrimitiveProps,
  type TabsListProps as TabsListPrimitiveProps,
  type TabsTriggerProps as TabsTriggerPrimitiveProps,
  type TabsContentProps as TabsContentPrimitiveProps,
  type TabsContentsProps as TabsContentsPrimitiveProps,
} from "./animate-tabs-core";

export type TabsProps = TabsPrimitiveProps;
export type TabsListProps = TabsListPrimitiveProps;
export type TabsTriggerProps = TabsTriggerPrimitiveProps;
export type TabsContentsProps = TabsContentsPrimitiveProps;
export type TabsContentProps = TabsContentPrimitiveProps;

export function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsHighlightPrimitive className="absolute inset-0 z-0 rounded-md border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30">
      <TabsListPrimitive
        className={cn(
          "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
          className,
        )}
        {...props}
      />
    </TabsHighlightPrimitive>
  );
}

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsHighlightItemPrimitive value={props.value} className="flex-1">
      <TabsTriggerPrimitive
        className={cn(
          "inline-flex h-[calc(100%-1px)] w-full flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-500 ease-in-out",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
          "data-[state=active]:text-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      />
    </TabsHighlightItemPrimitive>
  );
}

export function TabsContents(props: TabsContentsProps) {
  return <TabsContentsPrimitive {...props} />;
}

export function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsContentPrimitive
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

/** پیش‌نمایش فارسی — استایل demo-components-animate-tabs با Estedad. */
export default function AnimateTabsDemo() {
  return (
    <section
      dir="rtl"
      lang="fa"
      className="flex w-full items-center justify-center fill-muted-foreground/70 bg-transparent px-4 py-10 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account" className="text-base">
              حساب
            </TabsTrigger>
            <TabsTrigger value="password" className="text-base">
              رمز عبور
            </TabsTrigger>
          </TabsList>
          <Card className="py-0 shadow-none">
            <TabsContents className="py-6">
              <TabsContent value="account" className="flex flex-col gap-6">
                <CardHeader>
                  <CardTitle className="text-base">حساب</CardTitle>
                  <CardDescription className="text-sm">
                    تغییرات حساب را اینجا اعمال کنید. وقتی تمام شد ذخیره را
                    بزنید.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-name" className="text-sm">
                      نام
                    </Label>
                    <Input
                      id="tabs-demo-name"
                      defaultValue="میلاد جودی"
                      className="font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]">
                    ذخیره تغییرات
                  </Button>
                </CardFooter>
              </TabsContent>
              <TabsContent value="password" className="flex flex-col gap-6">
                <CardHeader>
                  <CardTitle className="text-base">رمز عبور</CardTitle>
                  <CardDescription className="text-sm">
                    رمز را اینجا عوض کنید. بعد از ذخیره از حساب خارج می‌شوید.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-current" className="text-sm">
                      رمز فعلی
                    </Label>
                    <Input
                      id="tabs-demo-current"
                      type="password"
                      className="font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-new" className="text-sm">
                      رمز جدید
                    </Label>
                    <Input
                      id="tabs-demo-new"
                      type="password"
                      className="font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]">
                    ذخیره رمز
                  </Button>
                </CardFooter>
              </TabsContent>
            </TabsContents>
          </Card>
        </Tabs>
      </div>
    </section>
  );
}
