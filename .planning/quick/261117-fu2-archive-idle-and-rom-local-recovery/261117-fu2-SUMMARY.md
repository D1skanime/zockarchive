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

Der isolierte ZA-Entwicklungscontainer (`pgdp-pgdp-dev:latest`) wurde als
Wegwerfcontainer geprüft: `/usr/bin/7zz` und `/usr/bin/bsdtar` sind vorhanden.
Der erste direkte Leser-Harness konnte die Anwendungsmodule außerhalb ihres
vollständigen Startkontexts nicht laden, weil `utils.archives` über
`handler.filesystem` in einen bereits bestehenden zyklischen Initialisierungsweg
führt. Die nächste Harness-Ausführung muss deshalb die vollständige Compose-
Startkonfiguration verwenden, nicht nur `PYTHONPATH` auf den Backend-Quellbaum.

`content_proof_scope` wird im Scan ausschließlich von
`scan_media_publication.py` und `scan_output_publication.py` verwendet. Es
verifiziert ZA-eigene Medien- und Ausgabestaging-Dateien, nie Dateien aus der
externen PC-Spielebibliothek. Die Obergrenze von 900 Sekunden kann daher keinen
Windows-ROM-Scan abbrechen. Bei 150 GiB und 100 MiB/s wären es 1.536 Sekunden;
dies bestätigt, warum der Proof für Spielbytes unzulässig wäre, nicht aber eine
Änderung an der weiterhin notwendigen Prüfung eigener Daten.

Der aktuelle Branch lief im Wegwerfcontainer mit der normalen `startup`-
Importreihenfolge. 7z las eine 2 MiB nicht komprimierbare Datei vollständig;
mit einer absichtlich auf null gesetzten Frist wurde der reale Listingpfad als
unvollständig erkannt. ISO blieb im Rohdateipfad, der Repack-Ordner blieb ein
einziger verschachtelter Spieleordner mit `setup.exe` und `fg-*.bin`. Das
vorhandene RAR-Fixture wurde von bsdtar als unvollständig abgewiesen; dieser
Pfad erzeugt jetzt ebenfalls `ArchiveReadError` und kann somit ROM-lokal auf
den Containerhash zurückfallen. Ein echtes mehrteiliges RAR konnte ohne
Archiv-Erzeuger nicht hergestellt werden; dies bleibt als NAS-UAT-Fall offen.
