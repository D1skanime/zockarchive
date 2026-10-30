/** Dispatches a pointerenter while retaining the requested pointer modality. */
export function firePointerEnter(el: Element, pointerType: "mouse" | "touch") {
  let event: Event;
  try {
    event = new PointerEvent("pointerenter", { bubbles: false, pointerType });
  } catch {
    event = new Event("pointerenter", { bubbles: false });
  }
  if ((event as PointerEvent).pointerType !== pointerType) {
    Object.defineProperty(event, "pointerType", {
      configurable: true,
      value: pointerType,
    });
  }
  el.dispatchEvent(event);
}

/** Dispatches a pointerdown and click for Storybook touch interaction tests. */
export function fireTap(el: Element, pointerType: "mouse" | "touch") {
  let event: Event;
  try {
    event = new PointerEvent("pointerdown", { bubbles: true, pointerType });
  } catch {
    event = new Event("pointerdown", { bubbles: true });
  }
  if ((event as PointerEvent).pointerType !== pointerType) {
    Object.defineProperty(event, "pointerType", {
      configurable: true,
      value: pointerType,
    });
  }
  el.dispatchEvent(event);
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}
