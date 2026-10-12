/**
 * Story-style browse collections — curated slug lists for product browsing.
 * Only slugs that exist in the live registry will show after intersection with browseItems.
 */
export type BrowseCollection = {
  id: string;
  titleFa: string;
  slugs: readonly string[];
};

export const BROWSE_COLLECTIONS: readonly BrowseCollection[] = [
  {
    id: "forms",
    titleFa: "فرم و ورودی",
    slugs: [
      "signup-form",
      "multi-step-form",
      "date-field",
      "jalali-wheel-picker",
      "day-picker",
      "animated-select",
      "glide-select",
      "morphing-input",
      "inline-edit",
      "otp-cascade",
      "file-upload-progress",
      "upload-dropzone",
      "approval-card",
      "animated-switches",
      "animated-checkboxes",
      "peek-rating",
    ],
  },
  {
    id: "navigation",
    titleFa: "ناوبری",
    slugs: [
      "command-palette",
      "animate-tabs",
      "animated-tabs",
      "morphing-tabs",
      "discrete-tabs",
      "vertical-tabs",
      "bottom-menu",
      "bloom-menu",
      "create-menu",
      "nested-dropdown",
      "smooth-dropdown",
      "horizontal-menu",
      "animated-sidebars",
      "animate-sidebar",
      "gooey-navbar",
      "dynamic-toolbar",
      "expandable-action-bar",
      "kanban-board",
    ],
  },
  {
    id: "dashboard",
    titleFa: "دشبورد",
    slugs: [
      "animated-bar-chart",
      "animated-donut-chart",
      "animated-line-chart",
      "animated-spark-chart",
      "animated-data-table",
      "number-ticker",
      "todo-list",
      "loading-states",
      "status-mark",
      "client-card",
      "toast-stack",
      "slosh-gauge",
      "set-timer",
      "event-countdown",
    ],
  },
  {
    id: "lists",
    titleFa: "لیست و ردیف",
    slugs: [
      "sortable-list",
      "swipe-row",
      "swipeable-list",
      "undo-delete",
      "stacked-list",
      "filter-interaction",
      "animated-collection",
      "liquid-index",
    ],
  },
  {
    id: "marketing",
    titleFa: "مارکتینگ",
    slugs: [
      "pricing-card",
      "feature-carousel",
      "team-carousel",
      "bounce-cards",
      "holographic-referral-card",
      "spotlight-card",
      "empty-testimonial",
      "focus-testimonials",
      "shake-testimonial-card",
      "expandable-card",
      "profile-card",
      "slide-subscribe",
      "get-in-touch",
      "wheel-carousel",
    ],
  },
  {
    id: "motion",
    titleFa: "حرکت و میکرو",
    slugs: [
      "lanyard",
      "lanyard-badge",
      "luck-wheel",
      "pulse-heart",
      "voice-orb",
      "ticket-tear",
      "stamp-approve",
      "comet-dial",
      "dial-volume",
      "analog-stick",
      "prize-coins",
      "tactile-button",
      "paper-shred-button",
      "delete-button",
      "save-button",
      "theme-toggle",
    ],
  },
] as const;

export function browseCollectionById(id: string) {
  return BROWSE_COLLECTIONS.find((c) => c.id === id) ?? null;
}
