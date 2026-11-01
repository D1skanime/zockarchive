// ZAMenu context — the channel descendant ZAMenuItems use to request a
// close on activation without needing a parent ref. Lives in its own
// file because `<script setup>` cannot host `export` statements.
import type { InjectionKey } from "vue";

export const ZAMenuCloseKey: InjectionKey<() => void> = Symbol("ZAMenuClose");
