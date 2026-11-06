export type PcCoverCandidate = {
  id: number;
  /** The composite receives only records that can become an active poster. */
  role: "cover";
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
  /** Existing ROM cover managed outside the owned-media catalog. */
  legacyCoverUrl?: string | null;
  contentUrl: (candidateId: number) => string;
  refresh: () => Promise<boolean>;
};
