/**
 * Type definitions for n8n-workflow-builder
 */

declare module 'n8n-workflow-builder' {
  /**
   * Options for pushing workflows to n8n
   */
  export interface PushOptions {
    /**
     * The folder containing workflow files to push
     */
    folder: string;
    
    /**
     * If true, runs in dry-run mode (no actual changes made)
     */
    dryRun?: boolean;
  }

  /**
   * Pulls workflow data from n8n and stores locally
   * @param folder The folder to store workflows in
   */
  export function pull(folder: string): Promise<void>;

  /**
   * Pushes local workflow files to n8n
   * @param opts Push options
   */
  export function push(opts?: PushOptions): Promise<void>;
} 