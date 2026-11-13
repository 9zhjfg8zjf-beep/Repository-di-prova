#!/usr/bin/env python3
"""Generate the dependency-free Xcode project deterministically; --check is read-only."""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def identifier(name):
    return hashlib.sha256(name.encode()).hexdigest()[:24].upper()


def render(value, level=0):
    indent = "\t" * level
    if isinstance(value, dict):
        return "{\n" + "".join("\t" * (level + 1) + render(key) + " = " + render(item, level + 1) + ";\n" for key, item in value.items()) + indent + "}"
    if isinstance(value, list):
        return "(\n" + "".join("\t" * (level + 1) + render(item, level + 1) + ",\n" for item in value) + indent + ")"
    text = str(value)
    return text if re.fullmatch(r"[A-Za-z0-9_./]+", text) else json.dumps(text)


def project():
    objects = {}

    def add(identity, isa, **values):
        key = identifier(identity)
        assert key not in objects, identity
        objects[key] = {"isa": isa, **values}
        return key

    project_id = identifier("project")
    target_ids = {name: identifier("target:" + name) for name in ("DITE", "DITETests", "DITEUITests")}
    config_file = add("config:Development", "PBXFileReference", lastKnownFileType="text.xcconfig", path="Config/Development.xcconfig", sourceTree="<group>")
    groups = []
    products = []
    targets = []

    for name in ("DITE", "DITETests", "DITEUITests"):
        files = []
        sources = []
        resources = []
        for path in sorted((ROOT / "ios" / name).glob("*.swift")):
            ref = add("file:" + name + "/" + path.name, "PBXFileReference", lastKnownFileType="sourcecode.swift", path=path.name, sourceTree="<group>")
            files.append(ref)
            sources.append(add("source:" + name + "/" + path.name, "PBXBuildFile", fileRef=ref))
        if name == "DITE":
            for path, kind, bundled in [("Info.plist", "text.plist.xml", False), ("PrivacyInfo.xcprivacy", "text.xml", True),
                                         ("Assets.xcassets", "folder.assetcatalog", True), ("Resources/Game", "folder", True)]:
                ref = add("file:" + path, "PBXFileReference", lastKnownFileType=kind, path=path, sourceTree="<group>")
                files.append(ref)
                if bundled:
                    resources.append(add("resource:" + path, "PBXBuildFile", fileRef=ref))
        groups.append(add("group:" + name, "PBXGroup", children=files, path=name, sourceTree="<group>"))
        product = add("product:" + name, "PBXFileReference", explicitFileType="wrapper.application" if name == "DITE" else "wrapper.cfbundle",
                      includeInIndex=0, path=name + (".app" if name == "DITE" else ".xctest"), sourceTree="BUILT_PRODUCTS_DIR")
        products.append(product)
        phases = [add("sources:" + name, "PBXSourcesBuildPhase", buildActionMask=2147483647, files=sources, runOnlyForDeploymentPostprocessing=0),
                  add("frameworks:" + name, "PBXFrameworksBuildPhase", buildActionMask=2147483647, files=[], runOnlyForDeploymentPostprocessing=0),
                  add("resources:" + name, "PBXResourcesBuildPhase", buildActionMask=2147483647, files=resources, runOnlyForDeploymentPostprocessing=0)]
        settings = {"PRODUCT_NAME": "$(TARGET_NAME)", "SUPPORTED_PLATFORMS": "iphoneos iphonesimulator", "TARGETED_DEVICE_FAMILY": "1,2",
                    "SWIFT_EMIT_LOC_STRINGS": "NO", "GENERATE_INFOPLIST_FILE": "YES", "CODE_SIGN_STYLE": "Automatic"}
        if name == "DITE":
            settings.update({"INFOPLIST_FILE": "DITE/Info.plist", "GENERATE_INFOPLIST_FILE": "NO",
                             "ASSETCATALOG_COMPILER_APPICON_NAME": "AppIcon", "ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS": "NO",
                             "LD_RUNPATH_SEARCH_PATHS": ["$(inherited)", "@executable_path/Frameworks"]})
        else:
            settings.update({"PRODUCT_BUNDLE_IDENTIFIER": "$(DITE_BUNDLE_IDENTIFIER)." + name.lower(),
                             "LD_RUNPATH_SEARCH_PATHS": ["$(inherited)", "@executable_path/Frameworks", "@loader_path/Frameworks"]})
            if name == "DITETests":
                settings.update({"TEST_HOST": "$(BUILT_PRODUCTS_DIR)/DITE.app/DITE", "BUNDLE_LOADER": "$(TEST_HOST)"})
            else:
                settings["TEST_TARGET_NAME"] = "DITE"
        configs = []
        for variant in ("Debug", "Release"):
            configs.append(add("config:" + name + variant, "XCBuildConfiguration", baseConfigurationReference=config_file, buildSettings=settings.copy(), name=variant))
        config_list = add("configs:" + name, "XCConfigurationList", buildConfigurations=configs, defaultConfigurationIsVisible=0, defaultConfigurationName="Release")
        dependencies = []
        if name != "DITE":
            proxy = add("proxy:" + name, "PBXContainerItemProxy", containerPortal=project_id, proxyType=1, remoteGlobalIDString=target_ids["DITE"], remoteInfo="DITE")
            dependencies.append(add("dependency:" + name, "PBXTargetDependency", target=target_ids["DITE"], targetProxy=proxy))
        product_type = {"DITE": "com.apple.product-type.application", "DITETests": "com.apple.product-type.bundle.unit-test", "DITEUITests": "com.apple.product-type.bundle.ui-testing"}[name]
        targets.append(add("target:" + name, "PBXNativeTarget", buildConfigurationList=config_list, buildPhases=phases, buildRules=[],
                           dependencies=dependencies, name=name, productName=name, productReference=product, productType=product_type))

    product_group = add("group:products", "PBXGroup", children=products, name="Products", sourceTree="<group>")
    main_group = add("group:main", "PBXGroup", children=[config_file] + groups + [product_group], sourceTree="<group>")
    configs = []
    for variant in ("Debug", "Release"):
        settings = {"CLANG_ENABLE_MODULES": "YES", "CLANG_ENABLE_OBJC_ARC": "YES", "SDKROOT": "iphoneos",
                    "IPHONEOS_DEPLOYMENT_TARGET": "17.0", "SWIFT_VERSION": "5.0", "SWIFT_STRICT_CONCURRENCY": "targeted",
                    "ENABLE_USER_SCRIPT_SANDBOXING": "YES", "GCC_C_LANGUAGE_STANDARD": "gnu17"}
        if variant == "Debug":
            settings.update({"DEBUG_INFORMATION_FORMAT": "dwarf", "ENABLE_TESTABILITY": "YES", "ONLY_ACTIVE_ARCH": "YES",
                             "SWIFT_ACTIVE_COMPILATION_CONDITIONS": "DEBUG $(inherited)", "SWIFT_OPTIMIZATION_LEVEL": "-Onone"})
        else:
            settings.update({"DEBUG_INFORMATION_FORMAT": "dwarf-with-dsym", "SWIFT_COMPILATION_MODE": "wholemodule", "SWIFT_OPTIMIZATION_LEVEL": "-O"})
        configs.append(add("config:project" + variant, "XCBuildConfiguration", buildSettings=settings, name=variant))
    config_list = add("configs:project", "XCConfigurationList", buildConfigurations=configs, defaultConfigurationIsVisible=0, defaultConfigurationName="Release")
    add("project", "PBXProject", attributes={"BuildIndependentTargetsInParallel": "YES", "LastUpgradeCheck": "2660",
         "TargetAttributes": {target_ids[name]: {"CreatedOnToolsVersion": "26.6"} for name in target_ids}}, buildConfigurationList=config_list,
         compatibilityVersion="Xcode 14.0", developmentRegion="it", hasScannedForEncodings=0, knownRegions=["it", "en", "Base"],
         mainGroup=main_group, productRefGroup=product_group, projectDirPath="", projectRoot="", targets=targets)
    return "// !$*UTF8*$!\n// Generated by scripts/ios_project.py; regenerate after adding native source files.\n" + render({"archiveVersion": 1, "classes": {}, "objectVersion": 56, "objects": objects, "rootObject": project_id}) + "\n"


