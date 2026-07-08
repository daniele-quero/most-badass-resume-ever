import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  onTabChange?: (id: string) => void;
  swipeEnabled?: boolean;
};

export function Tabs({ items, onTabChange, swipeEnabled = false }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const groupId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touch = useRef({ startX: 0, startY: 0, isDown: false, hasMoved: false });
  const SWIPE_THRESHOLD = 50; // pixels

  if (items.length === 0) {
    return null;
  }

  const moveTo = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
    const item = items[nextIndex];
    if (item) {
      onTabChange?.(item.id);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Only consider touch/pen pointer types for swipe
    if (event.pointerType && event.pointerType !== "touch" && event.pointerType !== "pen") {
      return;
    }

    touch.current.isDown = true;
    touch.current.startX = event.clientX;
    touch.current.startY = event.clientY;
    touch.current.hasMoved = false;
    try {
      (event.target as Element).setPointerCapture?.(event.pointerId);
    } catch {}
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!touch.current.isDown) return;
    const dx = event.clientX - touch.current.startX;
    const dy = event.clientY - touch.current.startY;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      touch.current.hasMoved = true;
      // When horizontal swipe is detected, prevent the default to avoid
      // the browser stealing the gesture as a horizontal scroll.
      event.preventDefault();
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!touch.current.isDown) return;
    touch.current.isDown = false;
    const dx = event.clientX - touch.current.startX;
    const dy = event.clientY - touch.current.startY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      const nextIndex = dx < 0 ? (activeIndex + 1) % items.length : (activeIndex - 1 + items.length) % items.length;
      moveTo(nextIndex);
    }
    try {
      (event.target as Element).releasePointerCapture?.(event.pointerId);
    } catch {}
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!event.touches || event.touches.length === 0) return;
    const t = event.touches[0];
    touch.current.isDown = true;
    touch.current.startX = t.clientX;
    touch.current.startY = t.clientY;
    touch.current.hasMoved = false;
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!touch.current.isDown || !event.touches || event.touches.length === 0) return;
    const t = event.touches[0];
    const dx = t.clientX - touch.current.startX;
    const dy = t.clientY - touch.current.startY;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      touch.current.hasMoved = true;
      event.preventDefault();
    }
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!touch.current.isDown) return;
    touch.current.isDown = false;
    // Use changedTouches when available
    const t = event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : null;
    if (!t) return;
    const dx = t.clientX - touch.current.startX;
    const dy = t.clientY - touch.current.startY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      const nextIndex = dx < 0 ? (activeIndex + 1) % items.length : (activeIndex - 1 + items.length) % items.length;
      moveTo(nextIndex);
    }
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        break;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      moveTo(nextIndex);
    }
  };

  return (
    <div
      className="tabs-root"
      onPointerDown={swipeEnabled ? handlePointerDown : undefined}
      onPointerMove={swipeEnabled ? handlePointerMove : undefined}
      onPointerUp={swipeEnabled ? handlePointerUp : undefined}
      onTouchStart={swipeEnabled ? handleTouchStart : undefined}
      onTouchMove={swipeEnabled ? handleTouchMove : undefined}
      onTouchEnd={swipeEnabled ? handleTouchEnd : undefined}
    >
      <div className="tabs-list" role="tablist" aria-label="Resume sections">
        {items.map((item, index) => {
          const selected = index === activeIndex;
          const tabId = `${groupId}-tab-${item.id}`;
          const panelId = `${groupId}-panel-${item.id}`;

          return (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={tabId}
              className={`tab-trigger ${selected ? "is-active" : ""}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => moveTo(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => {
        const selected = index === activeIndex;
        const tabId = `${groupId}-tab-${item.id}`;
        const panelId = `${groupId}-panel-${item.id}`;

        return (
          <section
            key={item.id}
            id={panelId}
            className="tab-panel"
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!selected}
          >
            {item.content}
          </section>
        );
      })}
    </div>
  );
}
