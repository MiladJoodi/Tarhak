"use client";
// Adapted from animate-ui.com/docs/components/radix/sidebar (MIT)
// Persian RTL: default side=right, logical spacing, fa chrome.

import * as React from 'react';
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
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
  PanelRightIcon,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, type Transition } from "motion/react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Highlight,
  HighlightItem,
} from "./animate-sidebar-highlight";
import { getStrictContext } from "./animate-sidebar-context";

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  /** Nested demo frames: keep the rail visible (no Sheet / no md: hide). */
  disableMobile: boolean;
  toggleSidebar: () => void;
};

const [LocalSidebarProvider, useSidebar] =
  getStrictContext<SidebarContextProps>('SidebarContext');

type SidebarProviderProps = React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Skip Sheet + viewport breakpoints. Use inside docs/browse demo frames
   * so the sidebar stays visible on phone widths.
   */
  disableMobile?: boolean;
};

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  disableMobile = false,
  className,
  style,
  children,
  dir = "rtl",
  lang = "fa",
  ...props
}: SidebarProviderProps) {
  const measuredMobile = useIsMobile() === true;
  const isMobile = !disableMobile && measuredMobile;
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      disableMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [
      state,
      open,
      setOpen,
      isMobile,
      disableMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    ],
  );

  return (
    <LocalSidebarProvider value={contextValue}>
      <TooltipProvider delay={0}>
        <div
          data-slot="sidebar-wrapper"
          dir={dir}
          lang={lang}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex h-full min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </LocalSidebarProvider>
  );
}

type SidebarProps = React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  /** `absolute` keeps the rail inside a relative demo frame instead of the viewport. */
  position?: "fixed" | "absolute";
  containerClassName?: string;
  animateOnHover?: boolean;
  transition?: Transition;
};

function Sidebar({
  side = "right",
  variant = "sidebar",
  collapsible = "offcanvas",
  position = "fixed",
  className,
  children,
  animateOnHover = true,
  containerClassName,
  transition = { type: "spring", stiffness: 350, damping: 35 },
  ...props
}: SidebarProps) {
  const { isMobile, disableMobile, state, openMobile, setOpenMobile } =
    useSidebar();

  if (collapsible === 'none') {
    return (
      <Highlight
        enabled={animateOnHover}
        hover
        controlledItems
        mode="parent"
        containerClassName={containerClassName}
        transition={transition}
      >
        <div
          data-slot="sidebar"
          className={cn(
            'bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </Highlight>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          showCloseButton={false}
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>نوار کناری</SheetTitle>
            <SheetDescription>نوار کناری موبایل</SheetDescription>
          </SheetHeader>
          <Highlight
            enabled={animateOnHover}
            hover
            controlledItems
            mode="parent"
            containerClassName={cn('h-full', containerClassName)}
            transition={transition}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </Highlight>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "group peer text-sidebar-foreground",
        disableMobile ? "block" : "hidden md:block",
      )}
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-400 ease-[cubic-bezier(0.7,-0.15,0.25,1.15)]',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "inset-y-0 z-10 w-(--sidebar-width) transition-[left,right,width] duration-400 ease-[cubic-bezier(0.75,0,0.25,1)]",
          disableMobile ? "flex" : "hidden md:flex",
          position === "absolute" ? "absolute h-full" : "fixed h-svh",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <Highlight
          containerClassName={cn('size-full', containerClassName)}
          enabled={animateOnHover}
          hover
          controlledItems
          mode="parent"
          forceUpdateBounds
          transition={transition}
        >
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
          >
            {children}
          </div>
        </Highlight>
      </div>
    </div>
  );
}

type SidebarTriggerProps = React.ComponentProps<typeof Button>;

function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('size-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelRightIcon />
      <span className="sr-only">باز و بسته کردن نوار کناری</span>
    </Button>
  );
}

type SidebarRailProps = React.ComponentProps<'button'>;

function SidebarRail({ className, ...props }: SidebarRailProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="باز و بسته کردن نوار کناری"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="باز و بسته کردن نوار کناری"
      className={cn(
        'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className,
      )}
      {...props}
    />
  );
}

type SidebarInsetProps = React.ComponentProps<'main'>;

