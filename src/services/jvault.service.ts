import { DataBin, UsersBin, ChatBin } from "@/types";

const BASE_URL = process.env.JVAULT_BASE_URL || "https://jvault.aerialstudio.tech";
const API_KEY = process.env.JVAULT_API_KEY || "";
const DATA_BIN_ID = process.env.JVAULT_DATA_BIN_ID || "a3b993fe-3f68-445b-87b6-3fec8dd4e113";
const USERS_BIN_ID = process.env.JVAULT_USERS_BIN_ID || "3f60815f-5d45-4bdc-a8e6-a1ebabd65aad";
const CHAT_BIN_ID = process.env.JVAULT_CHAT_BIN_ID || "3793c393-7bc4-4415-8df0-aac78b94c53e";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
}

function binUrl(binId: string) {
  return `${BASE_URL}/api/bins/${binId}`;
}

// ── helpers: fast timeout + cache ──
const FETCH_TIMEOUT_MS = 3500;
let warnedOnce = false;
function warnOnce(msg: string, err: unknown) {
  if (!warnedOnce) {
    console.warn(msg, err instanceof Error ? err.message : String(err));
    warnedOnce = true;
  }
}
async function fetchWithTimeout(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = FETCH_TIMEOUT_MS, ...rest } = init as any;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...rest, signal: controller.signal } as any);
    return res;
  } finally {
    clearTimeout(t);
  }
}

// simple in-memory cache with TTL to avoid hammering JVault on timeout
let cacheData: { at: number; value: DataBin } | null = null;
let cacheUsers: { at: number; value: UsersBin } | null = null;
let cacheChat: { at: number; value: ChatBin } | null = null;
const CACHE_TTL_MS = 4000;

// fallback in-memory when JVault unavailable (dev without key or timeout)
let memoryData: DataBin | null = null;
let memoryUsers: UsersBin | null = null;
let memoryChat: ChatBin | null = null;

function defaultDataBin(): DataBin {
  return {
    reports: [],
    reportTips: [],
    notifications: [],
    savedReports: [],
    flags: [],
    categories: [],
    auditLogs: [],
  };
}
function defaultUsersBin(): UsersBin {
  return { users: [] };
}
function defaultChatBin(): ChatBin {
  return { conversations: [], messages: [] };
}

export async function getDataBin(): Promise<DataBin> {
  if (!API_KEY) {
    if (!memoryData) memoryData = defaultDataBin();
    return memoryData;
  }
  if (cacheData && Date.now() - cacheData.at < CACHE_TTL_MS) return cacheData.value;
  try {
    const res = await fetchWithTimeout(binUrl(DATA_BIN_ID), { headers: headers(), cache: "no-store" });
    if (!res.ok) throw new Error(`JVault DataBin fetch failed ${res.status}`);
    const json = await res.json();
    const data = json.data ?? json;
    const value: DataBin = {
      reports: data.reports ?? [],
      reportTips: data.reportTips ?? [],
      notifications: data.notifications ?? [],
      savedReports: data.savedReports ?? [],
      flags: data.flags ?? [],
      categories: data.categories ?? [],
      auditLogs: data.auditLogs ?? [],
    };
    // keep memory & cache in sync
    memoryData = value;
    cacheData = { at: Date.now(), value };
    return value;
  } catch (e) {
    warnOnce("[jvault] getDataBin fallback to memory (JVault timeout/unreachable)", e);
    if (memoryData) {
      cacheData = { at: Date.now(), value: memoryData };
      return memoryData;
    }
    if (!memoryData) memoryData = defaultDataBin();
    cacheData = { at: Date.now(), value: memoryData };
    return memoryData;
  }
}

export async function getUsersBin(): Promise<UsersBin> {
  if (!API_KEY) {
    if (!memoryUsers) memoryUsers = defaultUsersBin();
    return memoryUsers;
  }
  if (cacheUsers && Date.now() - cacheUsers.at < CACHE_TTL_MS) return cacheUsers.value;
  try {
    const res = await fetchWithTimeout(binUrl(USERS_BIN_ID), { headers: headers(), cache: "no-store" });
    if (!res.ok) throw new Error(`JVault UsersBin fetch failed ${res.status}`);
    const json = await res.json();
    const data = json.data ?? json;
    const value: UsersBin = { users: data.users ?? [] };
    memoryUsers = value;
    cacheUsers = { at: Date.now(), value };
    return value;
  } catch (e) {
    warnOnce("[jvault] getUsersBin fallback to memory", e);
    if (memoryUsers) {
      cacheUsers = { at: Date.now(), value: memoryUsers };
      return memoryUsers;
    }
    if (!memoryUsers) memoryUsers = defaultUsersBin();
    cacheUsers = { at: Date.now(), value: memoryUsers };
    return memoryUsers;
  }
}

export async function updateDataBin(data: DataBin): Promise<void> {
  memoryData = data;
  cacheData = { at: Date.now(), value: data };
  if (!API_KEY) return;
  try {
    const res = await fetchWithTimeout(binUrl(DATA_BIN_ID), {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`updateDataBin failed ${res.status} ${t}`);
    }
  } catch (e) {
    warnOnce("[jvault] updateDataBin kept in memory (JVault unreachable)", e);
    // keep in memory, don't throw to keep app responsive
  }
}

export async function updateUsersBin(data: UsersBin): Promise<void> {
  memoryUsers = data;
  cacheUsers = { at: Date.now(), value: data };
  if (!API_KEY) return;
  try {
    const res = await fetchWithTimeout(binUrl(USERS_BIN_ID), {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`updateUsersBin failed ${res.status} ${t}`);
    }
  } catch (e) {
    warnOnce("[jvault] updateUsersBin kept in memory", e);
  }
}

