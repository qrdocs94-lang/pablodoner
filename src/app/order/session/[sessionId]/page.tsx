"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OrderSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const lookup = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .in("status", ["paid", "preparing", "ready"])
        .maybeSingle();

      if (data?.id) {
        router.replace(`/order/${data.id}`);
        return;
      }

      setAttempts(a => {
        const next = a + 1;
        if (next >= 15) {
          setError(true);
        }
        return next;
      });
    };

    if (attempts < 15 && !error) {
      const timer = setTimeout(lookup, attempts === 0 ? 500 : 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, attempts, error, router]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Bestellung nicht gefunden</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Die Zahlung wurde möglicherweise nicht abgeschlossen.</p>
          <a href="/" style={{ background: '#C0392B', color: 'white', padding: '12px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>
            Zurück zur Speisekarte
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 52, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Zahlung wird bestätigt...</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Bitte warte einen Moment.</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