function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'bg-background relative flex w-full flex-1 flex-col',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2',
        className,
      )}
      {...props}
    />
  );
}

type SidebarInputProps = React.ComponentProps<typeof Input>;

function SidebarInput({ className, ...props }: SidebarInputProps) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('bg-background h-8 w-full shadow-none', className)}
      {...props}
    />
  );
}

type SidebarHeaderProps = React.ComponentProps<'div'>;

function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

type SidebarFooterProps = React.ComponentProps<'div'>;

function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

type SidebarSeparatorProps = React.ComponentProps<typeof Separator>;

function SidebarSeparator({ className, ...props }: SidebarSeparatorProps) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('bg-sidebar-border mx-2 w-auto', className)}
      {...props}
    />
  );
}

type SidebarContentProps = React.ComponentProps<'div'>;

function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

type SidebarGroupProps = React.ComponentProps<'div'>;

function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
}

type SidebarGroupLabelProps = React.ComponentProps<'div'> & {
  asChild?: boolean;
};

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: SidebarGroupLabelProps) {
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-300 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

type SidebarGroupActionProps = React.ComponentProps<'button'> & {
  asChild?: boolean;
};

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: SidebarGroupActionProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 end-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

type SidebarGroupContentProps = React.ComponentProps<'div'>;

function SidebarGroupContent({
  className,
  ...props
}: SidebarGroupContentProps) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
}

type SidebarMenuProps = React.ComponentProps<'ul'>;

function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

type SidebarMenuItemProps = React.ComponentProps<'li'>;

function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonActiveVariants = cva(
  'bg-sidebar-accent text-sidebar-accent-foreground rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-sidebar-accent text-sidebar-accent-foreground',
        outline:
          'bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] [&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pe-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&:not([data-highlight])]:data-[state=open]:hover:bg-sidebar-accent [&:not([data-highlight])]:data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          '[&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] [&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground [&:not([data-highlight])]:hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type SidebarMenuButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>;

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state } = useSidebar();
  const tip =
    typeof tooltip === "string" ? { children: tooltip } : tooltip;

  const shared = {
    "data-slot": "sidebar-menu-button" as const,
    "data-sidebar": "menu-button" as const,
    "data-size": size,
    "data-active": isActive,
    className: cn(sidebarMenuButtonVariants({ variant, size }), className),
  };

  if (!tip) {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <HighlightItem
        activeClassName={sidebarMenuButtonActiveVariants({ variant })}
      >
        <Comp {...shared} {...props} />
      </HighlightItem>
    );
  }

  return (
    <Tooltip>
      <HighlightItem
        activeClassName={sidebarMenuButtonActiveVariants({ variant })}
      >
        <TooltipTrigger {...shared} {...props} />
      </HighlightItem>
      <TooltipContent
        side="left"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tip}
      />
    </Tooltip>
  );
}

type SidebarMenuActionProps = React.ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
};

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: SidebarMenuActionProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        // Increases the hit area of the button on mobile.
        'z-[1] text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 end-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'after:absolute after:-inset-2 md:after:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

type SidebarMenuBadgeProps = React.ComponentProps<'div'>;

function SidebarMenuBadge({ className, ...props }: SidebarMenuBadgeProps) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'text-sidebar-foreground pointer-events-none absolute end-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none',
        'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

type SidebarMenuSkeletonProps = React.ComponentProps<'div'> & {
  showIcon?: boolean;
};

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: SidebarMenuSkeletonProps) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

type SidebarMenuSubProps = React.ComponentProps<'ul'>;

function SidebarMenuSub({ className, ...props }: SidebarMenuSubProps) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'border-sidebar-border mx-3.5 flex min-w-0 flex-col gap-1 border-s px-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

type SidebarMenuSubItemProps = React.ComponentProps<'li'>;

function SidebarMenuSubItem({ className, ...props }: SidebarMenuSubItemProps) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  );
}

type SidebarMenuSubButtonProps = React.ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md';
  isActive?: boolean;
};

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: SidebarMenuSubButtonProps) {
  const Comp = asChild ? Slot.Root : 'a';

  return (
    <HighlightItem activeClassName="bg-sidebar-accent text-sidebar-accent-foreground rounded-md">
      <Comp
        data-slot="sidebar-menu-sub-button"
        data-sidebar="menu-sub-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          'text-sidebar-foreground ring-sidebar-ring [&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
          'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          'group-data-[collapsible=icon]:hidden',
          className,
        )}
        {...props}
      />
    </HighlightItem>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

