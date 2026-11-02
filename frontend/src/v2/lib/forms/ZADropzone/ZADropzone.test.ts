import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import ZADropzone from "./ZADropzone.vue";

type DroppedEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file: (success: (file: File) => void) => void;
  createReader: () => {
    readEntries: (success: (entries: DroppedEntry[]) => void) => void;
  };
};

function fileEntry(name: string, selected: File): DroppedEntry {
  return {
    isFile: true,
    isDirectory: false,
    name,
    file: (success) => success(selected),
    createReader: () => ({ readEntries: () => undefined }),
  };
}

function directoryEntry(name: string, batches: DroppedEntry[][]): DroppedEntry {
  let batchIndex = 0;
  return {
    isFile: false,
    isDirectory: true,
    name,
    file: () => undefined,
    createReader: () => ({
      readEntries: (success) => success(batches[batchIndex++] ?? []),
    }),
  };
}

describe("ZADropzone", () => {
  it("preserves nested relative paths when a directory is dropped", async () => {
    const rootSave = new File(["root"], "slot.sav");
    const nestedSave = new File(["nested"], "manual.sav");
    const droppedDirectory = directoryEntry("My Game", [
      [
        fileEntry("slot.sav", rootSave),
        directoryEntry("Profiles", [[fileEntry("manual.sav", nestedSave)], []]),
      ],
      [],
    ]);
    const item = {
      type: "",
      webkitGetAsEntry: () => droppedDirectory,
    };
    const wrapper = mount(ZADropzone, {
      props: { multiple: true, preserveDroppedPaths: true },
      global: { stubs: { ZAIcon: true } },
    });
    await nextTick();
    const dropEvent = new Event("drop", {
      bubbles: true,
      cancelable: true,
    }) as DragEvent;
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [rootSave, nestedSave],
        items: [item],
      },
    });

    wrapper.get(".r-dropzone").element.dispatchEvent(dropEvent);
    await flushPromises();

    const emittedFiles = wrapper.emitted("files");
    expect(emittedFiles).toHaveLength(1);
    expect((emittedFiles?.[0]?.[0] as File[]).map((file) => file.name)).toEqual(
      ["slot.sav", "manual.sav"],
    );
    expect(
      (emittedFiles?.[0]?.[0] as File[]).map((file) => file.webkitRelativePath),
    ).toEqual(["My Game/slot.sav", "My Game/Profiles/manual.sav"]);
  });
});
