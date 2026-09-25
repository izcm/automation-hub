"use client";

import { useCallback, useRef, useState } from "react";

// min gap kept between the floating element and the edge it's clamped to
const EDGE_MARGIN = 8;

type Bounds = { top: number; right: number; bottom: number; left: number };

// the visible area `el` can actually paint into: the viewport, narrowed by
// every ancestor that clips its overflow (e.g. the app's `overflow-auto`
// <main>). Uses clientWidth/clientHeight, so scrollbars don't count as room.
function getVisibleBounds(el: HTMLElement): Bounds {
  const root = document.documentElement;
  const bounds: Bounds = {
    top: 0,
    left: 0,
    right: root.clientWidth,
    bottom: root.clientHeight,
  };

  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    if (overflowX === "visible" && overflowY === "visible") continue;

    const rect = node.getBoundingClientRect();
    const left = rect.left + node.clientLeft;
    const top = rect.top + node.clientTop;

    bounds.left = Math.max(bounds.left, left);
    bounds.top = Math.max(bounds.top, top);
    bounds.right = Math.min(bounds.right, left + node.clientWidth);
    bounds.bottom = Math.min(bounds.bottom, top + node.clientHeight);
  }

  return bounds;
}

// keeps an absolutely positioned floating element (popover, tooltip)
// inside the visible area. The element is expected to sit under its anchor,
// pinned to the anchor's left edge (align "left") or right edge ("right").
//
// - placement: "bottom" by default; "top" only if it doesn't fit below and
//   there's more room above.
// - shiftX: px to nudge it horizontally back inside — apply as marginLeft
//   (not transform, so it doesn't fight enter animations).
//
// Call `fit()` right before the element shows (layout effect on open, or
// on hover/focus). Measures against the anchor, not the content's current
// rect, so a previous placement/shift never skews the result.
export function useFitToViewport<
  A extends HTMLElement = HTMLElement,
  C extends HTMLElement = HTMLElement,
>(align: "left" | "right" = "left") {
  const anchorRef = useRef<A>(null);
  const contentRef = useRef<C>(null);

  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const [shiftX, setShiftX] = useState(0);

  const fit = useCallback(() => {
    const anchor = anchorRef.current;
    const content = contentRef.current;
    if (!anchor || !content) return;

    const bounds = getVisibleBounds(anchor);
    const trigger = anchor.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = content;

    const spaceBelow = bounds.bottom - trigger.bottom - EDGE_MARGIN;
    const spaceAbove = trigger.top - bounds.top - EDGE_MARGIN;
    setPlacement(
      height > spaceBelow && spaceAbove > spaceBelow ? "top" : "bottom",
    );

    // where it would sit with no shift applied
    const left = align === "right" ? trigger.right - width : trigger.left;
    const minLeft = bounds.left + EDGE_MARGIN;
    const maxLeft = bounds.right - EDGE_MARGIN - width;
    setShiftX(Math.max(minLeft, Math.min(left, maxLeft)) - left);
  }, [align]);

  return { anchorRef, contentRef, placement, shiftX, fit };
}