const DEMO_DATA = {
  user: {
    name: "سارا محمدی",
    email: "sara@example.com",
    avatar: "/unsplash/1522075469751-3a6694fb2f61.webp",
  },
  teams: [
    { name: "استودیو طرحک", logo: GalleryVerticalEnd, plan: "سازمانی" },
    { name: "کارگاه نور", logo: AudioWaveform, plan: "استارتاپ" },
    { name: "تیم آزاد", logo: Command, plan: "رایگان" },
  ],
  navMain: [
    {
      title: "میزکار",
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
      icon: Bot,
      items: [
        { title: "جنسیس", url: "#" },
        { title: "کاوشگر", url: "#" },
        { title: "کوانتوم", url: "#" },
      ],
    },
    {
      title: "مستندات",
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

const subSpring = {
  height: { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.85 },
  opacity: { duration: 0.18 },
};

export type AnimateSidebarProps = {
  className?: string;
  /** Absolute rail for nested frames; fixed for full-page apps. */
  position?: "fixed" | "absolute";
  /**
   * Keep the rail in-frame on narrow viewports (no Sheet).
   * Defaults to true when `position="absolute"` (docs/browse demos).
   */
  disableMobile?: boolean;
};

/** Persian RTL sidebar shell with hover highlight and soft submenu spring. */
export default function AnimateSidebar({
  className,
  position = "absolute",
  disableMobile = position === "absolute",
}: AnimateSidebarProps) {
  const measuredMobile = useIsMobile() === true;
  const isMobile = !disableMobile && measuredMobile;
  const [activeTeam, setActiveTeam] = React.useState(DEMO_DATA.teams[0]!);
  const [openNav, setOpenNav] = React.useState<string | null>(
    DEMO_DATA.navMain.find((item) => item.isActive)?.title ?? null,
  );

  return (
    <div
      dir="rtl"
      lang="fa"
      className={cn(
        "relative isolate h-full min-h-0 w-full overflow-hidden bg-background",
        // Full-page shells still need a readable minimum when height is auto.
        position === "fixed" && "min-h-[420px]",
        className,
      )}
    >
      <SidebarProvider
        className="h-full min-h-0"
        disableMobile={disableMobile}
      >
        <Sidebar collapsible="icon" position={position} side="right">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="peer/menu-button flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <activeTeam.logo className="size-4" />
                    </div>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-semibold">{activeTeam.name}</span>
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
                    {DEMO_DATA.teams.map((team, index) => (
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
                      <div className="font-medium text-muted-foreground">افزودن تیم</div>
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
                {DEMO_DATA.navMain.map((item) => {
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
                          className={cn(
                            "ms-auto transition-transform duration-300 ease-out",
                            open && "-rotate-90",
                          )}
                        />
                      </SidebarMenuButton>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            key={`${item.title}-sub`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={subSpring}
                            className="overflow-hidden"
                          >
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>پروژه‌ها</SidebarGroupLabel>
              <SidebarMenu>
                {DEMO_DATA.projects.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                      </a>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 end-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden focus-visible:ring-2 md:opacity-0 group-hover/menu-item:opacity-100 data-popup-open:opacity-100">
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
                  <DropdownMenuTrigger className="peer/menu-button flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!">
                    <img
                      src={DEMO_DATA.user.avatar}
                      alt=""
                      className="size-8 rounded-lg object-cover"
                    />
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-semibold">{DEMO_DATA.user.name}</span>
                      <span className="truncate text-xs" dir="ltr">
                        {DEMO_DATA.user.email}
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
                          src={DEMO_DATA.user.avatar}
                          alt=""
                          className="size-8 rounded-lg object-cover"
                        />
                        <div className="grid flex-1 text-start text-sm leading-tight">
                          <span className="truncate font-semibold">{DEMO_DATA.user.name}</span>
                          <span className="truncate text-xs" dir="ltr">
                            {DEMO_DATA.user.email}
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
            <div className="min-h-60 flex-1 rounded-xl bg-muted/50" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

