'use client';

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { uploadCompanyLogo } from "@/lib/logo-storage";

type Participant = {
  id: number;
  name: string;
  category: string;
  credits: number;
  clicks: number;
  impressions: number;
  externalVisits: number;
  joinedAt: number;
  handle: string;
  banner: string;
  logo: string;
  accent: string;
  site: string;
  entryId?: string;
};

const isImageUrl = (value: string) => /^(https?:\/\/|blob:|data:image\/)/i.test(value);

const MONTHLY_CAP = 20000;

const initialParticipants: Participant[] = [
  { id: 1, name: "Luma Studio", category: "Diseño", credits: 20000, clicks: 820, impressions: 11800, externalVisits: 210, joinedAt: 1, handle: "@lumastudio", logo: "L", banner: "Diseño que transforma ideas en experiencias.", accent: "#ff3cac", site: "https://example.com/luma" },
  { id: 2, name: "Nova Digital", category: "Tecnología", credits: 20000, clicks: 1120, impressions: 14300, externalVisits: 340, joinedAt: 2, handle: "@novadigital", logo: "N", banner: "Tecnología que conecta tu próximo salto.", accent: "#25d9ff", site: "https://example.com/nova" },
  { id: 3, name: "Atlas Travel", category: "Viajes", credits: 20000, clicks: 640, impressions: 9200, externalVisits: 170, joinedAt: 3, handle: "@atlastravel", logo: "A", banner: "El próximo destino empieza acá.", accent: "#65f4d0", site: "https://example.com/atlas" },
  { id: 4, name: "Patagonia Lab", category: "Business", credits: 17000, clicks: 980, impressions: 12100, externalVisits: 290, joinedAt: 4, handle: "@patagonialab", logo: "P", banner: "Ideas que se convierten en negocios.", accent: "#ffb52e", site: "https://example.com/patagonia" },
  { id: 5, name: "Marea Brand", category: "Branding", credits: 15000, clicks: 760, impressions: 10100, externalVisits: 230, joinedAt: 5, handle: "@mareabrand", logo: "M", banner: "Hacé que tu marca sea imposible de ignorar.", accent: "#ff7a45", site: "https://example.com/marea" },
  { id: 6, name: "Pixel Norte", category: "Diseño", credits: 12000, clicks: 540, impressions: 7800, externalVisits: 150, joinedAt: 6, handle: "@pixelnorte", logo: "P", banner: "Diseño digital con identidad propia.", accent: "#9d7cff", site: "https://example.com/pixel" },
  { id: 7, name: "Andes Tech", category: "Tecnología", credits: 10000, clicks: 430, impressions: 6400, externalVisits: 120, joinedAt: 7, handle: "@andestech", logo: "A", banner: "Soluciones para empresas que avanzan.", accent: "#25d9ff", site: "https://example.com/andes" },
  { id: 8, name: "Sur Experience", category: "Viajes", credits: 8000, clicks: 390, impressions: 5700, externalVisits: 105, joinedAt: 8, handle: "@surexperience", logo: "S", banner: "Experiencias que quedan para siempre.", accent: "#65f4d0", site: "https://example.com/sur" },
  { id: 9, name: "Cumbre Store", category: "Comercio", credits: 6000, clicks: 260, impressions: 4200, externalVisits: 70, joinedAt: 9, handle: "@cumbrestore", logo: "C", banner: "Encontrá lo que estabas buscando.", accent: "#ffd447", site: "https://example.com/cumbre" },
  { id: 10, name: "Delta Creative", category: "Creativo", credits: 3000, clicks: 180, impressions: 2600, externalVisits: 45, joinedAt: 10, handle: "@deltacreative", logo: "D", banner: "Creatividad que conecta personas y marcas.", accent: "#b46cff", site: "https://example.com/delta" },
];

const ctrFor = (p: Participant) => p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0;

const scoreFor = (p: Participant) => {
  const creditPoints = (p.credits / MONTHLY_CAP) * 500;
  const clickPoints = Math.min(p.clicks / 2, 400);
  const ctr = p.impressions > 0 ? p.clicks / p.impressions : 0;
  const ctrPoints = Math.min(ctr * 1000, 100);
  return Math.round(creditPoints + clickPoints + ctrPoints);
};

const rankParticipants = (items: Participant[]) =>
  [...items].sort((a, b) => {
    const scoreDiff = scoreFor(b) - scoreFor(a);
    if (scoreDiff !== 0) return scoreDiff;
    if (b.clicks !== a.clicks) return b.clicks - a.clicks;
    return a.joinedAt - b.joinedAt;
  }).map((p, index) => ({ ...p, rank: index + 1, score: scoreFor(p) }));

