import Link from "next/link";

import { FeedbackIcon, PlusIcon } from "./icons";

const FEEDBACK_URL = "https://github.com/iurvish/uselayouts/issues/new";

/** Figma 1:79 — the sponsor slot and feedback button that float over the
 *  browse panel in both canvas and grid view. Rendered outside the scroller
 *  so the grid view cannot scroll them away. */
export function BrowseFloatingActions() {
  return (
    <div className="pointer-events-none absolute right-2.5 bottom-2.5 z-10 flex flex-col items-end justify-center gap-2">
      {/* Figma 1:80 */}
      <div className="pointer-events-auto flex w-[286px] flex-col items-start overflow-hidden rounded-2xl border-[0.6px] border-border bg-[#26262b] shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.04),0px_2px_4px_-4px_rgba(0,0,0,0.16),0px_4px_8px_-10px_rgba(0,0,0,0.08)]">
        <div className="flex w-full items-center border-b-[0.6px] border-border p-2.5 text-base text-white">
          Sponsor Slot
        </div>
        <div className="w-full px-2.5 py-3">
          {/* Figma 1:85 — the dashed placement a sponsor would take. */}
          <Link
            href="/sponsor"
            aria-label="Sponsor useLayouts and add your logo here"
            className="flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[10px] border border-dashed border-[#4e4e55] p-3 text-sm uppercase text-white transition-colors duration-150 ease-out hover:border-[#6b6b73] hover:bg-white/3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <PlusIcon className="size-4 shrink-0" />
            <span>Add your logo Here</span>
          </Link>
        </div>
      </div>

      {/* Figma 1:90 — same raised fill as the dock's pause control. */}
      <a
        href={FEEDBACK_URL}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto relative flex items-center gap-2 overflow-hidden rounded-[14px] bg-secondary px-4 py-2.5 text-base text-white shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.1)] transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b from-transparent to-black/6 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)]"
        />
        <FeedbackIcon className="relative size-[18px] shrink-0" />
        <span className="relative">Suggest Feedback</span>
      </a>
    </div>
  );
}
