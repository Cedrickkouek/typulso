"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown } from "lucide-react";

type OptionProps = { value: string | number; children: ReactNode; disabled?: boolean };
function textContent(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child)
        ? textContent(child.props.children)
        : String(child),
    )
    .join("");
}

export function Select({
  id,
  value,
  onValueChange,
  children,
  disabled = false,
  name,
  required = false,
}: {
  id: string;
  value: string | number;
  onValueChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}) {
  const options = Children.toArray(children)
    .filter((child) => isValidElement<OptionProps>(child))
    .map((child) => {
      const props = (child as React.ReactElement<OptionProps>).props;
      return {
        value: String(props.value),
        label: props.children,
        text: textContent(props.children),
        disabled: props.disabled,
      };
    });
  const selected = options.findIndex((option) => option.value === String(value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const search = useRef({ value: "", time: 0 });
  const enabled = options
    .map((option, index) => (!option.disabled ? index : -1))
    .filter((index) => index >= 0);

  function expand(index = selected >= 0 ? selected : (enabled[0] ?? 0)) {
    if (disabled || enabled.length === 0) return;
    const rect = trigger.current!.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 16;
    const above = rect.top - 16;
    const desired = Math.min(280, options.length * 48 + 16);
    const upward = below < desired && above > below;
    const height = Math.min(desired, upward ? above : below);
    setPosition({
      top: upward ? rect.top - height - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(48, height),
    });
    setActive(index);
    setOpen(true);
  }
  function choose(index: number) {
    const option = options[index];
    if (option && !option.disabled) onValueChange(option.value);
    setOpen(false);
  }
  useEffect(() => {
    const element = popup.current;
    if (!open || !element) return;
    element.showPopover();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function close(event: Event) {
      if (event.type === "scroll" && popup.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      element.hidePopover();
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);
  useEffect(() => {
    if (open)
      popup.current
        ?.querySelector(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;
    if (key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (key === "Tab") {
      if (open) choose(active);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(key)) {
      event.preventDefault();
      if (key === "Enter" || key === " ") {
        if (open) choose(active);
        else expand();
        return;
      }
      const next =
        key === "Home"
          ? enabled[0]
          : key === "End"
            ? enabled.at(-1)
            : enabled[
                Math.max(
                  0,
                  Math.min(
                    enabled.length - 1,
                    enabled.indexOf(active) + (key === "ArrowDown" ? 1 : -1),
                  ),
                )
              ];
      if (!open) expand(key === "Home" || key === "End" ? next : undefined);
      else if (next !== undefined) setActive(next);
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const previous = now - search.current.time < 700 ? search.current.value : "";
      const query =
        previous === key.toLowerCase() ? key.toLowerCase() : previous + key.toLowerCase();
      search.current = { value: query, time: now };
      const candidates = [
        ...enabled.filter((index) => index > active),
        ...enabled.filter((index) => index <= active),
      ];
      const match = candidates.find((index) => options[index].text.toLowerCase().startsWith(query));
      if (match !== undefined) {
        if (open) setActive(match);
        else expand(match);
      }
    }
  }
  return (
    <div className="custom-select" ref={root}>
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
      <button
        ref={trigger}
        id={id}
        type="button"
        className="custom-select-trigger"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-options`}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onKeyDown={keyboard}
        onClick={() => (open ? setOpen(false) : expand())}
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget)) {
            if (open) choose(active);
          }
        }}
      >
        <span>{options[selected]?.label ?? "—"}</span>
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      <div
        ref={popup}
        id={`${id}-options`}
        className="custom-select-options"
        popover="manual"
        role="listbox"
        aria-labelledby={`${id}-label`}
        style={position}
      >
        {options.map((option, index) => (
          <div
            id={`${id}-option-${index}`}
            key={option.value}
            role="option"
            aria-selected={index === selected}
            aria-disabled={option.disabled || undefined}
            data-index={index}
            data-active={index === active || undefined}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              if (!option.disabled) {
                choose(index);
                trigger.current?.focus();
              }
            }}
            onPointerMove={() => {
              if (!option.disabled) setActive(index);
            }}
          >
            <span>{option.label}</span>
            {index === selected && <Check size={18} aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}