export default function Home() {
  const [participants, setParticipants] = useState(initialParticipants);
  const [selectedId, setSelectedId] = useState(2);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [infoPanel, setInfoPanel] = useState<"faq" | "policies" | "rules" | null>(null);
  const [message, setMessage] = useState("MODO PRUEBA: hacé clic en un participante para explorar su perfil.");
  const [month, setMonth] = useState("OCTUBRE 2026");
  const [dataSource, setDataSource] = useState<"demo" | "supabase">("demo");
  const [showJoin, setShowJoin] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", category: "Tecnología", description: "", site: "" });
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", description: "", site: "", logo: "" });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [ownedCompanyId, setOwnedCompanyId] = useState<string | null>(null);
  const [pendingParticipation, setPendingParticipation] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      if (data.session?.user) {
        const { data: company } = await supabase.from("companies").select("id").eq("owner_id", data.session.user.id).eq("active", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
        setOwnedCompanyId(company?.id ?? null);
        if (company?.id) {
          await supabase.rpc("ensure_company_entry", { p_company_id: company.id });
        }
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      if (!session?.user) setOwnedCompanyId(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;

    let cancelled = false;
    const loadLiveRanking = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: edition } = await supabase.from("monthly_editions").select("name").eq("status", "active").order("starts_at", { ascending: false }).limit(1).maybeSingle();
      if (edition?.name) setMonth(edition.name);
      const { data, error } = await supabase.from("live_ranking").select("*").order("rank", { ascending: true });
      if (cancelled || error || !data?.length) return;
      const accentFor = (category: string | null) => {
        const map: Record<string, string> = { "Tecnología":"#25d9ff", "Viajes":"#65f4d0", "Diseño":"#ff3cac", "Comercio":"#ffd447", "Gastronomía":"#ff7a45", "Servicios":"#9d7cff", "Creativo":"#b46cff", "Business":"#ffb52e" };
        return map[category ?? ""] ?? "#784cff";
      };
      const live: Participant[] = data.map((p: any, index: number) => ({
        id: index + 1,
        entryId: p.entry_id,
        name: p.name,
        category: p.category ?? "General",
        credits: Number(p.credits ?? 0),
        clicks: Number(p.clicks ?? 0),
        impressions: Number(p.impressions ?? 0),
        externalVisits: Number(p.external_visits ?? 0),
        joinedAt: index + 1,
        handle: p.handle ?? "",
        logo: p.logo_url ?? (p.name ?? "C").slice(0, 1).toUpperCase(),
        banner: p.description ?? "",
        accent: accentFor(p.category),
        site: p.site_url ?? "https://example.com"
      }));
      setParticipants(live);
      setSelectedId(live[0]?.id ?? 1);
      setDataSource("supabase");
      setMessage("🟢 Datos en vivo conectados desde Supabase.");
    };
    loadLiveRanking();
    return () => { cancelled = true; };
  }, []);

  const ranking = useMemo(() => rankParticipants(participants), [participants]);
  const selected = ranking.find((p) => p.id === selectedId) ?? ranking[0];
  const profile = ranking.find((p) => p.id === profileId) ?? null;


  const trackEvent = async (id: number, eventType: "impression" | "profile_view" | "ad_click" | "external_visit", source: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return;
    const participant = participants.find(p => p.id === id);
    if (!participant?.entryId) return;
    const supabase = createSupabaseBrowserClient();
    const sessionId = typeof window !== "undefined" ? window.sessionStorage.getItem("cr_session_id") || (() => { const v = crypto.randomUUID(); window.sessionStorage.setItem("cr_session_id", v); return v; })() : null;
    const { error } = await supabase.rpc("track_creative_event", { p_entry_id: participant.entryId, p_event_type: eventType, p_source: source, p_session_id: sessionId });
    if (error) return;
    if (eventType === "impression") setParticipants(current => current.map(p => p.id === id ? { ...p, impressions: p.impressions + 1 } : p));
    if (eventType === "ad_click") setParticipants(current => current.map(p => p.id === id ? { ...p, clicks: p.clicks + 1 } : p));
    if (eventType === "external_visit") setParticipants(current => current.map(p => p.id === id ? { ...p, externalVisits: p.externalVisits + 1 } : p));
  };

  const addClicks = (id: number, amount = 100) => {
    setParticipants(current => current.map(p => p.id === id
      ? { ...p, clicks: p.clicks + amount, impressions: p.impressions + amount * 12 }
      : p));
    setMessage("⚡ Interacción agregada. El ranking se recalculó en tiempo real.");
  };

  const adClick = (id: number) => {
    const participant = participants.find(p => p.id === id);
    if (participant?.entryId) {
      void trackEvent(id, "ad_click", "profile_banner");
    } else {
      setParticipants(current => current.map(p => p.id === id ? { ...p, clicks: p.clicks + 1 } : p));
    }
    setMessage("🎯 Click publicitario registrado. La audiencia movió el ranking.");
  };

  const addCredits = (id: number, amount: number) => {
    setParticipants(current => current.map(p => p.id === id
      ? { ...p, credits: Math.min(MONTHLY_CAP, p.credits + amount) }
      : p));
    setMessage(`🚀 Promoción simulada: +${amount.toLocaleString()} créditos.`);
  };

  const openParticipation = () => {
    setAuthError("");
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !userEmail) {
      setPendingParticipation(true);
      setShowJoin(false);
      setAuthMode("register");
      setShowAuth(true);
      setMessage("🔐 Primero creá tu cuenta. Después completarás los datos de tu empresa y generaremos tu banner.");
      return;
    }
    setShowJoin(true);
  };

  const handleAuth = async () => {
    const email = authEmail.trim();
    setAuthError("");
    if (!email || !authPassword) {
      const msg = "Completá email y contraseña.";
      setAuthError(msg); setMessage("⚠️ " + msg);
      return;
    }
    if (authPassword.length < 6) {
      const msg = "La contraseña debe tener al menos 6 caracteres.";
      setAuthError(msg); setMessage("⚠️ " + msg);
      return;
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      const msg = "Supabase todavía no está configurado en este entorno.";
      setAuthError(msg); setMessage("ℹ️ " + msg);
      return;
    }

    setAuthBusy(true);
    try {
      // Diagnostic preflight: distinguish a Supabase connection problem from an Auth error.
      const healthUrl = (url.endsWith("/") ? url.slice(0, -1) : url) + "/auth/v1/settings";
      try {
        const healthResponse = await fetch(healthUrl, {
          method: "GET",
          headers: { apikey: key },
          cache: "no-store",
        });
        if (!healthResponse.ok) {
          const body = await healthResponse.text().catch(() => "");
          const detail = body ? " " + body.slice(0, 180) : "";
          const msg = `Supabase Auth respondió con HTTP ${healthResponse.status}.${detail}`;
          setAuthError(msg);
          setMessage("⚠️ " + msg);
          return;
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : "error de red";
        const msg = `No se puede conectar con Supabase Auth en ${url}. (${detail})`;
        setAuthError(msg);
        setMessage("⚠️ " + msg);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const result = authMode === "login"
        ? await supabase.auth.signInWithPassword({ email, password: authPassword })
        : await supabase.auth.signUp({ email, password: authPassword });

      if (result.error) {
        const raw = result.error.message || "No se pudo completar la operación.";
        const friendly = /already registered|user already exists|already been registered/i.test(raw)
          ? "Esta cuenta ya existe. Si ya verificaste el correo, elegí «YA TENGO CUENTA · INGRESAR» e ingresá con tu contraseña."
          : raw;
        setAuthError(friendly);
        setMessage("⚠️ " + friendly);
        return;
      }

      setAuthPassword("");
      if (authMode === "register" && !result.data.session) {
        setShowAuth(false);
        setAuthMode("login");
        setShowVerification(true);
        setMessage("📩 Te enviamos un mensaje de verificación a tu correo.");
        return;
      }

      setShowAuth(false);
      if (pendingParticipation) {
        setPendingParticipation(false);
        setShowJoin(true);
        setMessage("🟢 Cuenta lista. Ahora completá los datos de tu empresa para generar tu banner.");
      } else {
        setMessage(authMode === "login" ? "🟢 Sesión iniciada correctamente." : "🟢 Cuenta creada y sesión iniciada.");
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "error desconocido";
      const msg = `No se pudo completar la operación: ${detail}`;
      setAuthError(msg);
      setMessage("⚠️ " + msg);
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url && key) await createSupabaseBrowserClient().auth.signOut();
    setUserEmail(null);
    setMessage("Sesión cerrada.");
  };

  const registerCompany = async () => {
    const name = newCompany.name.trim();
    const description = newCompany.description.trim();
    const site = newCompany.site.trim() || "https://example.com";
    if (!name || !description) {
      setMessage("⚠️ Completá el nombre y la descripción breve de la empresa.");
      return;
    }
    const nextId = Math.max(...participants.map(p => p.id), 0) + 1;
    const accentPalette = ["#ff3cac", "#25d9ff", "#65f4d0", "#ffd447", "#9d7cff", "#ff7a45"];
    const accent = accentPalette[(nextId - 1) % accentPalette.length];
    const handle = "@" + name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !userEmail) {
      setPendingParticipation(true);
      setAuthMode("register");
      setShowAuth(true);
      setMessage("🔐 Primero creá tu cuenta. Después completarás los datos de tu empresa.");
      return;
    }
    setSaveBusy(true);
    let storedLogo = "";
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? createSupabaseBrowserClient() : null;
    if (supabase && logoFile && userEmail) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) storedLogo = await uploadCompanyLogo(supabase, userData.user.id, logoFile);
      } catch (error) {
        setSaveBusy(false);
        setMessage("⚠️ No se pudo subir el logo: " + (error instanceof Error ? error.message : "error desconocido"));
        return;
      }
    }
    const participant: Participant = {
      id: nextId,
      name,
      category: newCompany.category,
      credits: 0,
      clicks: 0,
      impressions: 0,
      externalVisits: 0,
      joinedAt: nextId,
      handle,
      logo: storedLogo || logoPreview || name.slice(0, 1).toUpperCase(),
      banner: description,
      accent,
      site,
    };
    if (userEmail && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: category } = await supabase.from("categories").select("id").eq("name", newCompany.category).maybeSingle();
        const { data: company, error } = await supabase.from("companies").insert({ owner_id: userData.user.id, name, handle, category_id: category?.id ?? null, description, logo_url: storedLogo || null, site_url: site, accent, approved: true }).select("id").single();
        if (error) {
          setSaveBusy(false);
          setMessage("⚠️ No se pudo guardar la empresa: " + error.message);
          return;
        }
        setOwnedCompanyId(company.id);
        const { error: entryError } = await supabase.rpc("ensure_company_entry", { p_company_id: company.id });
        if (entryError) {
          setSaveBusy(false);
          setMessage("⚠️ La empresa se guardó, pero no pudo ingresar a la edición activa: " + entryError.message);
          return;
        }
      }
    }
    setParticipants(current => [...current, participant]);
    setSelectedId(nextId);
    setShowJoin(false);
    setNewCompany({ name: "", category: "Tecnología", description: "", site: "" });
    setLogoPreview("");
    setLogoFile(null);
    setSaveBusy(false);
    setMessage(`🚀 ${name} ya está participando. Creative Rank generó su banner automáticamente.`);
    setTimeout(() => document.getElementById("ranking")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("⚠️ El logo debe ser una imagen.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("⚠️ El logo no puede superar 2 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    setLogoFile(file);
    setMessage("🖼️ Logo cargado. Revisá la vista previa antes de guardar.");
  };

  const openEdit = (p: Participant) => {
    setEditId(p.id);
    setEditForm({ name: p.name, category: p.category, description: p.banner, site: p.site, logo: p.logo });
  };

  const saveEdit = async () => {
    if (editId === null) return;
    const name = editForm.name.trim();
    const description = editForm.description.trim();
    if (!name || !description) {
      setMessage("⚠️ Completá nombre y descripción antes de guardar.");
      return;
    }
    setSaveBusy(true);
    let nextLogo = editForm.logo || name.slice(0, 1).toUpperCase();
    if (userEmail && ownedCompanyId && editLogoFile && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) nextLogo = await uploadCompanyLogo(supabase, userData.user.id, editLogoFile);
      } catch (error) {
        setSaveBusy(false);
        setMessage("⚠️ No se pudo subir el nuevo logo: " + (error instanceof Error ? error.message : "error desconocido"));
        return;
      }
    }
    setParticipants(current => current.map(p => p.id === editId ? { ...p, name, category: editForm.category, banner: description, site: editForm.site.trim() || p.site, logo: nextLogo } : p));
    if (userEmail && ownedCompanyId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      const supabase = createSupabaseBrowserClient();
      const { data: category } = await supabase.from("categories").select("id").eq("name", editForm.category).maybeSingle();
      const { error } = await supabase.from("companies").update({ name, category_id: category?.id ?? null, description, site_url: editForm.site.trim(), logo_url: isImageUrl(nextLogo) ? nextLogo : null }).eq("id", ownedCompanyId);
      if (error) { setSaveBusy(false); setMessage("⚠️ No se pudo guardar en Supabase: " + error.message); return; }
    }
    setEditId(null);
    setEditLogoFile(null);
    setSaveBusy(false);
    setMessage("✏️ Datos actualizados. El banner se regeneró automáticamente.");
  };

  const startCheckout = async (priceUsd: number) => {
    if (!userEmail || !ownedCompanyId) {
      setAuthMode("login");
      setShowAuth(true);
      setMessage("🔐 Ingresá y registrá tu empresa antes de comprar créditos.");
      return;
    }
    setSaveBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: edition, error: editionError } = await supabase.from("monthly_editions").select("id").eq("status", "active").order("starts_at", { ascending: false }).limit(1).maybeSingle();
      if (editionError || !edition) throw new Error("No hay una edición mensual activa.");
      const { data: pkg, error: packageError } = await supabase.from("credit_packages").select("id,credits,price_usd").eq("price_usd", priceUsd).eq("active", true).single();
      if (packageError || !pkg) throw new Error("Paquete no disponible.");
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("La sesión expiró. Volvé a ingresar.");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, companyId: ownedCompanyId, editionId: edition.id, userId: userData.user.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo iniciar el checkout.");
      setMessage(`💳 Checkout creado por ${pkg.credits.toLocaleString()} créditos. Redirigiendo a Mercado Pago…`);
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setMessage("⚠️ " + (error instanceof Error ? error.message : "No se pudo iniciar el pago."));
      setSaveBusy(false);
    }
  };

  const visitSite = (id: number) => {
    const participant = participants.find(p => p.id === id);
    if (participant?.entryId) void trackEvent(id, "external_visit", "profile_site");
    else setParticipants(current => current.map(p => p.id === id ? { ...p, externalVisits: p.externalVisits + 1 } : p));
    setMessage("🌐 Visita al sitio registrada. La empresa recibió una visita externa.");
  };

  const resetDemo = () => {
    setParticipants(initialParticipants);
    setMessage("Demo reiniciada.");
  };

  return (
    <main style={styles.page}>
      <header className="cr-header" style={styles.header}>
        <div>
          <div style={styles.logo}>CR<span style={{ color: "#25d9ff" }}>EATIVE</span> <span style={{ color: "#ff3cac" }}>RANK</span></div>
          <div style={styles.tagline}>CREADORES · MARCAS · EXPERIENCIAS</div>
        </div>
        <nav className="cr-nav" style={styles.nav}>
          <a href="#ranking" style={styles.navA}>🏆 RANKING</a>
          <a href="#winners" style={styles.navA}>TOP 5</a>
          <a href="#how" style={styles.navA}>CÓMO FUNCIONA</a>
          {userEmail ? <><span style={styles.userPill}>● {userEmail}</span><button onClick={logout} style={styles.smallButton}>SALIR</button></> : <button onClick={() => { setAuthMode("login"); setShowAuth(true); }} style={styles.smallButton}>INGRESAR</button>}<button onClick={resetDemo} style={styles.smallButton}>RESET DEMO</button>
        </nav>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>● LIVE MONTHLY RANKING · {month}</div>
          <h1 style={styles.h1}>EL TALENTO<br /><span style={styles.gradientText}>SE DESTACA.</span></h1>
          <p style={styles.heroCopyP}>Marcas, proyectos y experiencias compitiendo por atención. Promocioná, generá interés y hacé que tu posición pueda cambiar hasta el último día.</p>
          <div style={styles.heroButtons}>
            <a href="#ranking" style={styles.primary}>DESCUBRIR RANKING →</a><button onClick={openParticipation} style={styles.secondary}>PARTICIPAR →</button>
            <a href="#how" style={styles.secondary}>CÓMO FUNCIONA</a>
          </div>
        </div>
        <div style={styles.heroCard}>
          <div style={styles.cardLabel}>COMPETENCIA MENSUAL</div>
          <div style={styles.monthTitle}>{month}</div>
          <div style={styles.heroStats}>
            <div><strong>20K</strong><small>CAP PROMOCIONAL</small></div>
            <div><strong>{ranking.length}</strong><small>PARTICIPANTES</small></div>
            <div><strong>{ranking.reduce((s,p)=>s+p.clicks,0).toLocaleString()}</strong><small>CLICKS</small></div>
          </div>
          <div style={styles.livePill}>● COMPETENCIA ACTIVA</div>
          <div style={styles.progress}><span style={{ width: "24%" }} /></div>
          <small style={{ color: "#8e8ba0" }}>Progreso del mes · 24%</small>
        </div>
      </section>

      <div style={styles.notice}>{message}<span style={styles.sourcePill}>{dataSource === "supabase" ? "● DATOS EN VIVO" : "● MODO DEMO"}</span></div>


      <section className="cr-participant-dashboard" style={styles.participantDashboard}>
        <div className="cr-dashboard-intro" style={styles.dashboardIntro}>
          <div>
            <div style={styles.eyebrow}>PANEL DEL PARTICIPANTE · DEMO</div>
            <h2 style={styles.h2}>Tu marca está activa.</h2>
            <p style={styles.p}>Controlá tu posición, rendimiento y presencia promocional desde un solo lugar.</p>
          </div>
          <button onClick={openParticipation} style={styles.primary}>+ NUEVA PARTICIPACIÓN</button>
        </div>
        <div className="cr-participant-grid" style={styles.participantGrid}>
          <div style={styles.participantMainCard}>
            <div style={styles.activeBannerLabel}>● TU BANNER ESTÁ ACTIVO</div>
            <button onClick={() => adClick(selected.id)} style={{...styles.dashboardBanner, borderColor:selected.accent}}>
              <div style={{...styles.bannerGlow,background:selected.accent}} />
              <div style={{...styles.generatedLogoLarge,borderColor:selected.accent}}>{selected.logo}</div>
              <div style={styles.dashboardBannerCopy}><span>{selected.category}</span><strong>{selected.name}</strong><p>{selected.banner}</p></div>
              <small>CLICK PUBLICITARIO · +1</small>
            </button>
            <div style={styles.dashboardBottom}>
              <div><small>SITIO VINCULADO</small><strong>{selected.site.replace("https://","")}</strong></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={() => openEdit(selected)} style={styles.secondary}>EDITAR DATOS ✎</button><button onClick={() => { setProfileId(selected.id); void trackEvent(selected.id, "profile_view", "dashboard"); }} style={styles.secondary}>VER PERFIL →</button></div>
            </div>
          </div>
          <div className="cr-kpi-grid" style={styles.kpiGrid}>
            <Metric label="POSICIÓN" value={`#${selected.rank}`} />
            <Metric label="CR SCORE" value={selected.score.toLocaleString()} />
            <Metric label="IMPRESIONES" value={selected.impressions.toLocaleString()} />
            <Metric label="CLICKS" value={selected.clicks.toLocaleString()} />
            <Metric label="CTR" value={`${ctrFor(selected).toFixed(2)}%`} />
            <Metric label="VISITAS WEB" value={selected.externalVisits.toLocaleString()} />
          </div>
        </div>
      </section>

      <section id="ranking" className="cr-section" style={styles.section}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>01 · LIVE RANKING</div>
            <h2 style={styles.h2}>La posición puede cambiar hasta el último día.</h2>
          </div>
          <div style={styles.monthBadge}>{month}</div>
        </div>

        <div className="cr-dashboard" style={styles.dashboard}>
          <div className="cr-table-card" style={styles.tableCard}>
            <div className="cr-table-head" style={styles.tableHeader}>
              <span>#</span><span>PARTICIPANTE</span><span>CATEGORÍA</span><span>CRÉDITOS</span><span>CLICKS</span><span>CR SCORE</span><span>TENDENCIA</span>
            </div>
            {ranking.map((p, index) => (
              <div key={p.id}
                onClick={() => { setSelectedId(p.id); setMessage(`👀 ${p.name} seleccionado. Abrí VER para conocer su perfil.`); }}
                className="cr-row" style={{ ...styles.row, ...(selected?.id === p.id ? styles.rowSelected : {}) }}>
                <strong style={styles.rank}>{p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank-1] : p.rank}</strong>
                <div style={styles.person}><strong>{p.name}</strong><small>{p.handle}</small></div>
                <span style={{ ...styles.category, borderColor: p.accent, color: p.accent }}>{p.category}</span>
                <span>{p.credits.toLocaleString()}</span>
                <span>{p.clicks.toLocaleString()}</span>
                <strong style={styles.score}>{p.score}</strong>
                <span style={{ color: index % 3 === 0 ? "#45e69b" : index % 3 === 1 ? "#ff5f75" : "#8e8ba0", fontWeight: 900 }}>
                  {index % 3 === 0 ? "▲ +2" : index % 3 === 1 ? "▼ -1" : "—"}
                </span>
                <button onClick={(e) => { e.stopPropagation(); setProfileId(p.id); }} style={styles.viewButton}>VER →</button>
              </div>
            ))}
          </div>

          <aside style={styles.sideCard}>
            <button
              onClick={() => adClick(selected.id)}
              style={{ ...styles.profileBanner, width: "100%", border: 0, color: "#fff", cursor: "pointer", textAlign: "left" }}
              title="Click publicitario de prueba"
            >
              <div style={{ ...styles.bannerGlow, background: selected.accent }} />
              <span style={styles.profileRank}>#{selected.rank}</span>
              <span style={{ ...styles.category, borderColor: selected.accent, color: selected.accent }}>{selected.category}</span>
              <div style={{ ...styles.generatedLogo, borderColor: selected.accent }}>{selected.logo}</div><div style={styles.generatedBannerName}>{selected.name}</div><div style={styles.generatedBannerDesc}>{selected.banner}</div>
              <span style={styles.bannerClickHint}>CLICK PUBLICITARIO · +1</span>
            </button>
            <div style={styles.eyebrow}>SELECTED PARTICIPANT</div>
            <h3 style={styles.sideCardH3}>{selected.name}</h3>
            <p style={styles.p}>{selected.handle} · {selected.banner}</p>
            <div style={styles.metrics}>
              <Metric label="POSICIÓN" value={`#${selected.rank}`} />
              <Metric label="CR SCORE" value={selected.score.toLocaleString()} />
              <Metric label="CLICKS" value={selected.clicks.toLocaleString()} />
              <Metric label="CRÉDITOS" value={`${(selected.credits/1000).toFixed(1)}K`} />
            </div>
            <div style={styles.progressLabel}><span>Influencia promocional</span><span>{selected.credits.toLocaleString()} / {MONTHLY_CAP.toLocaleString()}</span></div>
            <div style={styles.progress}><span style={{ width: `${(selected.credits/MONTHLY_CAP)*100}%`, background: `linear-gradient(90deg,${selected.accent},#25d9ff)` }} /></div>
            <div style={styles.actionGrid}>
              <button onClick={() => addClicks(selected.id)} style={styles.primary}>+100 CLICKS</button>
              <button onClick={() => addCredits(selected.id,1000)} style={{ ...styles.secondary, borderColor: "#ffb52e", color: "#ffd66b" }}>+1K CRÉDITOS</button>
            </div>
            <button onClick={() => setProfileId(selected.id)} style={styles.fullButton}>VER PERFIL COMPLETO →</button><button onClick={openParticipation} style={{...styles.fullButton, marginTop:8, borderColor:"rgba(255,60,172,.35)", color:"#ff9bd1"}}>PROMOCIONAR MI MARCA →</button>
          </aside>
        </div>
      </section>

      <section id="winners" style={styles.section}>
        <div style={styles.sectionHead}><div><div style={styles.eyebrow}>02 · TOP 5</div><h2 style={styles.h2}>Los que están captando atención este mes.</h2></div></div>
        <div className="cr-winners" style={styles.winnerGrid}>
          {ranking.slice(0,5).map(p => (
            <button key={p.id} onClick={() => { setProfileId(p.id); void trackEvent(p.id, "profile_view", "ranking"); }} style={{ ...styles.winnerCard, textAlign: "left", color: "#fff", cursor: "pointer" }}>
              <div style={styles.winnerVisual}><span>{p.rank === 1 ? "🏆" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}</span><span style={{ ...styles.miniBadge, borderColor:p.accent, color:p.accent }}>{p.category}</span></div>
              <h3>{p.name}</h3><p style={styles.p}>{p.banner}</p>
              <div style={styles.winnerStats}><span>{p.clicks.toLocaleString()} clicks</span><strong>{p.score}</strong></div>
            </button>
          ))}
        </div>
      </section>

      <section id="how" style={styles.section}>
        <div style={styles.sectionHead}><div><div style={styles.eyebrow}>03 · HOW IT WORKS</div><h2 style={styles.h2}>Promoción + atención + interacción.</h2></div></div>
        <div className="cr-steps" style={styles.steps}>
          <Step n="01" title="PROMOCIONÁ" text="Comprá créditos y llevá tu publicación hasta un máximo de 20.000 créditos mensuales." />
          <Step n="02" title="GENERÁ INTERÉS" text="Tu presencia recibe visualizaciones y clics. La respuesta de la audiencia mueve el ranking." />
          <Step n="03" title="MOSTRÁ TU MARCA" text="Tu perfil y tu banner aparecen dentro de Creative Rank para que otros puedan descubrirte." />
        </div>
        <button onClick={() => setInfoPanel("rules")} style={styles.monthResetCard}>
          <div style={styles.monthResetIcon}>↻</div>
          <div>
            <small style={styles.monthResetEyebrow}>REGLA CLAVE DE CREATIVE RANK</small>
            <h3 style={styles.monthResetTitle}>Cada mes, todos empiezan desde 0.</h3>
            <p style={styles.monthResetText}>Cada nueva edición comienza una nueva competencia. Los créditos y métricas de la edición anterior no se trasladan para definir la nueva clasificación; el historial y los reconocimientos permanecen.</p>
          </div>
          <span style={styles.monthResetArrow}>VER REGLAS →</span>
        </button>
      </section>

      <section style={styles.infoSection}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>04 · INFORMACIÓN</div>
            <h2 style={styles.h2}>Todo lo que necesitás saber antes de participar.</h2>
          </div>
        </div>
        <div style={styles.infoGrid}>
          <button onClick={() => setInfoPanel("faq")} style={styles.infoCard}>
            <span style={styles.infoIcon}>?</span>
            <div><small>RESPUESTAS RÁPIDAS</small><h3>Preguntas frecuentes</h3><p>Cómo participar, créditos, ranking, clics y resultados.</p></div>
            <strong>LEER →</strong>
          </button>
          <button onClick={() => setInfoPanel("policies")} style={styles.infoCard}>
            <span style={styles.infoIcon}>✓</span>
            <div><small>TRANSPARENCIA</small><h3>Políticas</h3><p>Privacidad, publicidad, medición, cuentas y uso responsable.</p></div>
            <strong>LEER →</strong>
          </button>
          <button onClick={() => setInfoPanel("rules")} style={styles.infoCard}>
            <span style={styles.infoIcon}>🏆</span>
            <div><small>REGLAS OFICIALES</small><h3>Bases de participación</h3><p>Períodos, categorías, créditos, métricas, cierre y reconocimientos.</p></div>
            <strong>LEER →</strong>
          </button>
        </div>
      </section>

      <section className="cr-test" style={styles.testPanel}>
        <div><div style={styles.eyebrow}>MVP TEST CONSOLE</div><h2 style={{...styles.h2,fontSize:32}}>Probá la mecánica en tiempo real.</h2><p style={styles.p}>Seleccioná una marca, sumá clics y mirá cómo cambia su posición.</p></div>
        <button onClick={() => { setMonth("NOVIEMBRE 2026"); resetDemo(); }} style={styles.primary}>SIMULAR NUEVO MES</button>
      </section>

      <footer className="cr-footer" style={styles.footer}><strong>CREATIVE<span style={{color:"#ff3cac"}}>RANK</span></strong><span>MVP · Monthly Competition Engine</span><span>© 2026</span></footer>


      {showVerification && (
        <div style={styles.authBackdrop} onClick={() => setShowVerification(false)}>
          <div style={styles.authModal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowVerification(false)} style={styles.close}>×</button>
            <div style={styles.verificationCard}>
              <div style={styles.verificationIcon}>✓</div>
              <div style={styles.eyebrow}>CUENTA CREADA</div>
              <h2 style={styles.verificationTitle}>¡Listo! Te enviamos un mensaje de verificación.</h2>
              <p style={styles.verificationText}>
                Revisá tu correo y hacé clic en el enlace de verificación de Supabase.
                Después volvé a Creative Rank e ingresá con tu email y contraseña para continuar.
              </p>
              <div style={styles.verificationSteps}>
                <div><strong>1</strong><span>Revisá tu bandeja de entrada y también Spam.</span></div>
                <div><strong>2</strong><span>Confirmá tu correo desde el mensaje recibido.</span></div>
                <div><strong>3</strong><span>Volvé a Creative Rank y elegí INGRESAR.</span></div>
              </div>
              <button type="button" onClick={() => { setShowVerification(false); setAuthMode("login"); setShowAuth(true); }} style={{...styles.primary,width:"100%"}}>
                YA VERIFIQUÉ MI CORREO · INGRESAR →
              </button>
              <button type="button" onClick={() => setShowVerification(false)} style={{...styles.secondary,width:"100%"}}>
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <div style={styles.authBackdrop} onClick={() => setShowAuth(false)}>
          <div style={styles.authModal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAuth(false)} style={styles.close}>×</button>
            <div style={styles.joinHead}>
              <div style={styles.eyebrow}>{authMode === "login" ? "ACCESO PARTICIPANTE" : "NUEVA CUENTA"}</div>
              <h2 style={styles.h2}>{authMode === "login" ? "Ingresá a tu cuenta." : "Creá tu cuenta."}</h2>
              <p style={styles.p}>Tu cuenta será la puerta de entrada a tu empresa, banner, métricas y créditos.</p>
            </div>
            <div style={styles.joinBody}>
              {authError && <div style={styles.authError}>⚠️ {authError}</div>}
              <label style={styles.field}><span>EMAIL</span><input type="email" autoComplete="email" value={authEmail} onChange={e => { setAuthEmail(e.target.value); setAuthError(""); }} placeholder="tu@email.com" /></label>
              <label style={styles.field}><span>CONTRASEÑA</span><input type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authPassword} onChange={e => { setAuthPassword(e.target.value); setAuthError(""); }} placeholder="Mínimo 6 caracteres" /></label>
              <button disabled={authBusy} onClick={handleAuth} style={{...styles.primary,opacity:authBusy?.65:1}}>{authBusy ? "PROCESANDO..." : authMode === "login" ? "INGRESAR →" : "CREAR CUENTA →"}</button>
              <button onClick={() => { setAuthError(""); setAuthMode(authMode === "login" ? "register" : "login"); }} style={styles.secondary}>{authMode === "login" ? "NO TENGO CUENTA · CREAR" : "YA TENGO CUENTA · INGRESAR"}</button>
            </div>
          </div>
        </div>
      )}

      {showJoin && (
        <div style={styles.modalBackdrop} onClick={() => setShowJoin(false)}>
          <div style={styles.joinModal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowJoin(false)} style={styles.close}>×</button>
            <div style={styles.joinHead}>
              <div style={styles.eyebrow}>NUEVA PARTICIPACIÓN</div>
              <h2 style={styles.h2}>Mostrá tu marca en Creative Rank.</h2>
              <p style={styles.p}>Completá los datos básicos. El sistema genera automáticamente tu banner con la identidad de Creative Rank.</p>
            </div>
            <div style={styles.joinBody}>
              <label style={styles.field}><span>LOGO DE LA EMPRESA</span><div style={styles.logoUploadRow}><div style={styles.uploadLogoPreview}>{logoPreview ? <img src={logoPreview} alt="Vista previa del logo" /> : <span>{newCompany.name.trim().slice(0,1).toUpperCase() || "C"}</span>}</div><label style={styles.uploadButton}>CARGAR LOGO<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e => handleLogoFile(e.target.files?.[0])} /></label><small>PNG, JPG, WEBP o SVG · máximo 2 MB</small></div></label><label style={styles.field}><span>NOMBRE DE LA EMPRESA</span><input value={newCompany.name} onChange={e => setNewCompany({...newCompany, name:e.target.value})} placeholder="Ej. Patagonia Travel" /></label>
              <label style={styles.field}><span>CATEGORÍA</span><select value={newCompany.category} onChange={e => setNewCompany({...newCompany, category:e.target.value})}><option>Tecnología</option><option>Viajes</option><option>Diseño</option><option>Comercio</option><option>Gastronomía</option><option>Servicios</option><option>Creativo</option><option>Business</option></select></label>
              <label style={styles.field}><span>DESCRIPCIÓN BREVE</span><textarea maxLength={120} value={newCompany.description} onChange={e => setNewCompany({...newCompany, description:e.target.value})} placeholder="Hasta 120 caracteres. ¿Qué hace tu empresa?" /><small>{newCompany.description.length}/120</small></label>
              <label style={styles.field}><span>SITIO WEB</span><input type="url" value={newCompany.site} onChange={e => setNewCompany({...newCompany, site:e.target.value})} placeholder="https://tusitio.com" /></label>
              <div style={styles.generatedPreview}>
                <div style={styles.eyebrow}>VISTA PREVIA · BANNER GENERADO</div>
                <div style={{...styles.previewBanner, borderColor: newCompany.name ? "#25d9ff" : "rgba(255,255,255,.12)"}}>
                  <div style={{...styles.generatedLogoLarge, borderColor:"#25d9ff",overflow:"hidden"}}>{logoPreview ? <img src={logoPreview} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}} /> : (newCompany.name.trim().slice(0,1).toUpperCase() || "C")}</div>
                  <div><strong>{newCompany.name.trim() || "Tu empresa"}</strong><p>{newCompany.description.trim() || "Tu descripción breve aparecerá aquí."}</p><span style={styles.generatedCategory}>{newCompany.category}</span></div>
                </div>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); void registerCompany(); }} disabled={saveBusy} style={{...styles.primary, width:"100%", marginTop:4, opacity:saveBusy ? .65 : 1}}>{saveBusy ? "GUARDANDO PARTICIPACIÓN..." : "GENERAR BANNER Y PARTICIPAR →"}</button>
            </div>
          </div>
        </div>
      )}

      {editId !== null && (
        <div style={styles.modalBackdrop} onClick={() => setEditId(null)}>
          <div style={styles.joinModal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditId(null)} style={styles.close}>×</button>
            <div style={styles.joinHead}>
              <div style={styles.eyebrow}>EDITAR PARTICIPANTE</div>
              <h2 style={styles.h2}>Corregí los datos de tu empresa.</h2>
              <p style={styles.p}>Podés modificar la información cuando lo necesites. El banner se actualiza con los nuevos datos.</p>
            </div>
            <div style={styles.joinBody}>
              <label style={styles.field}><span>NOMBRE DE LA EMPRESA</span><input value={editForm.name} onChange={e => setEditForm({...editForm,name:e.target.value})} /></label>
              <label style={styles.field}><span>CATEGORÍA</span><select value={editForm.category} onChange={e => setEditForm({...editForm,category:e.target.value})}><option>Tecnología</option><option>Viajes</option><option>Diseño</option><option>Comercio</option><option>Gastronomía</option><option>Servicios</option><option>Creativo</option><option>Business</option></select></label>
              <label style={styles.field}><span>DESCRIPCIÓN BREVE</span><textarea maxLength={120} value={editForm.description} onChange={e => setEditForm({...editForm,description:e.target.value})} /><small>{editForm.description.length}/120</small></label>
              <label style={styles.field}><span>SITIO WEB</span><input type="url" value={editForm.site} onChange={e => setEditForm({...editForm,site:e.target.value})} /></label>
              <label style={styles.field}><span>LOGO</span><div style={styles.logoUploadRow}><div style={styles.uploadLogoPreview}>{isImageUrl(editForm.logo) ? <img src={editForm.logo} alt="" /> : <span>{editForm.logo || editForm.name.slice(0,1).toUpperCase() || "C"}</span>}</div><label style={styles.uploadButton}>CAMBIAR LOGO<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e => { const f=e.target.files?.[0]; if(f){ if(!f.type.startsWith("image/")){setMessage("⚠️ El logo debe ser una imagen.");return;} if(f.size>2*1024*1024){setMessage("⚠️ El logo no puede superar 2 MB.");return;} setEditLogoFile(f); setEditForm({...editForm,logo:URL.createObjectURL(f)}); } }} /></label></div></label>
              <div style={styles.generatedPreview}><div style={styles.eyebrow}>VISTA PREVIA · BANNER ACTUALIZADO</div><div style={{...styles.previewBanner,borderColor:"#25d9ff"}}><div style={{...styles.generatedLogoLarge,borderColor:"#25d9ff",overflow:"hidden"}}>{isImageUrl(editForm.logo) ? <img src={editForm.logo} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}} /> : (editForm.logo || editForm.name.slice(0,1).toUpperCase() || "C")}</div><div><strong>{editForm.name || "Tu empresa"}</strong><p>{editForm.description || "Tu descripción breve aparecerá aquí."}</p><span style={styles.generatedCategory}>{editForm.category}</span></div></div></div>
              <button onClick={saveEdit} style={{...styles.primary,width:"100%"}}>GUARDAR CAMBIOS Y ACTUALIZAR BANNER →</button>
            </div>
          </div>
        </div>
      )}

      {infoPanel && (
        <div style={styles.modalBackdrop} onClick={() => setInfoPanel(null)}>
          <div style={styles.infoModal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoPanel(null)} style={styles.close}>×</button>
            <div style={styles.infoModalHead}>
              <div style={styles.eyebrow}>
                {infoPanel === "faq" ? "PREGUNTAS FRECUENTES" : infoPanel === "policies" ? "POLÍTICAS" : "BASES DE PARTICIPACIÓN"}
              </div>
              <h2 style={styles.h2}>
                {infoPanel === "faq" ? "Respuestas antes de participar." : infoPanel === "policies" ? "Transparencia y reglas de uso." : "Las reglas de la competencia mensual."}
              </h2>
            </div>
            <div style={styles.infoModalBody}>
              {infoPanel === "faq" && <>
                <InfoItem q="¿Qué es Creative Rank?" a="Una competencia mensual de visibilidad donde las marcas pueden promocionarse y competir por atención de la audiencia." />
                <InfoItem q="¿Los 20.000 créditos congelan mi posición?" a="No. El límite controla la influencia promocional. La respuesta real de la audiencia puede modificar las posiciones durante el mes." />
                <InfoItem q="¿Qué clics cuentan para el ranking?" a="La mecánica prevista separa las interacciones internas de los clics publicitarios generados por la audiencia. Los datos definitivos se detallarán en las Bases." />
                <InfoItem q="¿Cuándo termina la competencia?" a="Cada edición tiene un período mensual y los resultados se cierran al finalizar el período establecido." />
              </>}
              {infoPanel === "policies" && <>
                <InfoItem q="Privacidad" a="Los datos de participantes y visitantes deberán utilizarse según la política de privacidad publicada por Creative Rank." />
                <InfoItem q="Publicidad y medición" a="Las impresiones, visitas y clics se registrarán para medir el rendimiento de las publicaciones y detectar actividad irregular." />
                <InfoItem q="Uso responsable" a="No se permitirá manipular métricas mediante automatizaciones, tráfico artificial u otras prácticas que alteren la competencia." />
                <InfoItem q="Datos y cambios" a="Las políticas definitivas deberán publicarse antes de habilitar la participación comercial." />
              </>}
              {infoPanel === "rules" && <>
                <InfoItem q="Período" a="La competencia se organiza por ediciones mensuales. El ranking se cierra al finalizar cada edición." />
                <InfoItem q="Créditos" a="Los créditos tienen una función promocional y su influencia mensual está limitada a 20.000 por participante." />
                <InfoItem q="Ranking" a="La clasificación combina la mecánica promocional con métricas de respuesta de audiencia. La fórmula definitiva se publicará en las Bases." />
                <InfoItem q="Resultados" a="Al cierre se registran los resultados y los reconocimientos correspondientes. Las posiciones vuelven a comenzar en la nueva edición." />
              </>}
            </div>
          </div>
        </div>
      )}

      {profile && (
        <div style={styles.modalBackdrop} onClick={() => setProfileId(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfileId(null)} style={styles.close}>×</button>
            <button
              onClick={() => adClick(profile.id)}
              style={{ ...styles.modalBanner, background: `linear-gradient(135deg,${profile.accent},#784cff 55%,#07131c)`, width: "100%", border: 0, color: "#fff", cursor: "pointer", textAlign: "left" }}
              title="Click publicitario de prueba"
            >
              <span style={styles.modalRank}>#{profile.rank}</span><span style={styles.modalLive}>● BANNER ACTIVO · CLICK +1</span>
              <div style={styles.modalGeneratedBrand}><div style={{ ...styles.generatedLogoLarge, borderColor: "#fff" }}>{profile.logo}</div><div><small>CREATIVE RANK · {month}</small><h2>{profile.name}</h2><p>{profile.banner}</p><span style={styles.generatedCategory}>{profile.category}</span></div></div>
            </button>
            <div style={styles.modalBody}>
              <div><div style={styles.eyebrow}>{profile.category}</div><h3>{profile.handle}</h3></div>
              <div className="cr-modal-metrics" style={styles.modalMetrics}><Metric label="POSICIÓN" value={`#${profile.rank}`} /><Metric label="CR SCORE" value={profile.score.toLocaleString()} /><Metric label="IMPRESIONES" value={profile.impressions.toLocaleString()} /><Metric label="CLICKS" value={profile.clicks.toLocaleString()} /></div>
              <div style={styles.fakeChart}><div style={styles.chartLine}><i/><i/><i/><i/><i/><i/><i/></div><span>EVOLUCIÓN DEL SCORE · ÚLTIMOS 30 DÍAS</span></div>
              
              <div style={styles.promoBox}>
                <div>
                  <div style={styles.eyebrow}>PROMOCIÓN MENSUAL</div>
                  <h3 style={{margin:"5px 0 4px"}}>Impulsá tu presencia.</h3>
                  <p style={styles.p}>Elegí un paquete de créditos para aumentar tu influencia promocional durante esta edición.</p>
                </div>
                <div className="cr-package-grid" style={styles.packageGrid}>
                  {[
                    ["USD 10","100 CR"],
                    ["USD 25","275 CR"],
                    ["USD 50","600 CR"],
                    ["USD 100","1.300 CR"],
                    ["USD 250","3.500 CR"],
                    ["USD 500","8.000 CR"],
                  ].map(([price,credits]) => (
                    <button key={price} onClick={() => startCheckout(Number(price.replace("USD ","")))} disabled={saveBusy} style={styles.packageButton}>
                      <strong>{price}</strong><span>{credits}</span>
                    </button>
                  ))}
                </div>
                <small style={styles.packageNote}>Límite de influencia promocional: 20.000 créditos por participante y por edición.</small>
              </div>

              <div style={styles.modalActions}><button onClick={() => openEdit(profile)} style={styles.secondary}>EDITAR PERFIL ✎</button><button onClick={() => adClick(profile.id)} style={styles.primary}>CLICK PUBLICITARIO +1</button><a href={profile.site} target="_blank" rel="noreferrer" onClick={() => visitSite(profile.id)} style={styles.secondary}>VISITAR SITIO ↗</a><button onClick={() => setProfileId(null)} style={styles.secondary}>CERRAR</button></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({label,value}:{label:string;value:string}) {
  return <div style={styles.metric}><small>{label}</small><strong>{value}</strong></div>;
}

function InfoItem({q,a}:{q:string;a:string}) { return <div style={styles.infoItem}><div style={styles.infoItemQ}>{q}</div><p style={styles.infoItemA}>{a}</p></div>; }

function Step({n,title,text}:{n:string;title:string;text:string}) {
  return <article style={styles.step}><div style={styles.stepN}>{n}</div><h3>{title}</h3><p>{text}</p></article>;
}

const styles: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"radial-gradient(circle at 10% 0%,#251044 0,transparent 30%),radial-gradient(circle at 90% 10%,#063c52 0,transparent 28%),#07070d",color:"#f8f7ff",fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif",padding:"0 22px 40px"},
  header:{maxWidth:1380,margin:"0 auto",padding:"22px 0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,borderBottom:"1px solid rgba(255,255,255,.08)"},
  logo:{fontSize:27,fontWeight:950,letterSpacing:"-.07em"},tagline:{color:"#8e8ba0",fontSize:9,letterSpacing:".2em",marginTop:4},nav:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},
  navA:{color:"#bcb8ca",textDecoration:"none",fontSize:10,fontWeight:800,letterSpacing:".1em",padding:"9px 10px"},smallButton:{border:"1px solid rgba(255,255,255,.14)",background:"rgba(255,255,255,.04)",color:"#aaa6b7",borderRadius:9,padding:"8px 10px",fontSize:9,fontWeight:900,cursor:"pointer"},
  hero:{maxWidth:1380,margin:"0 auto",minHeight:510,display:"grid",gridTemplateColumns:"1.25fr .75fr",gap:22,alignItems:"center",padding:"65px 0 45px"},heroCopy:{position:"relative"},
  eyebrow:{color:"#65f4d0",fontSize:10,fontWeight:900,letterSpacing:".18em",textTransform:"uppercase" as const},h1:{fontSize:"clamp(54px,8vw,112px)",lineHeight:.86,letterSpacing:"-.085em",margin:"18px 0 25px",fontWeight:950},gradientText:{background:"linear-gradient(90deg,#25d9ff,#ff3cac,#ffd447)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  heroCopyP:{color:"#b5b0c1",fontSize:16,lineHeight:1.65,maxWidth:720,margin:0},heroButtons:{display:"flex",gap:10,flexWrap:"wrap",marginTop:27},
  primary:{border:0,borderRadius:13,padding:"13px 18px",background:"linear-gradient(135deg,#ff3cac,#784cff 55%,#25d9ff)",color:"white",fontWeight:900,fontSize:10,letterSpacing:".11em",cursor:"pointer",textDecoration:"none",display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:"0 10px 35px rgba(120,76,255,.28)"},
  secondary:{border:"1px solid rgba(255,255,255,.14)",borderRadius:13,padding:"12px 18px",background:"rgba(255,255,255,.04)",color:"#f0edf7",fontWeight:900,fontSize:10,letterSpacing:".11em",cursor:"pointer",textDecoration:"none",display:"inline-flex",alignItems:"center",justifyContent:"center"},
  heroCard:{minHeight:365,border:"1px solid rgba(255,255,255,.12)",borderRadius:30,padding:30,background:"linear-gradient(145deg,rgba(255,60,172,.16),rgba(37,217,255,.08) 48%,rgba(12,11,20,.94))",boxShadow:"0 25px 70px rgba(0,0,0,.35)",display:"flex",flexDirection:"column",justifyContent:"center"},cardLabel:{color:"#8e8ba0",fontSize:9,letterSpacing:".18em",fontWeight:900},monthTitle:{fontSize:26,fontWeight:900,margin:"8px 0 24px"},heroStats:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8},livePill:{marginTop:28,color:"#65f4d0",fontSize:10,letterSpacing:".12em",fontWeight:900},
  notice:{maxWidth:1380,margin:"0 auto 22px",border:"1px solid rgba(101,244,208,.2)",background:"rgba(101,244,208,.06)",borderRadius:14,padding:"12px 16px",color:"#b9f9e8",fontSize:11,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12},sourcePill:{flexShrink:0,border:"1px solid rgba(101,244,208,.25)",borderRadius:999,padding:"5px 8px",fontSize:8,fontWeight:900,letterSpacing:".08em"},section:{maxWidth:1380,margin:"0 auto",padding:"72px 0 20px"},sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,marginBottom:24},h2:{fontSize:"clamp(30px,4vw,54px)",lineHeight:1,letterSpacing:"-.065em",margin:"9px 0 0",maxWidth:800},monthBadge:{border:"1px solid rgba(255,255,255,.14)",borderRadius:999,padding:"9px 13px",color:"#d5d0df",fontSize:9,letterSpacing:".13em",fontWeight:900,background:"rgba(255,255,255,.04)"},
  dashboard:{display:"grid",gridTemplateColumns:"1.4fr .6fr",gap:16},tableCard:{border:"1px solid rgba(255,255,255,.11)",borderRadius:24,overflow:"hidden",background:"rgba(12,11,18,.86)",boxShadow:"0 20px 60px rgba(0,0,0,.2)"},tableHeader:{display:"grid",gridTemplateColumns:"36px minmax(130px,1.4fr) 90px 90px 70px 80px 75px 55px",gap:8,padding:"15px 14px",color:"#777487",fontSize:8,letterSpacing:".1em",fontWeight:900,borderBottom:"1px solid rgba(255,255,255,.07)"},
  row:{display:"grid",gridTemplateColumns:"36px minmax(130px,1.4fr) 90px 90px 70px 80px 75px 55px",gap:8,alignItems:"center",padding:"14px",borderBottom:"1px solid rgba(255,255,255,.055)",background:"transparent",color:"#eeeaf5",cursor:"pointer",fontSize:11,transition:"all .18s"},rowSelected:{background:"linear-gradient(90deg,rgba(255,60,172,.12),rgba(37,217,255,.06))",boxShadow:"inset 3px 0 #ff3cac"},rank:{color:"#f4c7ff",fontSize:14},person:{display:"flex",flexDirection:"column",gap:3},category:{border:"1px solid",borderRadius:999,padding:"4px 7px",fontSize:8,fontWeight:900,width:"fit-content"},score:{color:"#ffd447",fontSize:13},viewButton:{border:0,borderRadius:8,padding:"8px 9px",background:"linear-gradient(135deg,#ff3cac,#784cff)",color:"#fff",fontSize:8,fontWeight:900,cursor:"pointer"},
  sideCard:{border:"1px solid rgba(255,255,255,.12)",borderRadius:24,padding:20,background:"linear-gradient(160deg,rgba(120,76,255,.15),rgba(12,11,18,.94))",boxShadow:"0 20px 60px rgba(0,0,0,.25)"},profileBanner:{height:130,borderRadius:18,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#27114e,#0c5060)",padding:14,marginBottom:18},bannerGlow:{position:"absolute",width:160,height:160,borderRadius:"50%",filter:"blur(55px)",opacity:.55,right:-30,top:-40},profileRank:{position:"relative",fontSize:24,fontWeight:950},avatar:{position:"absolute",right:16,bottom:14,width:58,height:58,borderRadius:"50%",background:"rgba(255,255,255,.16)",border:"2px solid rgba(255,255,255,.5)",display:"grid",placeItems:"center",fontSize:24,fontWeight:950,backdropFilter:"blur(8px)"},metrics:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"18px 0"},metric:{border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:11,background:"rgba(0,0,0,.2)",display:"flex",flexDirection:"column",gap:6},progressLabel:{display:"flex",justifyContent:"space-between",color:"#8e8ba0",fontSize:9,marginTop:8},progress:{height:8,background:"#211d2b",borderRadius:99,overflow:"hidden",margin:"8px 0 18px"},actionGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},fullButton:{width:"100%",marginTop:9,border:"1px solid rgba(255,255,255,.12)",borderRadius:11,padding:"11px",background:"rgba(255,255,255,.04)",color:"#ddd8e8",fontSize:9,fontWeight:900,cursor:"pointer"},
  winnerGrid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12},winnerCard:{border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:18,background:"linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.015))",transition:"transform .2s"},winnerVisual:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18},miniBadge:{border:"1px solid",borderRadius:999,padding:"4px 7px",fontSize:8,fontWeight:900},winnerStats:{display:"flex",justifyContent:"space-between",alignItems:"end",marginTop:24,color:"#777487",fontSize:10},steps:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14},step:{border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:22,background:"rgba(255,255,255,.035)"},stepN:{color:"#ff64bb",fontWeight:950,fontSize:12,letterSpacing:".1em"},
  monthResetCard:{width:"100%",marginTop:18,border:"1px solid rgba(255,212,71,.5)",borderRadius:22,padding:"20px 22px",background:"linear-gradient(105deg,rgba(255,212,71,.12),rgba(255,60,172,.07),rgba(37,217,255,.05))",color:"#fff",textAlign:"left",cursor:"pointer",display:"grid",gridTemplateColumns:"54px 1fr auto",alignItems:"center",gap:16,boxShadow:"0 0 0 1px rgba(255,212,71,.05),0 18px 45px rgba(0,0,0,.22)"},
  monthResetIcon:{width:48,height:48,borderRadius:15,display:"grid",placeItems:"center",background:"linear-gradient(135deg,#ffd447,#ff3cac)",color:"#120b19",fontSize:25,fontWeight:950},
  monthResetEyebrow:{color:"#ffd447",fontSize:9,fontWeight:950,letterSpacing:".15em"},
  monthResetTitle:{fontSize:22,margin:"5px 0",letterSpacing:"-.04em"},
  monthResetText:{fontSize:12,lineHeight:1.55,color:"#aaa6b7",margin:0,maxWidth:800},
  monthResetArrow:{color:"#ffd447",fontSize:9,fontWeight:950,letterSpacing:".1em",whiteSpace:"nowrap"},
  infoSection:{maxWidth:1380,margin:"0 auto",padding:"65px 0 20px"},
  infoGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14},
  infoCard:{border:"1px solid rgba(255,255,255,.11)",borderRadius:22,padding:22,background:"linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.015))",color:"#f8f7ff",textAlign:"left",cursor:"pointer",display:"grid",gridTemplateColumns:"48px 1fr",gap:14},
  infoIcon:{width:42,height:42,borderRadius:13,display:"grid",placeItems:"center",background:"linear-gradient(135deg,#ff3cac,#784cff)",fontSize:18,fontWeight:950},
  authError:{border:"1px solid rgba(255,95,117,.45)",background:"rgba(255,95,117,.08)",color:"#ffb6c0",borderRadius:12,padding:"11px 13px",fontSize:11,lineHeight:1.5,fontWeight:800},
  authModal:{width:"min(620px,100%)",maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,255,255,.16)",borderRadius:28,background:"#0b0a12",boxShadow:"0 30px 100px rgba(0,0,0,.6)",position:"relative"},
  verificationCard:{padding:"42px 32px",textAlign:"center",display:"grid",gap:14},
  verificationIcon:{width:68,height:68,borderRadius:"50%",margin:"0 auto 4px",display:"grid",placeItems:"center",background:"linear-gradient(135deg,#65f4d0,#25d9ff)",color:"#07131c",fontSize:34,fontWeight:950,boxShadow:"0 0 40px rgba(101,244,208,.22)"},
  verificationTitle:{fontSize:"clamp(28px,5vw,42px)",lineHeight:1.02,letterSpacing:"-.055em",margin:"2px auto",maxWidth:520},
  verificationText:{color:"#aaa6b7",fontSize:13,lineHeight:1.65,maxWidth:500,margin:"0 auto 8px"},
  verificationSteps:{display:"grid",gap:8,textAlign:"left",margin:"4px 0 8px"},
  verificationStepsRow:{display:"flex",alignItems:"center",gap:10},
