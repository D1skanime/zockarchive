import { computed, type Ref } from "vue";
import type { DetailedRomSchema } from "@/__generated__";
import { FRONTEND_RESOURCES_PATH } from "@/utils";

type LocalDlcOverviewCandidate = {
  igdbId: number;
  componentId: number;
  name: string;
  coverUrl: string;
};

/** Derives local DLC and expansion cards from the canonical detail response. */
export function useLocalDlcOverviewCandidates(
  currentRom: Ref<DetailedRomSchema | null>,
) {
  const candidates = computed<LocalDlcOverviewCandidate[]>(() =>
    (currentRom.value?.components ?? []).flatMap((component) => {
      const metadata = component.component_metadata;
      const cover =
        component.owned_media?.find((media) => media.role === "cover") ??
        component.local_media?.find((media) => media.role === "cover");
      const name = metadata?.name?.trim();
      if (
        component.kind !== "dlc" ||
        !metadata?.igdb_id ||
        metadata.igdb_id <= 0 ||
        !name ||
        !cover
      )
        return [];
      return [
        {
          igdbId: metadata.igdb_id,
          componentId: component.id,
          name,
          coverUrl: `${FRONTEND_RESOURCES_PATH}/${cover.owned_path}`,
        },
      ];
    }),
  );
  const isExpansion = (candidate: LocalDlcOverviewCandidate) =>
    ["expansion", "expansions"].includes(
      currentRom.value?.components
        ?.find((item) => item.id === candidate.componentId)
        ?.relative_path.split("/", 1)[0]
        ?.toLocaleLowerCase() ?? "",
    );
  return {
    localDlcCandidates: computed(() =>
      candidates.value.filter((candidate) => !isExpansion(candidate)),
    ),
    localExpansionCandidates: computed(() =>
      candidates.value.filter(isExpansion),
    ),
  };
}
