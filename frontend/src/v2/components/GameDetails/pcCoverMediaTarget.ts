import type { RomOwnedMediaRole } from "@/__generated__";

export type PcCoverCandidate = {
  id: number;
  role: RomOwnedMediaRole | "cover";
  owned_path: string | null;
};

/** Exact owner boundary for the shared PC Cover media composite. */
export type PcCoverMediaTarget = {
  endpoint: string;
  uploadEndpoint: string;
  selectionEndpoint: string;
  expectedVersion: string | null;
  candidates: PcCoverCandidate[];
  activeCandidateId: number | null;
  contentUrl: (candidateId: number) => string;
  refresh: () => Promise<boolean>;
};
