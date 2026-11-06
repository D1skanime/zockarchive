"""The edit dialog must publish its searched cover into the owner catalog."""

from io import BytesIO
from unittest.mock import Mock

import httpx
from PIL import Image

from handler.database import db_rom_handler
from handler.filesystem import fs_resource_handler
from models.rom import RomOwnedMediaRole


def animated_png():
    output = BytesIO()
    Image.new("RGB", (24, 36), "red").save(
        output,
        format="PNG",
        save_all=True,
        append_images=[Image.new("RGB", (24, 36), "blue")],
        duration=100,
        loop=0,
    )
    return output.getvalue()


def test_edit_dialog_search_apply_catalogs_and_selects_animated_cover(
    client, access_token, rom, monkeypatch
):
    source = animated_png()
    url = "https://cdn2.steamgriddb.com/grid/test-animation.png"
    http = httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(
                200,
                headers={"content-type": "image/png"},
                stream=httpx.ByteStream(source),
            )
        )
    )
    monkeypatch.setattr(
        "handler.filesystem.resources_handler.ctx_httpx_client", Mock(get=lambda: http)
    )
    old_path = f"{rom.fs_resources_path}/owned-media/old.png"
    old_file = fs_resource_handler.validate_path(old_path)
    old_file.parent.mkdir(parents=True, exist_ok=True)
    old_file.write_bytes(source)

    previous = db_rom_handler.create_owned_upload_media(
        rom.id,
        rom.updated_at,
        RomOwnedMediaRole.COVER,
        "old.png",
        "image/png",
        old_path,
    )
    current = db_rom_handler.select_owned_cover_media(
        rom.id, previous.media.id, previous.rom.updated_at, old_path, old_path
    )
    original = f"{rom.fs_resources_path}/cover/big.png"
    original_file = fs_resource_handler.validate_path(original)
    original_file.parent.mkdir(parents=True, exist_ok=True)
    original_file.write_bytes(b"retained-original-source")
    current = db_rom_handler.update_rom(
        rom.id,
        {
            "original_cover_path_l": original,
            "original_cover_url": "https://example.org/original.png",
        },
    )
    response = client.put(
        f"/api/roms/{rom.id}",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"expected_version": current.updated_at.isoformat()},
        data={"url_cover": url},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["active_owned_cover_media_id"] != previous.media.id
    selected = next(
        item
        for item in body["owned_media"]
        if item["id"] == body["active_owned_cover_media_id"]
    )
    assert selected["role"] == "cover" and selected["origin"] == "provider"
    assert selected["owned_path"].startswith(f"{rom.fs_resources_path}/owned-media/")
    assert body["original_cover_url"] == "https://example.org/original.png"
    assert original_file.read_bytes() == b"retained-original-source"
    saved = fs_resource_handler.validate_path(selected["owned_path"]).read_bytes()
    assert saved == source
    with Image.open(BytesIO(saved)) as image:
        assert image.n_frames == 2
    reloaded = client.get(
        f"/api/roms/{rom.id}", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert reloaded.json()["active_owned_cover_media_id"] == selected["id"]
    # Reapplying the same source must reuse its candidate, not add duplicates.
    repeated = client.put(
        f"/api/roms/{rom.id}",
        headers={"Authorization": f"Bearer {access_token}"},
        data={"url_cover": url},
    )
    assert repeated.status_code == 200, repeated.text
    assert repeated.json()["active_owned_cover_media_id"] == selected["id"]
    covers = [m for m in repeated.json()["owned_media"] if m["role"] == "cover"]
    assert len(covers) == 2

    # The ordinary media-card selection must also retain APNG and originals.
    version = repeated.json()["updated_at"]
    for media_id in (previous.media.id, selected["id"]):
        switched = client.post(
            f"/api/roms/{rom.id}/media/cover",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"media_id": media_id, "expected_version": version},
        )
        assert switched.status_code == 200, switched.text
        version = switched.json()["updated_at"]
    assert original_file.read_bytes() == b"retained-original-source"
    assert (
        switched.json()["path_cover_large"]
        .split("?", 1)[0]
        .endswith(selected["owned_path"])
    )
    with Image.open(
        BytesIO(fs_resource_handler.validate_path(selected["owned_path"]).read_bytes())
    ) as image:
        assert image.n_frames == 2


def test_failed_cover_download_does_not_commit_form_or_catalog(
    client, access_token, rom, monkeypatch
):
    http = httpx.AsyncClient(
        transport=httpx.MockTransport(lambda request: httpx.Response(404))
    )
    monkeypatch.setattr(
        "handler.filesystem.resources_handler.ctx_httpx_client", Mock(get=lambda: http)
    )
    response = client.put(
        f"/api/roms/{rom.id}",
        headers={"Authorization": f"Bearer {access_token}"},
        data={
            "url_cover": "https://example.org/missing.png",
            "name": "must-not-commit",
        },
    )
    assert response.status_code == 409
    assert db_rom_handler.get_rom(rom.id).name == rom.name
    assert not db_rom_handler.get_owned_media_catalog(rom.id)


def test_conflicting_cover_edit_removes_only_its_staged_file(
    client, access_token, rom, monkeypatch
):
    import endpoints.roms.edited_cover as cover_endpoint

    source = animated_png()
    http = httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(
                200,
                headers={"content-type": "image/png"},
                stream=httpx.ByteStream(source),
            )
        )
    )
    monkeypatch.setattr(
        "handler.filesystem.resources_handler.ctx_httpx_client", Mock(get=lambda: http)
    )
    prepare = cover_endpoint.prepare_searched_cover
    staged = []

    async def prepare_then_change_owner(owner, source_url, fetch_url):
        result = await prepare(owner, source_url, fetch_url)
        staged.append(result.path)
        db_rom_handler.update_rom(owner.id, {"summary": "concurrent-edit"})
        return result

    monkeypatch.setattr(
        cover_endpoint, "prepare_searched_cover", prepare_then_change_owner
    )
    response = client.put(
        f"/api/roms/{rom.id}",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"expected_version": rom.updated_at.isoformat()},
        data={"url_cover": "https://example.org/racing.png"},
    )
    assert response.status_code == 409
    assert len(staged) == 1
    assert not fs_resource_handler.validate_path(staged[0]).exists()
    assert not db_rom_handler.get_owned_media_catalog(rom.id)
    assert db_rom_handler.get_rom(rom.id).summary == "concurrent-edit"


def test_edit_reuses_existing_provider_identity_without_aliasing_files(
    client, access_token, rom
):
    from handler.metadata.rom_media import discover_provider_media

    url = "https://example.org/existing.png"
    source = discover_provider_media("provider", {"url_covers": [url]})[0]
    path = f"{rom.fs_resources_path}/owned-media/existing.png"
    file = fs_resource_handler.validate_path(path)
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_bytes(animated_png())
    existing = db_rom_handler.reconcile_provider_owned_media(
        rom.id,
        rom.updated_at,
        source.provider,
        source.provider_media_id,
        source.role,
        source.display_label,
        "image/png",
        path,
    )
    response = client.put(
        f"/api/roms/{rom.id}",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"expected_version": existing.rom.updated_at.isoformat()},
        data={"url_cover": url},
    )
    assert response.status_code == 200, response.text
    assert response.json()["active_owned_cover_media_id"] == existing.media.id
    covers = [m for m in response.json()["owned_media"] if m["role"] == "cover"]
    assert len(covers) == 1
    assert covers[0]["provider"] == "provider"
    assert file.exists()
