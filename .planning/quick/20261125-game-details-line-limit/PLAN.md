# Quick Plan: Reduce GameDetails view size

Extract the existing Game Download detail state into a focused v2 composable,
keeping the generated server capability, archive-set refresh behavior, and
visible tab behavior unchanged. Do not add or run tests before live UAT.
