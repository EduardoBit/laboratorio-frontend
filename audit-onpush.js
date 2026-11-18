const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function applyOnPush(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('ChangeDetectionStrategy.OnPush')) {
        console.log('[SKIPPED] Already OnPush: ' + filePath);
        return true;
    }

    if (!content.includes('ChangeDetectionStrategy')) {
        content = content.replace(/import \{([^}]+)\} from '@angular\/core';/, (match, p1) => {
            if (!p1.includes('ChangeDetectionStrategy')) {
                return 'import { ' + p1.trim() + ', ChangeDetectionStrategy } from \'@angular/core\';';
            }
            return match;
        });
    }

    content = content.replace(/@Component\(\{([\s\S]*?)\}\)/, (match, p1) => {
        if (!p1.includes('changeDetection:')) {
            return '@Component({' + p1.replace(/\s*$/, '') + ',\n  changeDetection: ChangeDetectionStrategy.OnPush\n})';
        }
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[APPLIED] OnPush added to: ' + filePath);
    return true;
}

function auditFeatureComponent(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const suspectAssignmentRegex = /\.subscribe\(\s*\{[\s\S]*?this\.([a-zA-Z0-9_]+)\s*=/g;
    
    let match;
    let suspicious = false;
    while ((match = suspectAssignmentRegex.exec(content)) !== null) {
        console.log('[WARNING] Suspicious normal assignment in subscribe found in ' + filePath + ': this.' + match[1]);
        suspicious = true;
    }

    if (!suspicious) {
        applyOnPush(filePath);
    } else {
        console.log('[MANUAL REVIEW REQUIRED] ' + filePath);
    }
}

console.log("--- 1. APPLYING ONPUSH TO SHARED ---");
walkDir('src/app/shared/components', (file) => {
    if (file.endsWith('.component.ts')) applyOnPush(file);
});

console.log("\n--- 2. APPLYING ONPUSH TO LAYOUT ---");
walkDir('src/app/layout', (file) => {
    if (file.endsWith('.component.ts')) applyOnPush(file);
});

console.log("\n--- 3. AUDITING & APPLYING ONPUSH TO FEATURES ---");
walkDir('src/app/features', (file) => {
    if (file.endsWith('.component.ts')) {
        auditFeatureComponent(file);
    }
});
