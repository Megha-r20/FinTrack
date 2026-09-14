const QUEUE_KEY = "fintrack_offline_transactions_queue";

export function getOfflineQueue() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineTransaction(txData) {
  if (typeof window === "undefined") return;
  const current = getOfflineQueue();
  current.push({
    ...txData,
    offlineId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(current));
}

export function clearOfflineQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

export async function syncOfflineQueue(onSuccessItem) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let syncedCount = 0;
  const remainingQueue = [];

  for (const item of queue) {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        syncedCount++;
        if (onSuccessItem) onSuccessItem(item);
      } else {
        remainingQueue.push(item);
      }
    } catch {
      remainingQueue.push(item);
    }
  }

  if (remainingQueue.length === 0) {
    clearOfflineQueue();
  } else {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
  }

  return syncedCount;
}
