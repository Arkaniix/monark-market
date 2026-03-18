import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, getAccessToken } from "@/lib/api/client";
import type { ScraperInfo } from "@/types/admin";

const MAX_LOG_LINES = 500;
const MAX_RECONNECT_DELAY = 30000;

interface WsMessage {
  type: string;
  scrapers?: Record<string, ScraperInfo>;
  logs?: { scraper: string; lines: string[] };
}

export function useScraperWebSocket() {
  const [scrapers, setScrapers] = useState<Record<string, ScraperInfo>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(1000);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const unmounted = useRef(false);

  const connect = useCallback(() => {
    if (unmounted.current) return;
    const token = getAccessToken();
    if (!token) return;

    const wsBase = API_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsBase}/v1/admin/scrapers/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmounted.current) { ws.close(); return; }
      setConnected(true);
      reconnectDelay.current = 1000;
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        if (msg.type === "progress" && msg.scrapers) {
          setScrapers(msg.scrapers);
        }
        if (msg.logs?.lines?.length) {
          setLogs((prev) => {
            const next = [...prev, ...msg.logs!.lines];
            return next.length > MAX_LOG_LINES ? next.slice(-MAX_LOG_LINES) : next;
          });
        }
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
      if (!unmounted.current) {
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, MAX_RECONNECT_DELAY);
          connect();
        }, reconnectDelay.current);
      }
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const watchLogs = useCallback((scraperName: string) => {
    setLogs([]);
    send({ action: "watch_logs", scraper: scraperName });
  }, [send]);

  const unwatchLogs = useCallback(() => {
    send({ action: "unwatch_logs" });
  }, [send]);

  return { scrapers, logs, connected, watchLogs, unwatchLogs };
}