joinModal:{width:"min(720px,100%)",maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,255,255,.16)",borderRadius:28,background:"#0b0a12",boxShadow:"0 30px 100px rgba(0,0,0,.6)",position:"relative"},
  joinHead:{padding:"30px 28px 22px",background:"linear-gradient(135deg,rgba(255,60,172,.14),rgba(37,217,255,.07))",borderBottom:"1px solid rgba(255,255,255,.08)"},
  joinBody:{padding:24,display:"grid",gap:14},
  field:{display:"grid",gap:7,color:"#aaa6b7",fontSize:9,fontWeight:900,letterSpacing:".1em"},
  fieldInput:{},
  logoUploadRow:{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"},
  uploadLogoPreview:{width:64,height:64,borderRadius:16,border:"1px dashed rgba(255,255,255,.2)",background:"rgba(255,255,255,.04)",display:"grid",placeItems:"center",overflow:"hidden",fontSize:22,fontWeight:950,color:"#25d9ff"},
  uploadLogoPreviewImg:{width:"100%",height:"100%",objectFit:"contain"},
  uploadButton:{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"10px 13px",borderRadius:11,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.05)",color:"#fff",fontSize:9,fontWeight:900,letterSpacing:".08em",cursor:"pointer"},
  generatedPreview:{border:"1px solid rgba(255,255,255,.09)",borderRadius:18,padding:16,background:"rgba(255,255,255,.025)"},
  previewBanner:{minHeight:115,border:"1px solid",borderRadius:16,padding:16,display:"flex",alignItems:"center",gap:16,background:"linear-gradient(135deg,rgba(37,217,255,.12),rgba(120,76,255,.1))"},
  participantDashboard:{maxWidth:1380,margin:"0 auto",padding:"35px 0 20px"},
  dashboardIntro:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,marginBottom:16},
  participantGrid:{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:14},
  participantMainCard:{border:"1px solid rgba(255,255,255,.11)",borderRadius:24,padding:20,background:"linear-gradient(145deg,rgba(255,60,172,.09),rgba(37,217,255,.05),rgba(12,11,18,.92))"},
  activeBannerLabel:{color:"#65f4d0",fontSize:9,fontWeight:950,letterSpacing:".15em",marginBottom:10},
  dashboardBanner:{position:"relative",width:"100%",minHeight:160,overflow:"hidden",border:"1px solid",borderRadius:20,padding:18,background:"linear-gradient(135deg,#171129,#0a2430)",color:"#fff",display:"flex",alignItems:"center",gap:18,textAlign:"left",cursor:"pointer"},
  dashboardBannerCopy:{position:"relative",display:"flex",flexDirection:"column",gap:5},
  dashboardBottom:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:15,marginTop:14},
  kpiGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  promoBox:{marginTop:18,border:"1px solid rgba(255,212,71,.2)",borderRadius:18,padding:18,background:"rgba(255,212,71,.035)"},
  packageGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:13},
  packageButton:{border:"1px solid rgba(255,255,255,.11)",borderRadius:12,padding:"11px 9px",background:"rgba(255,255,255,.04)",color:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,textAlign:"left"},
  packageNote:{display:"block",color:"#777487",fontSize:9,marginTop:10},
  infoModal:{width:"min(760px,100%)",maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,255,255,.16)",borderRadius:28,background:"#0b0a12",boxShadow:"0 30px 100px rgba(0,0,0,.6)",position:"relative"},
  infoModalHead:{padding:"30px 28px 22px",background:"linear-gradient(135deg,rgba(255,60,172,.14),rgba(37,217,255,.07))",borderBottom:"1px solid rgba(255,255,255,.08)"},
  infoModalBody:{padding:"8px 28px 28px"},
  infoItem:{padding:"20px 0",borderBottom:"1px solid rgba(255,255,255,.08)"},
  infoItemQ:{fontSize:14,fontWeight:900,marginBottom:7},
  infoItemA:{fontSize:12,lineHeight:1.65,color:"#aaa6b7",margin:0},
  testPanel:{maxWidth:1380,margin:"72px auto 20px",border:"1px solid rgba(255,60,172,.25)",borderRadius:26,padding:28,background:"linear-gradient(110deg,rgba(255,60,172,.12),rgba(37,217,255,.07),rgba(12,11,18,.95))",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20},footer:{maxWidth:1380,margin:"55px auto 0",padding:"28px 0",borderTop:"1px solid rgba(255,255,255,.08)",color:"#6e6a79",display:"flex",justifyContent:"space-between",gap:16,fontSize:10},
  authBackdrop:{position:"fixed",inset:0,zIndex:100,background:"rgba(2,2,8,.78)",backdropFilter:"blur(12px)",display:"grid",placeItems:"center",padding:20},modal:{width:"min(720px,100%)",maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,255,255,.16)",borderRadius:28,background:"#0b0a12",boxShadow:"0 30px 100px rgba(0,0,0,.6)",position:"relative"},close:{position:"absolute",right:14,top:12,zIndex:2,width:36,height:36,borderRadius:"50%",border:"1px solid rgba(255,255,255,.2)",background:"rgba(0,0,0,.35)",color:"#fff",fontSize:22,cursor:"pointer"},modalBanner:{minHeight:240,padding:28,display:"flex",flexDirection:"column",justifyContent:"space-between",borderRadius:"28px 28px 0 0"},modalRank:{fontSize:34,fontWeight:950},modalLive:{alignSelf:"flex-end",marginTop:-30,fontSize:9,fontWeight:900,letterSpacing:".12em"},modalBody:{padding:24},modalMetrics:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,margin:"20px 0"},fakeChart:{height:130,border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:14,background:"linear-gradient(180deg,rgba(120,76,255,.08),transparent)",position:"relative",overflow:"hidden"},chartLine:{position:"absolute",left:15,right:15,bottom:35,height:75,display:"flex",alignItems:"end",gap:7},modalActions:{display:"flex",gap:9,marginTop:18}
};

