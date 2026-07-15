export interface AutoSortResult {
    totalFiles: number;
    filesOrganized: number;
    categoriesUsed: string[];
    spaceSaved: number;
    duration: number;
    errors: string[];
    fileMovements?: Array<{
        fileName: string;
        targetFolder: string;
        reason: string;
    }>;
}
export declare class AutoSortCore {
    private fsManager;
    private mlClassifier;
    private isRunning;
    private dryRunActive;
    constructor();
    autoSortDirectory(sourcePath: string, options?: {
        dryRun?: boolean;
        useML?: boolean;
        rules?: any[];
        organizeBy?: 'category' | 'date' | 'type' | 'size';
    }): Promise<AutoSortResult>;
    /**
     * Preview AutoSort without making any filesystem changes.
     * Returns the same shape as autoSortDirectory but guarantees no moves.
     */
    previewAutoSort(sourcePath: string, options?: {
        useML?: boolean;
        rules?: any[];
        organizeBy?: 'category' | 'date' | 'type' | 'size';
    }): Promise<AutoSortResult>;
    private classifyFiles;
    private classifyByRules;
    private organizeFiles;
    private groupFilesByCategory;
    private formatCategoryName;
    getAutoSortPreview(sourcePath: string): Promise<any>;
    stopAutoSort(): void;
    isAutoSortRunning(): boolean;
}
