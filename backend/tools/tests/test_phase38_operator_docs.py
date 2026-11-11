"""Current operator identity and installation compatibility contracts."""

import hashlib
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCE = "https://github.com/D1skanime/zockarchive"
DOCS = (
    "README.md",
    "CLAUDE.md",
    "DEVELOPER_SETUP.md",
    "CONTRIBUTING.md",
    "examples/README.md",
    "docs/INSTALLATION_PORTAINER.md",
    "docs/PORTAINER_INSTALL.md",
    "docs/external-read-only-library-operations.md",
    "docs/BACKEND_ARCHITECTURE.md",
    "docs/FRONTEND_ARCHITECTURE.md",
)


def read(name):
    return (ROOT / name).read_text()


def config_contract(text):
    # Comments may change; operator keys, defaults, paths and mount modes may not.
    return "\n".join(
        line.split("#", 1)[0].rstrip()
        for line in text.splitlines()
        if line.split("#", 1)[0].strip()
    )


class OperatorDocsTests(unittest.TestCase):
    def test_current_documents_identify_product(self):
        for name in DOCS:
            with self.subTest(file=name):
                self.assertIn(
                    "ZockArchive",
                    next(
                        line
                        for line in read(name).splitlines()
                        if line.startswith("# ")
                    ),
                )

    def test_install_and_support_use_current_repository(self):
        for name in (
            "README.md",
            "AGENTS.md",
            "examples/README.md",
            "docs/PORTAINER_INSTALL.md",
            "CONTRIBUTING.md",
        ):
            with self.subTest(file=name):
                self.assertIn(SOURCE, read(name))
                self.assertNotIn(
                    "https://github.com/D1skanime/pc-game-download-portal", read(name)
                )
        self.assertIn(SOURCE + "/issues", read("CONTRIBUTING.md"))
        self.assertIn(SOURCE + "/releases", read("README.md"))

    def test_provenance_compatibility_and_external_limits_are_explicit(self):
        for value in ("RomM", "AGPL", "PGDP_*", "ROMM_*", "artwork"):
            self.assertIn(value, read("README.md"))
        install = read("docs/PORTAINER_INSTALL.md")
        for value in (
            "pgdp_mysql_data",
            "pgdp_resources",
            "pgdp_redis_data",
            "pc-game-download-portal:portainer",
            "PGDP_SCREENSCRAPER_DEV_ID",
            "PGDP_SCREENSCRAPER_DEV_PASSWORD",
        ):
            self.assertIn(value, install)
        self.assertIn("ghcr.io/d1skanime/zockarchive", install)
        self.assertNotIn("ghcr.io/d1skanime/pc-game-download-portal", install)
        release = read("docs/INSTALLATION_PORTAINER.md")
        for value in (
            "ZA_DB_PASSWORD",
            "ZA_DB_ROOT_PASSWORD",
            "ZA_AUTH_SECRET_KEY",
            "ZA_LIBRARY_PATH",
            "za_assets",
            "za_config",
            "unverified",
        ):
            self.assertIn(value, release)

    def test_release_stack_defaults_to_persistent_image_only_installation(self):
        stack = read("examples/portainer-release.yml")
        guide = read("docs/INSTALLATION_PORTAINER.md")

        self.assertIn(
            "${ZA_IMAGE_REPOSITORY:-ghcr.io/d1skanime/zockarchive}:${ZA_IMAGE_TAG:-0.1.0-beta.1}",
            stack,
        )
        self.assertNotRegex(stack, r"(?m)^\s*build:")
        self.assertEqual(
            set(re.findall(r"\$\{(ZA_[A-Z_]+):\?", stack)),
            {
                "ZA_DB_PASSWORD",
                "ZA_DB_ROOT_PASSWORD",
                "ZA_AUTH_SECRET_KEY",
                "ZA_LIBRARY_PATH",
            },
        )
        self.assertIn("${ZA_ASSETS_PATH:-za_assets}:/romm/assets", stack)
        self.assertIn("${ZA_CONFIG_PATH:-za_config}:/romm/config", stack)
        self.assertIn("za_assets:", stack)
        self.assertIn("za_config:", stack)
        self.assertIn("ghcr.io/d1skanime/zockarchive:0.1.0-beta.1", guide)
        self.assertIn("`/romm/...` ist", guide)
        self.assertIn("fester interner Container-Pfad", guide)
        self.assertIn("ZA_ASSETS_PATH", guide)
        self.assertIn("ZA_CONFIG_PATH", guide)

    def test_canonical_execution_path_is_preserved(self):
        for name in ("AGENTS.md", "CLAUDE.md"):
            self.assertIn("/home/d1sk/pc-game-download-portal", read(name))
            self.assertIn("team4s-linux", read(name))

    def test_current_source_maps_reference_real_bootstrap(self):
        for name in ("docs/BACKEND_ARCHITECTURE.md", "docs/FRONTEND_ARCHITECTURE.md"):
            self.assertNotIn("RomM.vue", read(name))
            self.assertIn("PGDP.vue", read(name))
        self.assertTrue((ROOT / "frontend/src/PGDP.vue").is_file())

    def test_operator_values_remain_exact(self):
        for name, expected in CONFIG.items():
            with self.subTest(file=name):
                self.assertEqual(
                    hashlib.sha256(config_contract(read(name)).encode()).hexdigest(),
                    expected,
                )


CONFIG = {
    "examples/config.example.yml": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "examples/docker-compose.example.yml": "ffeb1bc8400c527c828b5048ec2c004c5ee2dacc03378f098e3b8ae63ced89bd",
    "examples/portainer-stack.yml": "5d5cbd528353ff66442b1c9b374b568fde3cd1a9de66e946096606df40acf773",
    "examples/portainer.env.example": "2a8053a05e840c28d54cc161a831f7753e5b26f0d6354fe586cea8c186fe45e8",
    "env.template": "3d9cc38bbd3624cec1b659e959cf1eec52d1f6bf70b519e4ab41b3ef7e84ef23",
}
