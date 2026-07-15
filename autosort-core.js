"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoSortCore = void 0;
const filesystem_1 = require("./filesystem");
const ml_classifier_1 = require("./ml-classifier");
class AutoSortCore {
    constructor() {
        this.isRunning = false;
        this.dryRunActive = false;
        this.fsManager = new filesystem_1.FileSystemManager();
        this.mlClassifier = new ml_classifier_1.MLClassifier();
    }
    async autoSortDirectory(sourcePath, options = {}) {
        this.isRunning = true;
        this.dryRunActive = Boolean(options.dryRun);
        // Propagate dry-run to FileSystemManager to guard all mutating operations,
        // but preserve any existing global dry-run flag set externally.
        const fsCtor = this.fsManager.constructor;
        const previousGlobalDryRun = Boolean(fsCtor.dryRunEnabled);
        fsCtor.dryRunEnabled = previousGlobalDryRun || Boolean(options.dryRun);
        const startTime = Date.now();
        const result = {
            totalFiles: 0,
            filesOrganized: 0,
            categoriesUsed: [],
            spaceSaved: 0,
            duration: 0,
            errors: [],
            fileMovements: []
        };
        try {
            // Server-side guard: do not allow a real run when there are no enabled rules and ML is disabled
            const providedRules = Array.isArray(options.rules) ? options.rules : [];
            if (!options.dryRun && !options.useML && providedRules.length === 0) {
                throw new Error('No sorting rules enabled and AI is disabled. Enable a rule or enable AI to perform a real sort.');
            }
            // 1. Scan directory for files
            console.log(`🔍 Scanning directory: ${sourcePath}`);
            const files = await this.fsManager.scanDirectory(sourcePath);
            const fileItems = files.filter(file => file.type === 'file');
            result.totalFiles = fileItems.length;
            console.log(`📁 Found ${fileItems.length} files to organize`);
            // 2. Classify files using ML or rules
            const organizedFiles = await this.classifyFiles(fileItems, options);
            // 3. Record file movements
            result.fileMovements = organizedFiles.map(f => ({
                fileName: f.name,
                targetFolder: this.formatCategoryName(f.category),
                reason: options.useML ? 'ML Classification' : 'Rule-based Classification'
            }));
            // 4. Organize files into folder structure (only if not dryRun)
            if (!options.dryRun) {
                await this.organizeFiles(organizedFiles, sourcePath, options.organizeBy || 'category');
            }
            result.filesOrganized = organizedFiles.length;
            result.categoriesUsed = [...new Set(organizedFiles.map(f => f.category))];
            result.duration = Date.now() - startTime;
            console.log(`✅ AutoSort completed: ${result.filesOrganized} files organized in ${result.duration}ms`);
        }
        catch (error) {
            result.errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
            console.error('❌ AutoSort error:', error);
        }
        finally {
            this.isRunning = false;
            this.dryRunActive = false;
            // Restore previous global dry-run flag (do not unconditionally clear)
            try {
                const fsCtor = this.fsManager.constructor;
                fsCtor.dryRunEnabled = previousGlobalDryRun;
            }
            catch (e) {
                // ignore restore errors
            }
        }
        return result;
    }
    /**
     * Preview AutoSort without making any filesystem changes.
     * Returns the same shape as autoSortDirectory but guarantees no moves.
     */
    async previewAutoSort(sourcePath, options = {}) {
        const startTime = Date.now();
        const result = {
            totalFiles: 0,
            filesOrganized: 0,
            categoriesUsed: [],
            spaceSaved: 0,
            duration: 0,
            errors: [],
            fileMovements: []
        };
        try {
            const files = await this.fsManager.scanDirectory(sourcePath);
            const fileItems = files.filter(file => file.type === 'file');
            result.totalFiles = fileItems.length;
            const organizedFiles = await this.classifyFiles(fileItems, options);
            result.fileMovements = organizedFiles.map(f => ({
                fileName: f.name,
                targetFolder: this.formatCategoryName(f.category),
                reason: options.useML ? 'ML Classification' : 'Rule-based Classification'
            }));
            result.filesOrganized = organizedFiles.length;
            result.categoriesUsed = [...new Set(organizedFiles.map(f => f.category))];
            result.duration = Date.now() - startTime;
            return result;
        }
        catch (err) {
            result.errors.push(err instanceof Error ? err.message : String(err));
            return result;
        }
    }
    async classifyFiles(files, options) {
        const organizedFiles = [];
        for (const file of files) {
            try {
                let category;
                let confidence;
                if (options.useML) {
                    // Use ML classification
                    const mlResult = await this.mlClassifier.classifyFile(file);
                    category = mlResult.category;
                    confidence = mlResult.confidence;
                }
                else {
                    // Use rule-based classification
                    const ruleResult = this.classifyByRules(file, options.rules);
                    // If ruleResult returns null category, it means no custom rule matched and we should skip this file
                    if (!ruleResult || ruleResult.category === null) {
                        // skip files that don't match any enabled custom rule
                        continue;
                    }
                    category = ruleResult.category;
                    confidence = ruleResult.confidence;
                }
                organizedFiles.push({
                    ...file,
                    category,
                    confidence
                });
            }
            catch (error) {
                console.warn(`⚠️ Could not classify file: ${file.name}`, error);
            }
        }
        return organizedFiles;
    }
    classifyByRules(file, rules = []) {
        // Default classification rules
        const defaultRules = [
            {
                category: 'documents',
                extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
                confidence: 0.95
            },
            {
                category: 'spreadsheets',
                extensions: ['.xlsx', '.xls', '.csv'],
                confidence: 0.95
            },
            {
                category: 'presentations',
                extensions: ['.ppt', '.pptx'],
                confidence: 0.95
            },
            {
                category: 'images',
                extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
                confidence: 0.95
            },
            {
                category: 'music',
                extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
                confidence: 0.95
            },
            {
                category: 'ebooks',
                extensions: ['.epub', '.mobi', '.azw', '.azw3'],
                confidence: 0.95
            },
            {
                category: 'video',
                extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
                confidence: 0.95
            },
            {
                category: 'archives',
                extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
                confidence: 0.95
            },
            {
                category: 'code',
                extensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rb', '.sh', '.html', '.css'],
                confidence: 0.9
            },
            {
                category: 'executable',
                extensions: ['.exe', '.msi', '.bat', '.bin'],
                confidence: 0.9
            },
            // any further rules can be appended
        ];
        // Normalize incoming rules (renderer sends rules with `conditions`; legacy expects `extensions`)
        const normalize = (r) => {
            try {
                if (!r)
                    return null;
                // If rule already has `extensions`, use it
                if (Array.isArray(r.extensions) && r.extensions.length > 0) {
                    return { category: r.category, extensions: r.extensions.map((e) => e.toLowerCase()), confidence: r.confidence || 0.9 };
                }
                // If rule has `conditions`, extract extension-based conditions
                if (Array.isArray(r.conditions)) {
                    const exts = [];
                    for (const c of r.conditions) {
                        if (c && c.type === 'extension' && typeof c.value === 'string') {
                            const v = c.value.trim().toLowerCase();
                            // accept values like '.mp4' or 'mp4'
                            exts.push(v.startsWith('.') ? v : `.${v}`);
                        }
                    }
                    if (exts.length > 0)
                        return { category: r.category, extensions: exts, confidence: r.confidence || 0.9 };
                }
                return null;
            }
            catch (err) {
                return null;
            }
        };
        const customRules = (rules || []).map(normalize).filter((r) => r && Array.isArray(r.extensions) && r.extensions.length > 0);
        // If custom rules present, use only them; otherwise fall back to default rules
        const allRules = (customRules.length > 0) ? customRules : defaultRules;
        const extension = (file.extension || '').toLowerCase();
        for (const rule of allRules) {
            if (!rule || !Array.isArray(rule.extensions))
                continue;
            if (rule.extensions.includes(extension)) {
                return {
                    category: rule.category,
                    confidence: rule.confidence
                };
            }
        }
        // If customRules were provided, and none matched, return null category to indicate "no action"
        if (customRules.length > 0) {
            return { category: null, confidence: 0 };
        }
        // Fallback category for unknown files when using default rules
        return {
            category: 'other',
            confidence: 0.5
        };
    }
    async organizeFiles(files, sourcePath, organizeBy) {
        const categoryGroups = this.groupFilesByCategory(files, organizeBy);
        for (const [category, categoryFiles] of Object.entries(categoryGroups)) {
            const categoryPath = `${sourcePath}/${this.formatCategoryName(category)}`;
            // If dry-run is active (either via options or a global FS-level flag), do not perform any filesystem changes — just log what would happen
            const fsDryRun = (this.fsManager.constructor.dryRunEnabled) === true;
            if (this.dryRunActive || fsDryRun) {
                console.log(`🔎 (dry-run) Would create folder: ${categoryPath}`);
                for (const file of categoryFiles) {
                    console.log(`🔎 (dry-run) Would move ${file.name} to ${category}`);
                }
                continue;
            }
            // Create category directory if it doesn't exist
            await this.fsManager.createFolder(categoryPath);
            // Move files to category directory
            for (const file of categoryFiles) {
                try {
                    const newPath = `${categoryPath}/${file.name}`;
                    await this.fsManager.moveFile(file.path, newPath);
                    console.log(`📂 Moved ${file.name} to ${category}`);
                }
                catch (error) {
                    console.error(`❌ Failed to move ${file.name}:`, error);
                }
            }
        }
    }
    groupFilesByCategory(files, organizeBy) {
        const groups = {};
        for (const file of files) {
            let categoryKey;
            switch (organizeBy) {
                case 'date':
                    const date = new Date(file.modifiedAt);
                    categoryKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    break;
                case 'type':
                    categoryKey = file.extension.toLowerCase().replace('.', '') || 'no_extension';
                    break;
                case 'size':
                    if (file.size < 1024 * 1024)
                        categoryKey = 'small'; // < 1MB
                    else if (file.size < 1024 * 1024 * 10)
                        categoryKey = 'medium'; // < 10MB
                    else if (file.size < 1024 * 1024 * 100)
                        categoryKey = 'large'; // < 100MB
                    else
                        categoryKey = 'huge'; // >= 100MB
                    break;
                case 'category':
                default:
                    categoryKey = file.category;
                    break;
            }
            if (!groups[categoryKey]) {
                groups[categoryKey] = [];
            }
            groups[categoryKey].push(file);
        }
        return groups;
    }
    formatCategoryName(category) {
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    async getAutoSortPreview(sourcePath) {
        const files = await this.fsManager.scanDirectory(sourcePath);
        const fileItems = files.filter(file => file.type === 'file');
        const preview = {
            totalFiles: fileItems.length,
            proposedStructure: {},
            estimatedTime: Math.ceil(fileItems.length * 0.1), // 100ms per file estimate
            confidenceScore: 0
        };
        // Simulate classification to generate preview
        // Use a representative sample but ensure we report all target categories
        const sample = fileItems.slice(0, 100);
        const targetCategories = ['documents', 'images', 'music', 'video', 'archives', 'code', 'executable', 'spreadsheets', 'presentations', 'ebooks'];
        for (const c of targetCategories)
            preview.proposedStructure[c] = 0;
        for (const file of sample) {
            const result = this.classifyByRules(file);
            const cat = targetCategories.includes(result.category) ? result.category : 'other';
            preview.proposedStructure[cat] = (preview.proposedStructure[cat] || 0) + 1;
            preview.confidenceScore += result.confidence;
        }
        if (fileItems.length > 0) {
            preview.confidenceScore = preview.confidenceScore / Math.min(fileItems.length, 100);
        }
        return preview;
    }
    stopAutoSort() {
        this.isRunning = false;
    }
    isAutoSortRunning() {
        return this.isRunning;
    }
}
exports.AutoSortCore = AutoSortCore;
//# sourceMappingURL=autosort-core.js.map