#!/usr/bin/env python3
"""Linux checks for packaging, independent from the native XCTest suite."""
import contextlib
import importlib.util
import io
import json
import plistlib
import re
import shutil
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("ios_sync", ROOT / "scripts/ios_sync.py")
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class OfflineBundleTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        (self.root / "motore/dist").mkdir(parents=True)
        (self.root / "motore/node_modules/three").mkdir(parents=True)
        (self.root / "motore/dist/index.html").write_text('<!doctype html><title>DITE</title><body>VERSIONE 4.0<script>const ready=true;</script></body>')
        (self.root / "motore/node_modules/three/LICENSE").write_text("Test fixture license")
        icon = Path("ios/DITE/Assets.xcassets/AppIcon.appiconset/AppIcon.png")
        (self.root / icon).parent.mkdir(parents=True)
        shutil.copyfile(ROOT / icon, self.root / icon)

    def tearDown(self):
        self.temporary.cleanup()

    def run_sync(self, check=False):
        with contextlib.redirect_stdout(io.StringIO()):
            sync.sync(self.root, check)

    def test_exact_bundle_and_license_with_deterministic_manifest(self):
        self.run_sync()
        self.run_sync(check=True)
        target = self.root / "ios/DITE/Resources/Game"
        before = {path.name: path.read_bytes() for path in target.iterdir()}
        self.run_sync()
        after = {path.name: path.read_bytes() for path in target.iterdir()}
        self.assertEqual(before, after)
        self.assertEqual(before["index.html"], (self.root / "motore/dist/index.html").read_bytes())
        self.assertEqual(json.loads(before["bundle-manifest.json"])["gameVersion"], "4.0")

    def test_check_detects_stale_html_without_repairing_it(self):
        self.run_sync()
        target = self.root / "ios/DITE/Resources/Game/index.html"
        original = target.read_bytes()
        source = self.root / "motore/dist/index.html"
        source.write_text(source.read_text() + "<!--changed-->")
        with self.assertRaisesRegex(ValueError, "stale"):
            self.run_sync(check=True)
        self.assertEqual(target.read_bytes(), original)

    def test_check_rejects_a_modified_license_or_checksum(self):
        self.run_sync()
        (self.root / "ios/DITE/Resources/Game/THREE-LICENSE.txt").write_text("modified")
        with self.assertRaisesRegex(ValueError, "stale"):
            self.run_sync(check=True)

    def test_missing_bundle_fails_check_without_creating_it(self):
        with self.assertRaisesRegex(ValueError, "stale"):
            self.run_sync(check=True)
        self.assertFalse((self.root / "ios/DITE/Resources/Game").exists())

    def test_external_or_pwa_resources_and_unbuilt_sources_fail(self):
        for fragment in ['<script src="https://cdn.invalid/three.js"></script>',
                         '<link rel="manifest" href="manifest.webmanifest">',
                         '<style>body{background:url(https://cdn.invalid/x.png)}</style>',
                         '<style>@import "remote.css";</style>', '/*GAME*/']:
            with self.subTest(fragment=fragment), self.assertRaises(ValueError):
                sync.validate_html(("VERSIONE 4.0" + fragment).encode())

    def test_unexpected_bundle_files_are_preserved_and_reported(self):
        self.run_sync()
        extra = self.root / "ios/DITE/Resources/Game/unknown.txt"
        extra.write_text("Do not silently delete me")
        with self.assertRaisesRegex(ValueError, "Unexpected"):
            self.run_sync()
        self.assertEqual(extra.read_text(), "Do not silently delete me")


class NativeMetadataTests(unittest.TestCase):
    def test_privacy_and_plists_are_parseable_and_no_permissions_are_added(self):
        with (ROOT / "ios/DITE/Info.plist").open("rb") as file:
            info = plistlib.load(file)
        self.assertEqual(set(info["UISupportedInterfaceOrientations"]),
                         {"UIInterfaceOrientationLandscapeLeft", "UIInterfaceOrientationLandscapeRight"})
        self.assertEqual(set(info.get("UISupportedInterfaceOrientations~ipad", [])),
                         {"UIInterfaceOrientationPortrait", "UIInterfaceOrientationPortraitUpsideDown",
                          "UIInterfaceOrientationLandscapeLeft", "UIInterfaceOrientationLandscapeRight"})
        self.assertNotIn("UIRequiresFullScreen", info)
        project = (ROOT / "ios/DITE.xcodeproj/project.pbxproj").read_text()
        families = re.findall(r"\bTARGETED_DEVICE_FAMILY = ([^;]+);", project)
        self.assertEqual(len(families), 6, "App and both test targets need Debug and Release device families")
        self.assertEqual(set(families), {'"1,2"'}, "Ship and test native iPhone and iPad layouts")
        self.assertFalse(any(key.endswith("UsageDescription") for key in info))
        self.assertNotIn("UIBackgroundModes", info)
        self.assertNotIn("NSAppTransportSecurity", info)
        with (ROOT / "ios/DITE/PrivacyInfo.xcprivacy").open("rb") as file:
            manifest = plistlib.load(file)
        self.assertFalse(manifest["NSPrivacyTracking"])
        self.assertEqual(manifest["NSPrivacyCollectedDataTypes"], [])

    def test_shared_scheme_runs_both_native_suites(self):
        scheme = ET.parse(ROOT / "ios/DITE.xcodeproj/xcshareddata/xcschemes/DITE.xcscheme")
        names = {ref.attrib["BlueprintName"] for ref in scheme.findall(".//Testables/TestableReference/BuildableReference")}
        self.assertEqual(names, {"DITETests", "DITEUITests"})
        self.assertTrue(all(item.attrib.get("skipped") == "NO" for item in scheme.findall(".//Testables/TestableReference")))


if __name__ == "__main__":
    unittest.main(verbosity=2)
