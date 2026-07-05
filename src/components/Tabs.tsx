import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
};

export function Tabs({ items }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const groupId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (items.length === 0) {
    return null;
  }

  const moveTo = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
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
    <div className="tabs-root">
      <div className="tabs-list" role="tablist" aria-label="Sezioni curriculum">
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
              onClick={() => setActiveIndex(index)}
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
