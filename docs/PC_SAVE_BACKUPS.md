# PC Save Backups

PC save backups are private ZIP archives, not automatic PC synchronization.
Choose **Spielstand sichern** in Save data, select the complete folder, name the
backup if desired, and enter the original Windows restore path such as
`%USERPROFILE%\\Saved Games\\Example`. The chosen folder's relative subfolders,
filenames, and binary contents are kept in the archive.

To restore, close the game and launcher, download and extract the ZIP, then copy
its contents to the displayed Windows path. Browser privacy rules mean that the
source path must be entered manually.

Archives use ZA owned asset storage under `save-backups/<user-id>/`. Migration
`0143_save_backups` creates the metadata table. Include the database and owned
asset storage in normal ZA backups. Restore the ZA server by restoring both of
those ordinary ZA backup components; do not copy game-save archives into the
read-only game library.

Current desktop Chrome, Edge, and Firefox use the browser directory-picker
attribute where supported. If a browser does not provide relative paths, ZA
explains that the folder cannot be backed up in that browser. Browser privacy
rules do not expose the original Windows path, so ZA always asks for it
explicitly.

The server accepts a maximum 1 GiB archive, 10,000 files, 2 GiB uncompressed
content, and 16,000-character relative paths. ZIP inspection rejects traversal,
symlinks and other special files, encrypted members, duplicate paths, excessive
compression ratios, and invalid or incomplete archives. The client displays
upload errors; failed writes remove the archive and any automatically-created
note. Each accepted archive records an archive SHA-256 plus per-file SHA-256
manifest for later integrity checks.
