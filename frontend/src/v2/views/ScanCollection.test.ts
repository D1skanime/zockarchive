import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { useScanView } from "@/v2/composables/useScanView";

type ViewScanType = ReturnType<typeof useScanView>["scanType"]["value"];

const api = vi.hoisted(() => ({
  start: vi.fn().mockResolvedValue(undefined),
  providers: ["igdb"],
  snapshot: null as object | null,
  scanning: false,
  scanningPlatforms: [{ id: 3, roms: [{ id: 41 }] }],
  getDirectFolderMappingReadiness: vi.fn().mockResolvedValue({ ready: true }),
}));
const uuid = vi.hoisted(() => ({ createUuid: vi.fn() }));
vi.mock("pinia", async (importOriginal) => ({
  ...(await importOriginal<typeof import("pinia")>()),
  storeToRefs: (store: object) => store,
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref("de-DE") }),
}));
vi.mock("@/v2/composables/useCan", () => ({
  useCan: () => ref(true),
}));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({ error: vi.fn() }),
}));
vi.mock("@/v2/composables/useLibraryOperation", () => ({
  useLibraryOperation: () => ({
    snapshot: ref(api.snapshot),
    checking: ref(false),
    uncertain: ref(false),
    disconnected: ref(false),
    reconciling: ref(false),
    actionError: ref(null),
    status: ref("idle"),
    busy: ref(false),
    start: api.start,
  }),
}));
vi.mock("@/v2/composables/useScanProviders", () => ({
  useScanProviders: () => ({
    storedMetadataSources: ref([]),
    metadataSources: ref(api.providers.map((value) => ({ value }))),
    effectiveMetadataSources: ref(api.providers.map((value) => ({ value }))),
    metadataLocale: ref("en-US"),
    launchboxRemoteEnabled: ref(false),
    isLaunchboxSelected: ref(false),
    hashMatchers: ref([]),
    isHashMatcherOn: () => false,
    setHashMatcher: vi.fn(),
    generalProviders: ref([]),
    specificProviders: ref([]),
    generalAllSelected: ref(false),
    specificAllSelected: ref(false),
  }),
}));
vi.mock("@/v2/data/directFolderMappingReadiness", () => ({
  getDirectFolderMappingReadiness: api.getDirectFolderMappingReadiness,
}));
vi.mock("@/v2/utils/uuid", () => ({ createUuid: uuid.createUuid }));
vi.mock("@/v2/data/adapters/legacy/stores/config", () => ({
  default: () => ({ config: ref({ SKIP_HASH_CALCULATION: false }) }),
}));
vi.mock("@/v2/data/adapters/legacy/stores/platforms", () => ({
  default: () => ({
    scannablePlatforms: ref([{ id: 3, fs_slug: "win", display_name: "PC" }]),
    allPlatforms: [{ id: 3 }],
  }),
}));
vi.mock("@/v2/data/adapters/legacy/stores/scanning", () => ({
  default: () => ({
    scanning: ref(api.scanning),
    scanningPlatforms: ref(api.scanningPlatforms),
    scanStats: ref({}),
    reset: vi.fn(),
  }),
}));

let mountedView: ReturnType<typeof useScanView> | undefined;

const ScanViewHarness = defineComponent({
  setup() {
    mountedView = useScanView();
    return () => null;
  },
});

async function mountScanView() {
  mountedView = undefined;
  const wrapper = mount(ScanViewHarness);
  await flushPromises();

  if (!mountedView) {
    throw new Error("Scan view test harness was not mounted");
  }

  // Vue mounts setup asynchronously; retain the declared hook type across that boundary.
  return { wrapper, view: mountedView as ReturnType<typeof useScanView> };
}

