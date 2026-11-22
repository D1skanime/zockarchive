import { computed, nextTick, ref } from "vue";
import romApi from "@/v2/data/adapters/legacy/services/api/rom";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";
import useSoundtrackPlayer, {
  type PlayerMeta,
  type PlayerTrack,
} from "@/v2/data/adapters/legacy/stores/soundtrackPlayer";
import { isSupportedSoundtrackFile } from "./soundtrackFiles";

type Playlist = {
  tracks: PlayerTrack[];
  metas: Record<number, PlayerMeta>;
};

type Options = {
  rom: () => DetailedRom;
  player: ReturnType<typeof useSoundtrackPlayer>;
  refreshCanonical: () => Promise<void>;
  syncPlaylist: () => void;
  playlist: () => Playlist;
  handleError: (error: unknown) => Promise<void>;
};

/** Keep locally scanned soundtrack files in the shared player and ROM selection. */
export function useLocalSoundtrackPlaylist(options: Options) {
  const updating = ref(false);
  const localTracks = computed(() =>
    options
      .rom()
      .files.filter(
        (file) =>
          file.category === "soundtrack" &&
          isSupportedSoundtrackFile(file.file_name),
      ),
  );
  const selectedTrackIds = computed(
    () => new Set(options.rom().local_background_audio_file_ids ?? []),
  );
  const selectedTracks = computed(() =>
    localTracks.value
      .filter((file) => selectedTrackIds.value.has(file.id))
      .slice()
      .sort((left, right) => left.file_name.localeCompare(right.file_name)),
  );
  const tracks = computed<PlayerTrack[]>(() =>
    selectedTracks.value.map((file) => ({
      romId: options.rom().id,
      // File and owned-media identifiers are separate positive sequences.
      mediaId: -file.id,
      fileName: file.file_name,
      url: `/api/roms/${file.id}/files/content/${encodeURIComponent(file.file_name)}`,
    })),
  );
  const metas = computed<Record<number, PlayerMeta>>(() =>
    Object.fromEntries(
      selectedTracks.value.map((file) => [-file.id, { title: file.file_name }]),
    ),
  );

  async function toggle(fileId: number) {
    if (updating.value) return;
    updating.value = true;
    const nextFileIds = new Set(selectedTrackIds.value);
    if (nextFileIds.has(fileId)) nextFileIds.delete(fileId);
    else nextFileIds.add(fileId);
    try {
      const response = await romApi.replaceLocalBackgroundAudio({
        romId: options.rom().id,
        fileIds: [...nextFileIds],
        expectedVersion: options.rom().updated_at,
      });
      await options.refreshCanonical();
      await nextTick();
      options.syncPlaylist();
      if (nextFileIds.has(fileId)) {
        const file = response.data.files.find((item) => item.id === fileId);
        if (file) {
          const selected: PlayerTrack = {
            romId: options.rom().id,
            mediaId: -file.id,
            fileName: file.file_name,
            url: `/api/roms/${file.id}/files/content/${encodeURIComponent(file.file_name)}`,
          };
          const playlist = options.playlist();
          options.player.loadPlaylistForRom(
            options.rom().id,
            [
              selected,
              ...playlist.tracks.filter((track) => track.mediaId !== -fileId),
            ],
            {
              ...playlist.metas,
              [selected.mediaId]: { title: file.file_name },
            },
          );
          options.player.play(selected, { title: file.file_name });
        }
      } else if (
        options.player.track?.romId === options.rom().id &&
        options.player.track.mediaId === -fileId
      ) {
        options.player.stop();
      }
    } catch (error) {
      await options.handleError(error);
    } finally {
      updating.value = false;
    }
  }

  return {
    localTracks,
    selectedTrackIds,
    selectedTracks,
    tracks,
    metas,
    updating,
    toggle,
  };
}
