import { isNewComponent } from "@/lib/open/new-components";
import { localPosterUrl, localVideoUrl } from "@/lib/browse/media-url";
import { titleFaFor } from "@/lib/browse/titles-fa";
import registry from "@/registry.json";

const LIVE_SLUGS = new Set(registry.items.map((item) => item.name));

export type BrowseItem = {
  /** Registry name, also the docs slug. */
  slug: string;
  title: string;
  /** Optional Persian label — primary in nav over English `title`. */
  titleFa?: string;
  description: string;
  category: string;
  tags?: string[];
  /** Still frame shown before/instead of the video. */
  poster: string;
  /** Unsplash fallback if the local poster is missing. */
  fallbackPoster: string;
  /** Muted loop preview from `browse-media/videos`. */
  video: string;
  isNew?: boolean;
};

/** Unsplash stills used only when a local poster fails to load. */
const POSTERS = [
  "photo-1506744038136-46273834b3fb",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1441974231531-c6227db76b6e",
  "photo-1493246507139-91e8fad9978e",
  "photo-1451187580459-43490279c0fa",
  "photo-1518837695005-2083093ee35b",
  "photo-1500530855697-b586d89ba3ee",
  "photo-1502082553048-f009c37129b9",
  "photo-1483728642387-6c3bdd6c93e5",
  "photo-1439066615861-d1af74d74000",
  "photo-1519681393784-d120267933ba",
  "photo-1497436072909-60f360e1d4b1",
].map((id) => `/unsplash/${id.replace(/^photo-/, "")}.webp`);

type Seed = { slug: string; title: string; description: string; category: string };

