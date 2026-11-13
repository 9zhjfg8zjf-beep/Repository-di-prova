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

xcodebuild -project ios/DITE.xcodeproj -scheme DITE -configuration Debug \
  -destination "platform=iOS Simulator,id=$DITE_SIM_ID" -derivedDataPath .build/simulator \
  -resultBundlePath .build/SimulatorTests.xcresult -parallel-testing-enabled NO \
  CODE_SIGNING_ALLOWED=NO test 2>&1 | tee .build/logs/simulator-tests.log

# XCTest attachments retain each tested screen; this is the final simulator frame.
xcrun simctl io "$DITE_SIM_ID" screenshot .build/simulator-final.png
ditto -c -k --sequesterRsrc --keepParent .build/simulator/Build/Products/Debug-iphonesimulator/DITE.app .build/DITE-simulator.zip
