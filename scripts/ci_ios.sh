#!/bin/bash
# Unsigned build and real WKWebView tests. Requires a Mac with Xcode and simulators.
set -euo pipefail
cd "$(dirname "$0")/.."
DITE_FAMILY="${1:-iphone}"
case "$DITE_FAMILY" in iphone|ipad) ;; *) echo 'Usage: ci_ios.sh iphone|ipad' >&2; exit 2 ;; esac
mkdir -p .build/logs
xcodebuild -version | tee .build/logs/xcode-version.txt
# Exercise the actual on-screen keyboard, including its effect on landscape UI.
defaults write com.apple.iphonesimulator ConnectHardwareKeyboard -bool false
xcrun simctl list devices available --json > .build/simulators.json

# Use an installed runtime and real device identifier, never a guessed UUID.
DITE_SIM_ID="$(python3 - "$DITE_FAMILY" <<'PY'
import json, re, sys
from pathlib import Path
family = 'iPhone' if sys.argv[1] == 'iphone' else 'iPad'
preferred = 'iPhone 17 Pro' if family == 'iPhone' else 'iPad (A16)'
data = json.loads(Path('.build/simulators.json').read_text())
candidates = []
for runtime, devices in data['devices'].items():
    if '.iOS-' not in runtime:
        continue
    version = tuple(map(int, re.findall(r'\d+', runtime.rsplit('.iOS-', 1)[1])))
    for device in devices:
        if device.get('isAvailable') and device['name'].startswith(family):
            candidates.append((version, device['name'] == preferred, runtime, device))
if not candidates:
    raise SystemExit('No available '+family+' simulator')
_, _, runtime, device = max(candidates, key=lambda c: (c[0], c[1], c[3]['name']))
Path('.build/selected-simulator.json').write_text(json.dumps({'runtime': runtime, **device}, indent=2)+'\n')
print(device['udid'])
PY
)"
DITE_SIM_STATE="$(python3 -c "import json; print(json.load(open('.build/selected-simulator.json'))['state'])")"
if [ "$DITE_SIM_STATE" != Booted ]; then xcrun simctl boot "$DITE_SIM_ID"; fi
xcrun simctl bootstatus "$DITE_SIM_ID" -b
trap 'xcrun simctl shutdown "$DITE_SIM_ID" >/dev/null 2>&1 || true' EXIT

if [ "$DITE_FAMILY" = iphone ]; then
  xcodebuild -project ios/DITE.xcodeproj -scheme DITE -configuration Release \
    -destination 'generic/platform=iOS' -derivedDataPath .build/device \
    -resultBundlePath .build/DeviceBuild.xcresult CODE_SIGNING_ALLOWED=NO \
    build 2>&1 | tee .build/logs/device-build.log
  ditto -c -k --sequesterRsrc --keepParent .build/device/Build/Products/Release-iphoneos/DITE.app .build/DITE-unsigned-device.zip
fi

# Preserve both pipeline statuses before running any exporter, even after XCTest failure.
set +e
xcodebuild -project ios/DITE.xcodeproj -scheme DITE -configuration Debug \
  -destination "platform=iOS Simulator,id=$DITE_SIM_ID" -derivedDataPath .build/simulator \
  -resultBundlePath .build/SimulatorTests.xcresult -parallel-testing-enabled NO \
  CODE_SIGNING_ALLOWED=NO test 2>&1 | tee .build/logs/simulator-tests.log
DITE_TEST_PIPE_STATUS=("${PIPESTATUS[@]}")
set -e
DITE_TEST_STATUS="${DITE_TEST_PIPE_STATUS[0]}"
DITE_TEST_LOG_STATUS="${DITE_TEST_PIPE_STATUS[1]}"

# Apple documents the Xcode 16+ export attachments interface and recommends the tool's help
# for its exact arguments/output. Capture that help from the actual selected Xcode in CI.
# https://developer.apple.com/documentation/xcode-release-notes/xcode-16_3-release-notes
export_test_attachments() {
  xcrun xcresulttool help export attachments > .build/logs/xcresulttool-attachments-help.txt 2>&1 || return $?
  if ! grep -q -- '--path' .build/logs/xcresulttool-attachments-help.txt || \
     ! grep -q -- '--output-path' .build/logs/xcresulttool-attachments-help.txt; then
    echo 'Selected xcresulttool does not advertise the required attachment export arguments.' >&2
    return 2
  fi
  if [ ! -d .build/SimulatorTests.xcresult ]; then
    echo 'XCTest did not produce SimulatorTests.xcresult; no attachments can be exported.' >&2
    return 3
  fi
  mkdir -p .build/xctest-attachments || return $?
  # Keep successful-test screenshots too: deliberately do not pass --only-failures.
  xcrun xcresulttool export attachments --path .build/SimulatorTests.xcresult \
    --output-path .build/xctest-attachments || return $?
  python3 - "$DITE_TEST_STATUS" <<'PY'
import json, sys
from pathlib import Path
root = Path('.build/xctest-attachments')
manifest = root / 'manifest.json'
json.loads(manifest.read_text())
screenshots = sorted(path for path in root.rglob('*') if path.is_file() and path.suffix.lower() == '.png')
for path in screenshots:
    with path.open('rb') as stream:
        if stream.read(8) != b'\x89PNG\r\n\x1a\n':
            raise SystemExit('Exported screenshot has an invalid PNG signature: '+str(path))
report = {'manifest': 'manifest.json', 'pngCount': len(screenshots),
          'screenshots': [str(path.relative_to(root)) for path in screenshots]}
(root / 'export-check.json').write_text(json.dumps(report, indent=2)+'\n')
if int(sys.argv[1]) == 0 and not screenshots:
    raise SystemExit('XCTest passed but no screenshot attachments were exported.')
print('Exported XCTest screenshot attachments:', len(screenshots))
PY
}

set +e
export_test_attachments > .build/logs/xcresulttool-export.log 2>&1
DITE_EXPORT_STATUS=$?
python3 - "$DITE_TEST_STATUS" "$DITE_TEST_LOG_STATUS" "$DITE_EXPORT_STATUS" <<'PY'
import json, sys
from pathlib import Path
statuses = dict(zip(('xcodebuildStatus', 'testLogStatus', 'attachmentExportStatus'), map(int, sys.argv[1:])))
Path('.build/xctest-status.json').write_text(json.dumps(statuses, indent=2)+'\n')
print(json.dumps(statuses))
PY
DITE_STATUS_REPORT_STATUS=$?
set -e
if [ "$DITE_EXPORT_STATUS" -ne 0 ]; then
  echo "XCTest attachment export failed (status $DITE_EXPORT_STATUS); see xcresulttool-export.log." >&2
fi
# A post-processing error must never replace an original XCTest failure, nor turn success green.
if [ "$DITE_TEST_STATUS" -ne 0 ]; then exit "$DITE_TEST_STATUS"; fi
if [ "$DITE_TEST_LOG_STATUS" -ne 0 ]; then exit "$DITE_TEST_LOG_STATUS"; fi
if [ "$DITE_EXPORT_STATUS" -ne 0 ]; then exit "$DITE_EXPORT_STATUS"; fi
if [ "$DITE_STATUS_REPORT_STATUS" -ne 0 ]; then exit "$DITE_STATUS_REPORT_STATUS"; fi

# Real in-app pictures are exported XCTest attachments; tearDown may leave Simulator on Home.
ditto -c -k --sequesterRsrc --keepParent .build/simulator/Build/Products/Debug-iphonesimulator/DITE.app .build/DITE-simulator.zip