const SEEDS: Seed[] = [
  { slug: "3d-book", title: "3D Book", description: "Page flips with real depth.", category: "Display" },
  { slug: "animated-collection", title: "Animated Collection", description: "Items that rearrange themselves.", category: "List" },
  { slug: "animated-tabs", title: "Animated Tabs", description: "Soft indicator and animated tab panels.", category: "Navigation" },
  { slug: "bottom-menu", title: "Bottom Menu", description: "A dock that expands on demand.", category: "Navigation" },
  { slug: "date-field", title: "Date Field", description: "A field that morphs into a Jalali calendar.", category: "Input" },
  { slug: "day-picker", title: "Day Picker", description: "Dates chosen without friction.", category: "Input" },
  { slug: "delete-button", title: "Delete Button", description: "Confirmation folded into one tap.", category: "Button" },
  { slug: "discover-button", title: "Discover Button", description: "A button that opens up.", category: "Button" },
  { slug: "discrete-tabs", title: "Discrete Tabs", description: "Sliding between quiet states.", category: "Navigation" },
  { slug: "dynamic-toolbar", title: "Dynamic Toolbar", description: "Resizes around its content.", category: "Navigation" },
  { slug: "expandable-gallery", title: "Expandable Gallery", description: "Photos that grow into place.", category: "Display" },
  { slug: "feature-carousel", title: "Feature Carousel", description: "One idea at a time.", category: "Display" },
  { slug: "folder-interaction", title: "Folder Interaction", description: "Files that feel physical.", category: "Display" },
  { slug: "inline-edit", title: "Inline Edit", description: "Read and write in one field.", category: "Input" },
  { slug: "filter-interaction", title: "List Item", description: "Rows that answer the cursor.", category: "List" },
  { slug: "morphing-input", title: "Morphing Input", description: "One field, many shapes.", category: "Input" },
  { slug: "multi-step-form", title: "Multi Step Form", description: "Long forms made short.", category: "Input" },
  { slug: "pricing-card", title: "Pricing Card", description: "Hierarchy that sells itself.", category: "Display" },
  { slug: "shake-testimonial-card", title: "Shake Testimonial", description: "Praise with a pulse.", category: "Display" },
  { slug: "smooth-dropdown", title: "Smooth Dropdown", description: "A menu that does not jump.", category: "Navigation" },
  { slug: "nested-dropdown", title: "Nested Dropdown", description: "Nested menu in the filter-interaction visual language.", category: "Navigation" },
  { slug: "tooltip", title: "Tooltip", description: "Soft card labels that spring in on hover.", category: "Navigation" },
  { slug: "upload-dropzone", title: "Upload Dropzone", description: "Drag a file; watch it morph and the bar fill.", category: "Input" },
  { slug: "typed-code", title: "Typed Code", description: "Tap show code; watch it type itself softly.", category: "Display" },
  { slug: "animated-switches", title: "Animated Switches", description: "Soft, icon, and liquid switches — iOS green, equal size, spring thumbs.", category: "Input" },
  { slug: "animated-checkboxes", title: "Animated Checkboxes", description: "Soft, circle, and bounce checkboxes with a drawn tick.", category: "Input" },
  { slug: "animated-select", title: "Animated Select", description: "Spring list, sliding highlight, and a drawn green tick.", category: "Input" },
  { slug: "sortable-list", title: "Sortable List", description: "Drag the handle to reorder items with spring layout.", category: "List" },
  { slug: "animated-data-table", title: "Animated Data Table", description: "Sort, filter, and drag rows with soft layout motion.", category: "List" },
  { slug: "animated-sidebars", title: "Animated Sidebars", description: "Collapsible rail sidebar with tree submenu.", category: "Navigation" },
  { slug: "horizontal-menu", title: "Horizontal Menu", description: "Horizontal hover menu with nested side flyouts.", category: "Navigation" },
  { slug: "expandable-card", title: "Expandable Card", description: "Tap a compact card; it morphs into a large detail view.", category: "Display" },
  { slug: "save-button", title: "Status Button", description: "Idle, loading, done.", category: "Button" },
  { slug: "vertical-tabs", title: "Vertical Tabs", description: "Switching along the edge.", category: "Navigation" },
  { slug: "stacked-list", title: "Stacked List", description: "A stack that unfolds.", category: "List" },
  { slug: "bucket", title: "Bucket", description: "Chips tossed with physics.", category: "Display" },
  { slug: "fluid-expanding-grid", title: "Fluid Expanding Grid", description: "A grid that breathes.", category: "Layout" },
  { slug: "bento-card", title: "Bento Card", description: "Tabs inside a single tile.", category: "Layout" },
  { slug: "magnified-bento", title: "Magnified Bento", description: "A lens you can drag.", category: "Layout" },
  { slug: "editorial-deck", title: "Editorial Deck", description: "Swipe stories back into the stack.", category: "Display" },
  { slug: "empty-testimonial", title: "Empty Testimonial", description: "An empty state worth keeping.", category: "Display" },
  { slug: "accessible-action", title: "Accessible Action", description: "A card stack you can tilt and swipe.", category: "Display" },
  { slug: "accordionos", title: "AccordionOS", description: "Accordions with image transitions.", category: "Display" },
  { slug: "card-folder", title: "Card Folder", description: "A folder card with hover depth.", category: "Display" },
  { slug: "confidential-folder", title: "Confidential Folder", description: "A sleeve that pulls a letter out and flips it.", category: "Display" },
  { slug: "corner-video", title: "Corner Video", description: "A player that morphs from the corner.", category: "Display" },
  { slug: "focus-testimonials", title: "Focus Testimonials", description: "Hover to bring one voice forward.", category: "Display" },
  { slug: "infinite-grid", title: "Infinite Canvas", description: "An endless product canvas you can drag.", category: "Layout" },
  { slug: "polaroid-drag", title: "Polaroid Drag", description: "Photos that stack and tilt.", category: "Display" },
  { slug: "pop-tilt-cards", title: "Pop Tilt Cards", description: "A deck that pops toward the cursor.", category: "Display" },
  { slug: "rolling-card-stack", title: "Rolling Card Stack", description: "Cards that roll into place.", category: "Display" },
  { slug: "scroll-stack-deck", title: "Scroll Stack Deck", description: "Cards that stack as you scroll.", category: "Display" },
  { slug: "stack-scroll-reveal", title: "Stack Scroll Reveal", description: "Cards that peel off a stack as you scroll.", category: "Display" },
  { slug: "perspective-text-scroll", title: "Perspective Text Scroll", description: "Text that tilts through scroll perspective.", category: "Display" },
  { slug: "wheel-carousel", title: "Wheel Carousel", description: "A wheel you can spin through.", category: "Display" },
  { slug: "client-card", title: "Client Card", description: "A CRM card with paid and deadline rings.", category: "Display" },
  { slug: "coverflow-drag", title: "Coverflow Drag", description: "Portraits that coverflow as you drag.", category: "Display" },
  { slug: "overlapping-slider", title: "Overlapping Slider", description: "A landing row of portraits. The left card scales back.", category: "Display" },
  { slug: "tactile-button", title: "Tactile Button", description: "A glass rocker that tilts when you press.", category: "Button" },
  { slug: "gooey-navbar", title: "Gooey Navbar", description: "Pills that melt into each other.", category: "Navigation" },
  { slug: "dynamic-grid-gallery", title: "Dynamic Grid Gallery", description: "A grid that grows toward the cursor.", category: "Display" },
  { slug: "scroll-split-cards", title: "Scroll Split Cards", description: "A still that splits into three cards, then flips.", category: "Display" },
  { slug: "create-menu", title: "Create Menu", description: "A create pill that opens into actions.", category: "Button" },
  { slug: "liquid-index", title: "Liquid Index", description: "A feature list with a liquid hover badge.", category: "Display" },
  { slug: "photo-albums", title: "Photo Albums", description: "Album stacks that open into a grid.", category: "Display" },
  { slug: "slide-subscribe", title: "Slide Subscribe", description: "Pick a plan, then slide to start.", category: "Input" },
  { slug: "set-timer", title: "Set Timer", description: "قرصی که به چرخ دقیقه تبدیل می‌شود و بعد شمارش معکوس شروع می‌کند.", category: "Input" },
  { slug: "stacked-outline-text", title: "Stacked Outline Text", description: "Outlined type that leaves a velocity trail when you drag it.", category: "Display" },
  { slug: "drawer-buttons", title: "Drawer Buttons", description: "Buttons that fold open a payment drawer and a cart.", category: "Button" },
  { slug: "prompt-box", title: "Prompt Box", description: "A composer that expands into a prompt with a model menu.", category: "Input" },
  { slug: "get-in-touch", title: "Get In Touch", description: "A contact pill that merges you with a portrait.", category: "Button" },
  { slug: "theme-toggle", title: "Theme Toggle", description: "A dotted grip that slides across a recessed track.", category: "Button" },
  { slug: "scan-document", title: "Scan Document", description: "A button that unfolds a page and scans it.", category: "Button" },
  { slug: "stamp-approve", title: "Stamp Approve", description: "A desk stamp that presses an approve seal onto paper.", category: "Button" },
  { slug: "ticket-tear", title: "Ticket Tear", description: "A ticket that tears at the perforation when you drag.", category: "Button" },
  { slug: "dial-volume", title: "Dial Volume", description: "A metal knob with a square LED ring for volume.", category: "Button" },
  { slug: "otp-cascade", title: "OTP Cascade", description: "Six OTP cells with soft green/red verify feedback.", category: "Input" },
  { slug: "event-countdown", title: "Event Countdown", description: "Shows how much time is left until an event.", category: "Display" },
  { slug: "luck-wheel", title: "Luck Wheel", description: "Casino luck wheel with speed and soft stop.", category: "Display" },
  { slug: "prize-coins", title: "Prize Coins", description: "Open a gold gift; coins fly into a corner counter.", category: "Button" },
  { slug: "polaroid-stack", title: "Polaroid Stack", description: "Prints that fan out from a pile on hover.", category: "Display" },
  { slug: "analog-stick", title: "Analog Stick", description: "A metallic cap that tilts into the press.", category: "Button" },
  { slug: "paper-shred-button", title: "Paper Shred Button", description: "A delete button that shreds a page into strips.", category: "Button" },
  { slug: "holographic-referral-card", title: "Holographic Referral Card", description: "A dark invite card that tilts with a holographic glow.", category: "Display" },
  { slug: "curve-drawer", title: "Curve Drawer", description: "A side drawer whose inner edge morphs from a bulge to a line.", category: "Display" },
];

export const browseItems: BrowseItem[] = SEEDS.filter((seed) => LIVE_SLUGS.has(seed.slug))
  .map((seed, index) => {
    return {
      ...seed,
      titleFa: titleFaFor(seed.slug),
      poster: localPosterUrl(seed.slug),
      fallbackPoster: POSTERS[index % POSTERS.length]!,
      video: localVideoUrl(seed.slug),
      isNew: isNewComponent(seed.slug),
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

/** Local poster + video paths for a component slug. */
export function browseUploadedMedia(slug: string) {
  const item = browseItems.find((entry) => entry.slug === slug);
  return {
    poster: item?.poster ?? localPosterUrl(slug),
    video: item?.video ?? localVideoUrl(slug),
    title: item?.title ?? slug,
  };
}

export const browseCategories = [
  "All",
  ...Array.from(new Set(browseItems.map((item) => item.category))).sort(),
];
