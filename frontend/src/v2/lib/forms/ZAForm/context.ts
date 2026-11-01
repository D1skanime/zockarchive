// ZAForm context — the channel each form field uses to register itself
// with an ancestor `<ZAForm>` so the form can aggregate validity,
// validate the whole form on demand, and reset all children at once.
//
// Field components inject `useZAFormRegistration()` and, if a form is
// present, register their `validate` + `reset` handles. The form keeps
// the registry, surfaces it via its public `validate()` / `reset()`
// methods, and computes `modelValue` (true when every field is valid).
import { inject, onBeforeUnmount, provide } from "vue";
import type { InjectionKey } from "vue";

export interface ZAFormField {
  /** Run rules on the field; return true if no rule failed. */
  validate: () => boolean | Promise<boolean>;
  /** Clear dirty state + cached errors (does not touch the model). */
  reset: () => void;
  /** Used by `scrollToFirstError` — the DOM element to focus + scroll. */
  el?: () => HTMLElement | null;
  /** Read the field's current validity. Implemented as a getter (not a
   *  Ref) so Vue's auto-unwrap inside the form's `fields` array doesn't
   *  collapse the type signature. The form invokes it from a computed,
   *  so reactivity still flows when the field's underlying state changes. */
  validity: () => boolean;
}

export interface ZAFormApi {
  register: (field: ZAFormField) => void;
  unregister: (field: ZAFormField) => void;
}

export const ZAFormKey: InjectionKey<ZAFormApi> = Symbol("ZAForm");

/** Use inside a form field. Auto-unregisters on unmount. */
export function useZAFormRegistration(field: ZAFormField) {
  const api = inject(ZAFormKey, null);
  if (!api) return;
  api.register(field);
  onBeforeUnmount(() => api.unregister(field));
}

export function provideZAForm(api: ZAFormApi) {
  provide(ZAFormKey, api);
}
