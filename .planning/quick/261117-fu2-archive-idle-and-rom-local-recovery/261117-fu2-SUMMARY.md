---
quick_id: 261117-fu2
title: Archive-Leerlauf, ROM-lokale Wiederherstellung und PC-Großdateien
status: incomplete
---

# Ergebnis

Die per-ROM-Rückführung, Leerlauf-Erkennung und Entfernung der vier
plattformweiten `ArchiveReadError`-Sammler sind umgesetzt. Der Worker verwendet
wieder die einzelnen Mapping-Aufrufe, damit sein langlebiger Snapshot- und
Provider-Kontext erhalten bleibt. Windows-Inventurfehler werden für bestehende
Spiele als Vorgangswarnung behandelt; neue Windows-Ordner fallen auf die normale,
nicht bytehashende Entdeckung zurück.

Offen bleibt der verlangte vollständige isolierte Nachweis für ISO, mehrteiliges
RAR und Repack-Ordner samt aktueller Browserinstanz. Er wurde nicht als erledigt
behauptet und benötigt vor UAT die bereitgestellte isolierte Harness.
