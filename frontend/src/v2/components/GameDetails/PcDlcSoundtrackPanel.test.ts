import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import type { PcComponentOwnedMediaSchema } from "@/__generated__";
import PcDlcSoundtrackPanel from "./PcDlcSoundtrackPanel.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@v2/lib", () => ({
  ZABtn: {
    props: ["href", "download", "disabled", "loading"],
    emits: ["click"],
    template: `
      <component
        :is="href ? 'a' : 'button'"
        v-bind="$attrs"
        :href="href"
        :download="download"
        :disabled="disabled"
        @click="$emit('click')"
      ><slot /></component>
    `,
  },
  ZAEmptyState: { template: "<div data-empty />" },
  ZAIcon: { template: "<span />" },
}));

const track: PcComponentOwnedMediaSchema = {
  id: 7,
  role: "soundtrack",
  mime_type: "audio/mpeg",
  owned_path: "resources/pc-owned-media/20-soundtrack-token.mp3",
  origin: "upload",
  provider: null,
  provider_media_id: null,
  created_at: "2026-11-05T00:00:00Z",
  updated_at: "2026-11-05T00:00:00Z",
  placements: [{ id: 1, media_id: 7, surface: "soundtrack", position: 0 }],
};

describe("PcDlcSoundtrackPanel", () => {
  it("renders component audio with native playback and a named download", () => {
    const wrapper = mount(PcDlcSoundtrackPanel, {
      props: {
        tracks: [track],
        contentUrl: (id: number) =>
          `/api/roms/24/pc-components/20/media/${id}/content`,
        isPlaced: () => true,
        canEdit: true,
        disabled: false,
        placing: false,
        deleting: false,
      },
    });

    const audio = wrapper.get("audio");
    expect(audio.attributes("src")).toBe(
      "/api/roms/24/pc-components/20/media/7/content",
    );
    expect(audio.attributes()).toHaveProperty("controls");
    const download = wrapper.get(
      '[aria-label="common.download: rom.soundtrack 1"]',
    );
    expect(download.element.tagName).toBe("A");
    expect(download.attributes("href")).toBe(
      "/api/roms/24/pc-components/20/media/7/content",
    );
    expect(download.attributes("download")).toBe("20-soundtrack-token.mp3");
  });

  it("keeps component-scoped soundtrack placement and deletion actions", async () => {
    const wrapper = mount(PcDlcSoundtrackPanel, {
      props: {
        tracks: [track],
        contentUrl: () => "/audio",
        isPlaced: () => true,
        canEdit: true,
        disabled: false,
        placing: false,
        deleting: false,
      },
    });

    await wrapper
      .get('[aria-label="rom.remove-from-soundtrack"]')
      .trigger("click");
    await wrapper.get('[aria-label="common.delete"]').trigger("click");
    expect(wrapper.emitted("toggle-placement")).toEqual([[track]]);
    expect(wrapper.emitted("remove")).toEqual([[7]]);
  });
});