def scheme():
    def ref(name):
        product = name + (".app" if name == "DITE" else ".xctest")
        return f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{identifier("target:" + name)}" BuildableName="{product}" BlueprintName="{name}" ReferencedContainer="container:DITE.xcodeproj"/>'
    builds = "\n".join(f'<BuildActionEntry buildForTesting="YES" buildForRunning="{yes}" buildForProfiling="{yes}" buildForArchiving="{yes}" buildForAnalyzing="{yes}">{ref(name)}</BuildActionEntry>' for name, yes in [("DITE", "YES"), ("DITETests", "NO"), ("DITEUITests", "NO")])
    tests = "\n".join(f'<TestableReference skipped="NO" parallelizable="NO">{ref(name)}</TestableReference>' for name in ("DITETests", "DITEUITests"))
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2660" version="1.3">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries>{builds}</BuildActionEntries></BuildAction>
  <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES" codeCoverageEnabled="YES"><Testables>{tests}</Testables></TestAction>
  <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugServiceExtension="internal" allowLocationSimulation="NO"><BuildableProductRunnable runnableDebuggingMode="0">{ref("DITE")}</BuildableProductRunnable></LaunchAction>
  <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugServiceExtension="internal"><BuildableProductRunnable runnableDebuggingMode="0">{ref("DITE")}</BuildableProductRunnable></ProfileAction>
  <AnalyzeAction buildConfiguration="Debug"/>
  <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    outputs = {"ios/DITE.xcodeproj/project.pbxproj": project(),
               "ios/DITE.xcodeproj/xcshareddata/xcschemes/DITE.xcscheme": scheme(),
               "ios/DITE.xcodeproj/project.xcworkspace/contents.xcworkspacedata": '<?xml version="1.0" encoding="UTF-8"?>\n<Workspace version="1.0"><FileRef location="self:"></FileRef></Workspace>\n'}
    for name, content in outputs.items():
        path = ROOT / name
        if args.check:
            if not path.is_file() or path.read_text() != content:
                print("Xcode project is stale: run python3 scripts/ios_project.py", file=sys.stderr)
                return 1
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    print("Xcode project " + ("checked" if args.check else "generated") + "; native build/test still requires Xcode")
    return 0


if __name__ == "__main__":
    sys.exit(main())
