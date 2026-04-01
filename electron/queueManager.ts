/**
 * Queue Manager for handling multiple downloads
 * Manages concurrent downloads with priority and pause/resume support
 */

export interface QueueItem {
  downloadId: string;
  url: string;
  formatId: string;
  outputPath: string;
  priority: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed';
  createdAt: number;
}

export class QueueManager {
  private queue: QueueItem[] = [];
  private maxConcurrent: number = 2;
  private activeDownloads: Set<string> = new Set();

  constructor(maxConcurrent: number = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add item to queue
   */
  enqueue(item: QueueItem): void {
    this.queue.push(item);
    this.sortQueue();
  }

  /**
   * Remove item from queue
   */
  dequeue(downloadId: string): QueueItem | undefined {
    const index = this.queue.findIndex((item) => item.downloadId === downloadId);
    if (index !== -1) {
      const [item] = this.queue.splice(index, 1);
      return item;
    }
    return undefined;
  }

  /**
   * Get next item to download
   */
  getNext(): QueueItem | undefined {
    const pending = this.queue.find((item) => item.status === 'pending');
    if (pending && this.activeDownloads.size < this.maxConcurrent) {
      pending.status = 'active';
      this.activeDownloads.add(pending.downloadId);
      return pending;
    }
    return undefined;
  }

  /**
   * Mark download as completed
   */
  markCompleted(downloadId: string): void {
    const item = this.queue.find((i) => i.downloadId === downloadId);
    if (item) {
      item.status = 'completed';
      this.activeDownloads.delete(downloadId);
    }
  }

  /**
   * Mark download as failed
   */
  markFailed(downloadId: string): void {
    const item = this.queue.find((i) => i.downloadId === downloadId);
    if (item) {
      item.status = 'failed';
      this.activeDownloads.delete(downloadId);
    }
  }

  /**
   * Pause a download
   */
  pause(downloadId: string): void {
    const item = this.queue.find((i) => i.downloadId === downloadId);
    if (item && item.status === 'active') {
      item.status = 'paused';
      this.activeDownloads.delete(downloadId);
    }
  }

  /**
   * Resume a paused download
   */
  resume(downloadId: string): void {
    const item = this.queue.find((i) => i.downloadId === downloadId);
    if (item && item.status === 'paused') {
      item.status = 'pending';
    }
  }

  /**
   * Sort queue by priority and creation time
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });
  }

  /**
   * Get all items in queue
   */
  getAll(): QueueItem[] {
    return [...this.queue];
  }

  /**
   * Get queue length
   */
  length(): number {
    return this.queue.length;
  }

  /**
   * Get active downloads count
   */
  getActiveCount(): number {
    return this.activeDownloads.size;
  }

  /**
   * Check if can start new download
   */
  canStartNew(): boolean {
    return this.activeDownloads.size < this.maxConcurrent;
  }

  /**
   * Clear completed and failed items
   */
  clearCompleted(): void {
    this.queue = this.queue.filter(
      (item) => item.status !== 'completed' && item.status !== 'failed'
    );
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.queue = [];
    this.activeDownloads.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter((i) => i.status === 'pending').length,
      active: this.activeDownloads.size,
      paused: this.queue.filter((i) => i.status === 'paused').length,
      completed: this.queue.filter((i) => i.status === 'completed').length,
      failed: this.queue.filter((i) => i.status === 'failed').length,
    };
  }
}

export default new QueueManager(2);