// PATCH merge partial object
export async function mergeData(partial: Partial<DataBin>) {
  if (!API_KEY) {
    const curr = await getDataBin();
    const merged = { ...curr, ...partial };
    memoryData = merged as DataBin;
    cacheData = { at: Date.now(), value: memoryData };
    return merged;
  }
  try {
    const res = await fetchWithTimeout(`${binUrl(DATA_BIN_ID)}?action=merge`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(partial),
    });
    if (!res.ok) throw new Error(`mergeData failed ${res.status}`);
    return res.json();
  } catch (e) {
    warnOnce("[jvault] mergeData fallback to memory", e);
    const curr = await getDataBin();
    const merged = { ...curr, ...partial };
    memoryData = merged as DataBin;
    cacheData = { at: Date.now(), value: memoryData };
    return merged;
  }
}

export async function mergeUsers(partial: Partial<UsersBin>) {
  if (!API_KEY) {
    const curr = await getUsersBin();
    const merged = { ...curr, ...partial };
    memoryUsers = merged as UsersBin;
    cacheUsers = { at: Date.now(), value: memoryUsers };
    return merged;
  }
  try {
    const res = await fetchWithTimeout(`${binUrl(USERS_BIN_ID)}?action=merge`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(partial),
    });
    if (!res.ok) throw new Error(`mergeUsers failed ${res.status}`);
    return res.json();
  } catch (e) {
    warnOnce("[jvault] mergeUsers fallback to memory", e);
    const curr = await getUsersBin();
    const merged = { ...curr, ...partial };
    memoryUsers = merged as UsersBin;
    cacheUsers = { at: Date.now(), value: memoryUsers };
    return merged;
  }
}

// Generic helpers using read-modify-write
export async function setValue<T extends keyof DataBin>(key: T, value: DataBin[T]) {
  const bin = await getDataBin();
  (bin as any)[key] = value;
  await updateDataBin(bin);
}

export async function pushValue<T extends keyof DataBin>(key: T, item: any) {
  const bin = await getDataBin();
  const arr = (bin[key] as any[]) ?? [];
  arr.push(item);
  (bin as any)[key] = arr;
  await updateDataBin(bin);
  return bin;
}

export async function removeValue<T extends keyof DataBin>(key: T, predicate: (item: any) => boolean) {
  const bin = await getDataBin();
  const arr = (bin[key] as any[]) ?? [];
  (bin as any)[key] = arr.filter((x) => !predicate(x));
  await updateDataBin(bin);
  return bin;
}

export async function popValue<T extends keyof DataBin>(key: T, predicate?: (item: any) => boolean) {
  const bin = await getDataBin();
  let arr = (bin[key] as any[]) ?? [];
  if (predicate) arr = arr.filter((x) => !predicate(x));
  else arr.pop();
  (bin as any)[key] = arr;
  await updateDataBin(bin);
  return bin;
}

export async function incrementValue(key: string, amount = 1) {
  const bin = await getDataBin();
  const current = (bin as any)[key] ?? 0;
  (bin as any)[key] = current + amount;
  await updateDataBin(bin);
}

// ── Chat BIN ── (NO cache for real-time: always fresh, fallback to memory)
export async function getChatBin(): Promise<ChatBin> {
  if (!API_KEY) {
    if (!memoryChat) memoryChat = defaultChatBin();
    return memoryChat;
  }
  // If memory already exists, race: try JVault quickly but return memory immediately on timeout
  // We keep a very short cache (800ms) only to avoid hammering, but polling will be 1.5s so this is near-realtime
  const CHAT_CACHE_TTL = 800;
  if (cacheChat && Date.now() - cacheChat.at < CHAT_CACHE_TTL) return cacheChat.value;
  try {
    let res = await fetchWithTimeout(binUrl(CHAT_BIN_ID), { headers: headers(), cache: "no-store", timeoutMs: 2000 } as any);
    if (!res.ok) {
      res = await fetchWithTimeout(`${BASE_URL}/api?bin_id=${CHAT_BIN_ID}`, { headers: headers(), cache: "no-store", timeoutMs: 2000 } as any);
      if (!res.ok) throw new Error(`ChatBin fetch failed ${res.status}`);
    }
    const json = await res.json();
    const data = json.data ?? json;
    const value: ChatBin = {
      conversations: data.conversations ?? [],
      messages: data.messages ?? [],
    };
    // merge with memory if JVault is stale (keep newer memory)
    if (memoryChat && memoryChat.messages.length > value.messages.length) {
      // JVault behind memory (offline mode), keep memory
      cacheChat = { at: Date.now(), value: memoryChat };
      return memoryChat;
    }
    memoryChat = value;
    cacheChat = { at: Date.now(), value };
    return value;
  } catch (e) {
    warnOnce("[jvault] getChatBin fallback to memory", e);
    if (memoryChat) {
      cacheChat = { at: Date.now(), value: memoryChat };
      return memoryChat;
    }
    if (!memoryChat) memoryChat = defaultChatBin();
    cacheChat = { at: Date.now(), value: memoryChat };
    return memoryChat;
  }
}

export async function updateChatBin(data: ChatBin): Promise<void> {
  memoryChat = data;
  cacheChat = { at: Date.now(), value: data };
  if (!API_KEY) return;
  try {
    let res = await fetchWithTimeout(binUrl(CHAT_BIN_ID), {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      res = await fetchWithTimeout(`${BASE_URL}/api?bin_id=${CHAT_BIN_ID}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`updateChatBin failed ${res.status} ${t}`);
      }
    }
  } catch (e) {
    warnOnce("[jvault] updateChatBin kept in memory (JVault unreachable)", e);
  }
}