/* Form controls use native browser styling while matching the Creative Rank visual system. */
if (typeof window !== "undefined") {
  const styleId = "creative-rank-mvp-responsive";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      *{box-sizing:border-box} html{scroll-behavior:smooth}
      button:hover,a:hover{filter:brightness(1.12);transform:translateY(-1px)} input,select,textarea{width:100%;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#12111b;color:#f8f7ff;padding:12px 13px;font:inherit;outline:none}textarea{min-height:88px;resize:vertical}input:focus,select:focus,textarea:focus{border-color:#25d9ff;box-shadow:0 0 0 3px rgba(37,217,255,.08)}
      @media(max-width:1050px){.cr-participant-grid{grid-template-columns:1fr!important}.cr-dashboard{grid-template-columns:1fr!important}.cr-table-card{overflow-x:auto}.cr-winners{grid-template-columns:repeat(3,1fr)!important}}
      @media(max-width:800px){.cr-dashboard-intro{flex-direction:column!important;align-items:flex-start!important}.cr-package-grid{grid-template-columns:repeat(2,1fr)!important}.cr-hero{grid-template-columns:1fr!important}.cr-winners{grid-template-columns:repeat(2,1fr)!important}.cr-steps{grid-template-columns:1fr!important}.cr-table-head{display:none!important}}
      @media(max-width:900px){.cr-info-grid{grid-template-columns:1fr!important}}
      @media(max-width:620px){.cr-dashboard{grid-template-columns:1fr!important}.cr-package-grid{grid-template-columns:1fr 1fr!important}.cr-header{flex-direction:column!important;align-items:flex-start!important}.cr-nav{width:100%!important}.cr-row{grid-template-columns:34px 1fr 55px!important}.cr-row>span:nth-child(3),.cr-row>span:nth-child(4),.cr-row>span:nth-child(5),.cr-row>span:nth-child(6),.cr-row>span:nth-child(7){display:none!important}.cr-winners{grid-template-columns:1fr!important}.cr-test{flex-direction:column!important;align-items:flex-start!important}.cr-footer{flex-direction:column!important}.cr-modal-metrics{grid-template-columns:1fr 1fr!important}}
    `;
    document.head.appendChild(style);
  }
}