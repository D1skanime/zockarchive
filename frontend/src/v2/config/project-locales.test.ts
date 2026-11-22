import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import mediaBaseline from "./__tests__/media-locales.baseline.json";
import baseline from "./project-locales.baseline.json";

const root = resolve(process.cwd(), "src/locales");
const normalize = (value: string) =>
  value.replace(/RomM|PGDP|ZockArchive/g, "<PRODUCT>");
const digest = (value: unknown) =>
  createHash("sha256")
    .update(normalize(JSON.stringify(value)))
    .digest("hex");
const approvedSettingsDigests: Record<string, string> = {
  bg_BG: "475a97ef8e605b9ffdc0c6359045b92a81f49cdbb8930df176defcee3abdec67",
  cs_CZ: "322812abe6cf138d84ff9a876106e0f8d4ece797f91b1dda27d1a523750eca6c",
  de_DE: "ffc2b3fa08e2f86d0a6f9a21f0700477081880dca99aae51e72373c533309568",
  en_GB: "8804ea201f25893d9238bbabb1255d20e4a999d4856b069d97f1b891be27b5a8",
  en_US: "83bc6e1318327b2d41c75cacdce679e36dbd258b74ddc35ec3b91dbd5393e359",
  es_ES: "ee33ce04a41eea917ef5d2558c94090f77bc1af4126d09ef2f4e3907a153879a",
  fr_FR: "31abc18c5b11cc0416c5774319b2b604c0a444b2f042df736808b18bd7e42f2e",
  hu_HU: "d68bcde0d62688d44f890eb8771d83a761125353fe1ede5cf19a67fc3d73889f",
  it_IT: "f70fd4821a74cb48efed94ee990f011ec88da917994c12b3ecdcbeb38b9be5c3",
  ja_JP: "ee6361ffa3fbe49a7e704a1a44d5340372bca94ff4fba92b198cffd54454afa4",
  ko_KR: "7a87bd4dedcd279c12fd296e0150e04b6e6fa1393d4e1338b5d7f10605d58b34",
  pl_PL: "2fd141d1ea05edfa675888e7d651089ce8253f660ccbc83aaa91d085f0ba1be5",
  pt_BR: "6f9aefba779b41697743dc1058e42e4c27ae1d0672c19de4a8399511f96d4435",
  ro_RO: "d360616add545ca46b8f757d9987efc7c7d76caea755fb48bc4819e98980c391",
  ru_RU: "2ea72afff315a50f1ea3c24532eee15fb3410e14601f4f947bab292643390b98",
  tr_TR: "522d5348ef7f76a17c2d18030fccb23c5861c8638928cc74a0ecc46b28e09fc9",
  zh_CN: "d1cf8f4c8e633582b1d38e527d5e777e0763c4ae1f85ab12758bc96ba5ffe555",
  zh_TW: "f09c9825a6e016dc737999c8b3fcff016c268e52fb28dd190669a66c98d1941c",
};

describe("localized product identity", () => {
  it("covers all eighteen supported languages", () => {
    expect(
      readdirSync(root)
        .filter((name) => /^[a-z]{2}_[A-Z]{2}$/.test(name))
        .sort(),
    ).toEqual(Object.keys(baseline).sort());
    expect(Object.keys(baseline)).toHaveLength(18);
  });

  for (const [locale, namespaces] of Object.entries(baseline)) {
    it(`${locale} preserves every key and all non-brand semantics`, () => {
      for (const [namespace, contract] of Object.entries(namespaces)) {
        const values = JSON.parse(
          readFileSync(resolve(root, locale, `${namespace}.json`), "utf8"),
        );
        // Complete normalized values preserve translations, interpolation, HTML and plural branches.
        const approvedMediaDigests = mediaBaseline as Record<
          string,
          Record<string, string>
        >;
        expect(digest(values), namespace).toBe(
          approvedMediaDigests[locale]?.[namespace] ??
            (namespace === "settings"
              ? approvedSettingsDigests[locale]
              : undefined) ??
            contract.digest,
        );
        for (const key of contract.brandedKeys) {
          expect(values[key], `${namespace}.${key}`).toContain("ZockArchive");
          expect(values[key], `${namespace}.${key}`).not.toMatch(/RomM|PGDP/);
        }
      }
    });
  }

  it("renders recovery, interpolation and plural copy through vue-i18n", () => {
    const load = (namespace: string): Record<string, string> =>
      JSON.parse(
        readFileSync(resolve(root, "en_US", `${namespace}.json`), "utf8"),
      );
    const i18n = createI18n({
      legacy: false,
      locale: "en_US",
      messages: {
        en_US: {
          rom: load("rom"),
          setup: load("setup"),
          settings: load("settings"),
        },
      },
    });
    expect(i18n.global.t("setup.assign-folder", { folder: "Games" })).toBe(
      "Assign Games to a ZockArchive platform",
    );
    expect(i18n.global.t("rom.remove-from-catalog-body", { n: 2 }, 2)).toBe(
      "Remove 2 games from ZockArchive's catalog.",
    );
    expect(i18n.global.t("rom.download-failed-description")).toBe(
      "ZockArchive could not continue this file. Check your connection and folder permission, then retry.",
    );
    expect(
      i18n.global.t("settings.config-file-parse-error-desc", {
        error: "Invalid syntax",
      }),
    ).toContain("Details: Invalid syntax");
  });
});