describe("Scan collection selection request", () => {
  beforeEach(() => {
    api.start.mockClear();
    api.snapshot = null;
    api.scanning = false;
    api.scanningPlatforms = [{ id: 3, roms: [{ id: 41 }] }];
    uuid.createUuid.mockReset().mockReturnValue("fallback-uuid");
    api.getDirectFolderMappingReadiness.mockReset().mockResolvedValue({
      ready: true,
    });
  });

  it("keeps live progress visible from acceptance through retained rows", async () => {
    api.snapshot = { state: "accepted" };
    api.scanning = true;
    api.scanningPlatforms = [];
    let mounted = await mountScanView();
    expect(mounted.view.showLivePlatformRows.value).toBe(true);
    mounted.wrapper.unmount();

    api.snapshot = { state: "completed" };
    api.scanning = false;
    api.scanningPlatforms = [{ id: 3, roms: [{ id: 41 }] }];
    mounted = await mountScanView();
    expect(mounted.view.showLivePlatformRows.value).toBe(true);
    mounted.wrapper.unmount();

    api.scanningPlatforms = [];
    mounted = await mountScanView();
    expect(mounted.view.showLivePlatformRows.value).toBe(false);
    mounted.wrapper.unmount();
  });

  it("uses the shared UUID source for normal and subfolder scan requests", async () => {
    uuid.createUuid
      .mockReturnValueOnce("normal-fallback-uuid")
      .mockReturnValueOnce("subfolder-fallback-uuid");
    const { wrapper, view } = await mountScanView();

    view.scan();
    await flushPromises();
    view.scanSubfolder({
      platformFsSlug: "win",
      relativePath: "Game/Disc 1",
      collectionPromotion: {
        parent_rom_id: 41,
        mapping_id: 12,
        expected_revision: 3,
        parent_relative_path: "Game",
        selected_child_relative_path: "Game/Disc 1",
      },
    });
    await flushPromises();

    expect(uuid.createUuid).toHaveBeenCalledTimes(2);
    expect(
      api.start.mock.calls.map(([request]) => request.operationId),
    ).toEqual([
      "library-scan-normal-fallback-uuid",
      "library-scan-subfolder-fallback-uuid",
    ]);
    expect(api.start.mock.calls[1][0]).toMatchObject({
      scanType: "quick",
      scope: {
        kind: "filesystem",
        platformFsSlugs: ["win"],
        relativePaths: { win: "Game/Disc 1" },
      },
    });
    wrapper.unmount();
  });

  it.each([
    { mode: "media", providers: ["igdb"] },
    { mode: "update", providers: ["igdb"] },
    { mode: "hashes", providers: ["igdb"] },
    { mode: "complete", providers: ["igdb"] },
    { mode: "update", providers: [] },
  ])(
    "uses filesystem discovery for explicit child selection while $mode is selected with $providers",
    async ({ mode, providers }) => {
      api.providers = providers;
      const { wrapper, view } = await mountScanView();
      view.scanType.value = mode as ViewScanType;
      const collectionPromotion = {
        parent_rom_id: 41,
        mapping_id: 12,
        expected_revision: 3,
        parent_relative_path: "Castlevania",
        selected_child_relative_path: "Castlevania/Belmonts.Curse",
      };
      view.scanSubfolder({
        platformFsSlug: "win",
        relativePath: collectionPromotion.selected_child_relative_path,
        collectionPromotion,
      });
      await flushPromises();
      expect(api.start).toHaveBeenCalledOnce();
      expect(api.start.mock.calls[0][0]).toMatchObject({
        kind: "discovery",
        scanType: "quick",
        collectionPromotion,
        scope: {
          kind: "filesystem",
          platformFsSlugs: ["win"],
          relativePaths: { win: "Castlevania/Belmonts.Curse" },
        },
        metadataPolicy: { mode: "missing-only" },
        mediaPolicy: { mode: "missing-only" },
        providerPolicy: { providers, launchboxRemoteEnabled: false },
      });
      expect(api.start.mock.calls[0][0].metadataOnly).not.toBe(true);
      expect(api.start.mock.calls[0][0].mediaOnly).not.toBe(true);
      wrapper.unmount();
    },
  );

  it.each([
    { name: "blocked", result: { ready: false }, state: "blocked" },
    {
      name: "failed",
      result: new Error("assignments unavailable"),
      state: "error",
    },
  ])(
    "does not submit a scan while direct-folder readiness is $name",
    async ({ result, state }) => {
      if (result instanceof Error) {
        api.getDirectFolderMappingReadiness.mockRejectedValueOnce(result);
      } else {
        api.getDirectFolderMappingReadiness.mockResolvedValueOnce(result);
      }
      const { wrapper, view } = await mountScanView();

      expect(view.mappingReadiness.value).toBe(state);
      expect(view.mappingReady.value).toBe(false);
      expect(view.canStartScan.value).toBe(false);
      view.scan();
      await flushPromises();
      expect(api.start).not.toHaveBeenCalled();
      wrapper.unmount();
    },
  );
});
