import { describe, expect, it } from "vitest";
import {
  isSupportedSoundtrackFile,
  soundtrackAccept,
  supportedSoundtrackMimeTypes,
} from "./soundtrackFiles";

describe("soundtrack file candidates", () => {
  it("accepts only configured audio file extensions regardless of casing", () => {
    expect(isSupportedSoundtrackFile("Night Drive.FLAC")).toBe(true);
    expect(isSupportedSoundtrackFile("song.m4a")).toBe(true);
    expect(isSupportedSoundtrackFile("SOURCES.txt")).toBe(false);
    expect(isSupportedSoundtrackFile("cover.webp")).toBe(false);
  });

  it("shares the candidate extensions with the upload picker", () => {
    expect(soundtrackAccept).toBe(".mp3,.aac,.flac,.ogg,.opus,.m4a,.wav");
    expect(supportedSoundtrackMimeTypes).toContain("audio/flac");
  });
});
