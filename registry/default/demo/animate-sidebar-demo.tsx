"use client";

import * as React from "react";
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/registry/default/example/animate-sidebar";

const DATA = {
  user: {
    name: "سارا محمدی",
    email: "sara@example.com",
    avatar: "/unsplash/1522075469751-3a6694fb2f61.webp",
    initials: "سم",
  },
  teams: [
    { name: "استودیو طرحک", logo: GalleryVerticalEnd, plan: "سازمانی" },
    { name: "کارگاه نور", logo: AudioWaveform, plan: "استارتاپ" },
    { name: "تیم آزاد", logo: Command, plan: "رایگان" },
  ],
  navMain: [
    {
      title: "میزکار",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "تاریخچه", url: "#" },
        { title: "نشان‌شده‌ها", url: "#" },
        { title: "تنظیمات میزکار", url: "#" },
      ],
    },
    {
      title: "مدل‌ها",
      url: "#",
      icon: Bot,
      items: [
        { title: "جنسیس", url: "#" },
        { title: "کاوشگر", url: "#" },
        { title: "کوانتوم", url: "#" },
      ],
    },
    {
      title: "مستندات",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "مقدمه", url: "#" },
        { title: "شروع سریع", url: "#" },
        { title: "آموزش‌ها", url: "#" },
        { title: "تغییرات", url: "#" },
      ],
    },
    {
      title: "تنظیمات",
      url: "#",
      icon: Settings2,
      items: [
        { title: "عمومی", url: "#" },
        { title: "تیم", url: "#" },
        { title: "صورتحساب", url: "#" },
        { title: "محدودیت‌ها", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "طراحی محصول", url: "#", icon: Frame },
    { name: "فروش و بازاریابی", url: "#", icon: PieChart },
    { name: "سفر", url: "#", icon: Map },
  ],
};

export default function AnimateSidebarDemo() {
  const isMobile = useIsMobile() === true;
  const [activeTeam, setActiveTeam] = React.useState(DATA.teams[0]!);
  const [openNav, setOpenNav] = React.useState<string | null>(
    DATA.navMain.find((item) => item.isActive)?.title ?? null,
  );

  return (
    <div className="h-full min-h-[520px] w-full overflow-hidden">
    <SidebarProvider className="min-h-full">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground h-12 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <activeTeam.logo className="size-4" />
                  </div>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeTeam.name}
                    </span>
                    <span className="truncate text-xs">{activeTeam.plan}</span>
                  </div>
                  <ChevronsUpDown className="ms-auto size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  align="start"
                  side={isMobile ? "bottom" : "left"}
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    تیم‌ها
                  </DropdownMenuLabel>
                  {DATA.teams.map((team, index) => (
                    <DropdownMenuItem
                      key={team.name}
                      onClick={() => setActiveTeam(team)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <team.logo className="size-4 shrink-0" />
                      </div>
                      {team.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      افزودن تیم
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>پلتفرم</SidebarGroupLabel>
            <SidebarMenu>
              {DATA.navMain.map((item) => {
                const open = openNav === item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={open}
                      onClick={() =>
                        setOpenNav((current) =>
                          current === item.title ? null : item.title,
                        )
                      }
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronLeft
                        className={[
                          "ms-auto transition-transform duration-300",
                          open ? "-rotate-90" : "",
                        ].join(" ")}
                      />
                    </SidebarMenuButton>
                    {open && (
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton href={subItem.url}>
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>پروژه‌ها</SidebarGroupLabel>
            <SidebarMenu>
              {DATA.projects.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 end-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden focus-visible:ring-2 md:opacity-0 group-hover/menu-item:opacity-100 data-[popup-open]:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">بیشتر</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "left"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem>
                        <Folder className="text-muted-foreground" />
                        <span>مشاهده پروژه</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Forward className="text-muted-foreground" />
                        <span>اشتراک‌گذاری</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash2 className="text-muted-foreground" />
                        <span>حذف پروژه</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal className="text-sidebar-foreground/70" />
                  <span>بیشتر</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground h-12 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!"
                >
                  <img
                    src={DATA.user.avatar}
                    alt=""
                    className="size-8 rounded-lg object-cover"
                  />
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {DATA.user.name}
                    </span>
                    <span className="truncate text-xs" dir="ltr">
                      {DATA.user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ms-auto size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "left"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                      <img
                        src={DATA.user.avatar}
                        alt=""
                        className="size-8 rounded-lg object-cover"
                      />
                      <div className="grid flex-1 text-start text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {DATA.user.name}
                        </span>
                        <span className="truncate text-xs" dir="ltr">
                          {DATA.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Sparkles />
                      ارتقا به حرفه‌ای
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck />
                      حساب کاربری
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard />
                      صورتحساب
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell />
                      اعلان‌ها
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-me-1" />
            <Separator orientation="vertical" className="ms-2 h-4" />
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="hidden md:inline">ساخت اپلیکیشن</span>
              <span className="hidden md:inline">/</span>
              <span className="font-medium text-foreground">واکشی داده</span>
            </nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[240px] flex-1 rounded-xl bg-muted/50" />
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
