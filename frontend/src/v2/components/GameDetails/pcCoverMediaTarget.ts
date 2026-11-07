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
  /** Persistent provider or legacy source, distinct from selected uploads. */
  legacyCoverUrl?: string | null;
  supportsOriginalSelection?: boolean;
  contentUrl: (candidateId: number) => string;
  refresh: () => Promise<boolean>;
};
