# ZockArchive per Portainer installieren

Diese Anleitung installiert das ZockArchive-Release ohne Git-Checkout, Source-Build
oder manuelle Datenbankeinrichtung. Sie setzt voraus, dass ein geprüftes Release-Image
veröffentlicht wurde.

## 1. Vorbereitung

Auf dem Docker-Host benötigen Sie nur den absoluten Pfad zu Ihrer Spielebibliothek.
Der Pfad wird schreibgeschützt eingebunden. In der Stack-Variable steht links immer
Ihr eigener Host-Pfad, zum Beispiel `/srv/spiele:/romm/library:ro`. `/romm/...` ist
ein fester interner Container-Pfad und wird nicht angepasst.

Erzeugen Sie drei unabhängige Geheimnisse auf einem vertrauenswürdigen Rechner:

```sh
openssl rand -hex 32
```

Führen Sie den Befehl dreimal aus, einmal für jedes Passwort. Speichern Sie die Werte
nur in Portainer oder einem Passwort-Manager.

## 2. Stack in Portainer anlegen

1. Öffnen Sie **Stacks**, dann **Add stack** und wählen Sie den Web editor.
2. Fügen Sie den Inhalt von `examples/portainer-release.yml` aus dem geprüften
   Release ein oder laden Sie die Datei hoch.
3. Tragen Sie unter **Environment variables** genau diese vier erforderlichen Werte ein:

   | Variable              | Wert                                                |
   | --------------------- | --------------------------------------------------- |
   | `ZA_DB_PASSWORD`      | erstes erzeugtes Geheimnis                          |
   | `ZA_DB_ROOT_PASSWORD` | zweites erzeugtes Geheimnis                         |
   | `ZA_AUTH_SECRET_KEY`  | drittes erzeugtes Geheimnis                         |
   | `ZA_LIBRARY_PATH`     | absoluter Pfad Ihrer Bibliothek auf dem Docker-Host |

4. Klicken Sie **Deploy the stack**. Fehlende Pflichtwerte verhindern einen Teilstart.

Der normale Imagepfad ist `ghcr.io/d1skanime/zockarchive:0.1.0-beta.1`.
Nutzen Sie niemals `latest`. Assets und Konfiguration werden standardmäßig in
benannten Volumes gespeichert. Fortgeschrittene können optional `ZA_ASSETS_PATH`
und `ZA_CONFIG_PATH` auf beschreibbare absolute Host-Pfade setzen; dann ersetzen
diese Pfade jeweils das zugehörige Volume.

## 3. Erste Einrichtung

Warten Sie, bis MariaDB und Valkey gesund sind. Öffnen Sie anschließend
`http://<Docker-Host>:8080`, legen Sie den ersten Benutzer im Browser an und richten
Sie die Bibliothek ein. Datenbankinitialisierung und Migrationen laufen beim ersten
Start automatisch, führen Sie keine SQL-Befehle aus.

## 4. Aktualisieren

Prüfen Sie die Release-Notizen. Ändern Sie nur `ZA_IMAGE_TAG` auf den exakten,
geprüften neuen Versions-Tag und deployen Sie den selben Stack erneut. Behalten Sie
alle Volumes und optionale Host-Pfade bei. Prüfen Sie danach Anmeldung und Bibliothek.

## 5. Sicherung

Sichern Sie die benannten Volumes `za_mariadb_data`, `za_valkey_data`,
`za_resources`, `za_assets` und `za_config` mit dem von Ihnen verwendeten
Docker- oder Datenbank-Backupverfahren. Sichern Sie zusätzlich optionale
`ZA_ASSETS_PATH`- und `ZA_CONFIG_PATH`-Pfade. Die Quellbibliothek folgt ihrer
eigenen Backup-Strategie und bleibt außerhalb der von ZockArchive verwalteten Daten.

## Kompatibilität

Der ältere Git-Quellstack mit `PGDP_*` bleibt separat dokumentiert in
[PORTAINER_INSTALL.md](PORTAINER_INSTALL.md). Mischen Sie ihn nicht mit diesem
Release-Stack.
