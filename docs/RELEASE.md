# ZockArchive Release-Verfahren

Dieses Verfahren beschreibt eine künftige, vom Menschen kontrollierte Beta-Veröffentlichung. Es erstellt keinen Tag, veröffentlicht kein Release, überträgt kein Image, meldet sich an keiner Registry an und behauptet nicht, dass ein Image bereits verfügbar ist.

## Image-Vertrag

Die erste vorgesehene Vorabversion ist `v0.1.0-beta.1`. Ein veröffentlichtes GitHub-Release mit einem gültigen Semantic-Version-Tag, optional mit vorangestelltem `v`, löst den Workflow aus. Er veröffentlicht linux/amd64- und linux/arm64-Images im maßgeblichen Paketpfad. Jedes gültige Release erhält seinen exakten normalisierten Versions-Tag. Vorabversionen erhalten zusätzlich `beta`, stabile Versionen nicht.

```text
ghcr.io/d1skanime/zockarchive:0.1.0-beta.1
ghcr.io/d1skanime/zockarchive:beta
```

Der Workflow veröffentlicht niemals `latest` sowie keine Major- oder Minor-Aliase. Betreiber sollen einen exakten geprüften Image-Tag kommunizieren und einsetzen.

Docker Hub ist optional. Der Workflow meldet sich nur an und überträgt nur nach `d1skanime/zockarchive`, wenn beide Docker-Hub-Repository-Secrets vorhanden sind. Fehlt eines oder beide, darf dies die erforderliche GHCR-Veröffentlichung nicht blockieren.

## Nachweise und bekannte Einschränkungen

Der isolierte Installationstest mit leerem Datenbestand, die Persistenzprüfung nach
Neuerstellung des ZA-Containers sowie Typecheck und Build wurden für diesen Auftrag
ausgeführt. Die vollständige Regression folgt erst nach der menschlichen Freigabe.

Die lokale arm64-Variante wurde nicht gebaut, weil der Emulator lokal fehlgeschlagen
ist. GitHub Actions baut amd64 und arm64 beim ersten Release, daher bleibt bis dahin
ein Risiko für die arm64-Auslieferung. Der lokale `npm run build`-Lauf hat ein
bekanntes Umgebungsproblem; dies ersetzt keine Freigabeprüfung in GitHub Actions.
Docker Hub bleibt ohne beide Repository-Secrets deaktiviert.

Die ScreenScraper-Entwicklerzugangsdaten werden als Build-Argumente aus GitHub
Secrets eingebettet. Sie sind in einem veröffentlichten Image auslesbar und deshalb
eine bekannte Einschränkung. Persönliche Zugangsdaten gehören nur in die
Stack-Variablen des Betreibers.

## Künftige Veröffentlichung durch einen Menschen

1. Den isolierten Installationstest und die Portainer-UAT für den geprüften Kandidaten abschließen.
2. Die ausdrückliche menschliche Freigabe zur Veröffentlichung einholen.
3. Über den normalen geprüften Pull-Request-Weg mergen.
4. Das GitHub-Prerelease `v0.1.0-beta.1` erstellen und veröffentlichen.
5. Den GitHub-Actions-Workflow beobachten und den GHCR-Ausstoß für den exakten Tag bestätigen.
6. Wenn beide Docker-Hub-Zugangsdaten konfiguriert sind, dessen Ausstoß optional ebenfalls beobachten. Andernfalls festhalten, dass GHCR der einzige Veröffentlichungsweg blieb.
7. Den exakten GHCR-Image-Tag und die image-basierte Portainer-Anleitung an Betreiber kommunizieren.

Vor Tag, GitHub-Release, Image-Veröffentlichung oder einem Push, der diese Aktionen ausführt, ist eine Freigabe erforderlich. Ein erfolgreicher Build ersetzt keine Freigabe.
