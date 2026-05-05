const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function patchFile(filePath, replacements) {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`[Fix-Realm] Skipping ${filePath} (File not found)`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    replacements.forEach(({ search, replace }) => {
        if (content.includes(search)) {
            content = content.split(search).join(replace);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[Fix-Realm] Patched ${filePath}`);
    } else {
        console.log(`[Fix-Realm] No changes needed for ${filePath}`);
    }
}

console.log('[Fix-Realm] Starting build fixes for React Native 0.79 compatibility...');

// 1. Fix Android CMake targets (RN 0.79 uses ReactAndroid::reactnative)
patchFile('node_modules/realm/binding/android/CMakeLists.txt', [
    { search: 'ReactAndroid::react_nativejni', replace: 'ReactAndroid::reactnative' },
    { search: 'ReactAndroid::reactnativejni', replace: 'ReactAndroid::reactnative' },
    { search: 'ReactAndroid::turbomodule_jsijni', replace: '' },
    { search: 'ReactAndroid::turbomodulejsijni', replace: '' }
]);

// 2. Fix iOS/JSI invokeAsync signature for RN 0.79
patchFile('node_modules/realm/binding/jsi/react_scheduler.cpp', [
    { 
        search: 'using Scheduler = realm::util::Scheduler;', 
        replace: 'using Scheduler = realm::util::Scheduler;\nnamespace jsi = facebook::jsi;' 
    },
    { 
        search: 'facebook::react::SchedulerPriority::NormalPriority, [ptr = func.release()] {', 
        replace: 'facebook::react::SchedulerPriority::NormalPriority, [ptr = func.release()](jsi::Runtime&) {' 
    }
]);

console.log('[Fix-Realm] Done!');
