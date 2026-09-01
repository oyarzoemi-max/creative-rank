'use client';

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Category = "DESIGN" | "COPY" | "BUILD";

type BidEntry = {
  rank: number;
  name: string;
  specialty: string;
  bid: string;
  bidValue: number;
  score: string;
  minimumRequired: number;
};

type DemoFormState = {
  creatorName: string;
  professionalTitle: string;
  bio: string;
  location: string;
  email: string;
  portfolioUrl: string;
  socialUrl: string;
  profileImageUrl: string;
  category: Category;
  specialty: string;
  projectTitle: string;
  projectImageUrl: string;
  projectUrl: string;
  projectDescription: string;
  desiredPosition: number | null;
  bidAmount: string;
};

type DemoSuccessState = {
  creatorName: string;
  position: number;
  category: Category;
  specialty: string;
  bidAmount: number;
};

const navItems = [
  { label: "LIVE BIDS", id: "live-bids" },
  { label: "SHOWCASE", id: "showcase" },
  { label: "TRENDING", id: "trending" },
  { label: "HOW IT WORKS", id: "how-it-works" },
];

const conceptCards = [
  {
    title: "COMPETE",
    text: "Bid for real visibility every 48 hours.",
  },
  {
    title: "SHOWCASE",
    text: "Top 10 get featured for the world to see.",
  },
  {
    title: "GET DISCOVERED",
    text: "Brands find talent that delivers.",
  },
];

const baseLiveBids: BidEntry[] = [
  { rank: 1, name: "Aster Vale", specialty: "Motion Design", bid: "$18.4K", bidValue: 18400, score: "96.8", minimumRequired: 19600 },
  { rank: 2, name: "Nova Kline", specialty: "Brand Systems", bid: "$16.1K", bidValue: 16100, score: "95.6", minimumRequired: 17100 },
  { rank: 3, name: "Luma Reed", specialty: "3D Illustration", bid: "$15.7K", bidValue: 15700, score: "94.9", minimumRequired: 16800 },
  { rank: 4, name: "Kiro Sato", specialty: "Product Storytelling", bid: "$14.8K", bidValue: 14800, score: "93.7", minimumRequired: 15800 },
  { rank: 5, name: "Zee Sol", specialty: "Campaign Art", bid: "$13.9K", bidValue: 13900, score: "92.4", minimumRequired: 14900 },
  { rank: 6, name: "Rae Moss", specialty: "Editorial Design", bid: "$12.6K", bidValue: 12600, score: "91.3", minimumRequired: 13400 },
  { rank: 7, name: "Iris Noon", specialty: "AI Visuals", bid: "$11.3K", bidValue: 11300, score: "90.8", minimumRequired: 12100 },
  { rank: 8, name: "Juno Faye", specialty: "Brand Film", bid: "$10.9K", bidValue: 10900, score: "89.2", minimumRequired: 11600 },
  { rank: 9, name: "Milo Hart", specialty: "UX Motion", bid: "$9.8K", bidValue: 9800, score: "88.6", minimumRequired: 10400 },
  { rank: 10, name: "Sora Venn", specialty: "Packaging Design", bid: "$9.2K", bidValue: 9200, score: "87.9", minimumRequired: 9800 },
];

const showcaseCards = [
  { name: "Aster Vale", specialty: "Motion Design", score: "96.8" },
  { name: "Nova Kline", specialty: "Brand Systems", score: "95.6" },
  { name: "Luma Reed", specialty: "3D Illustration", score: "94.9" },
  { name: "Kiro Sato", specialty: "Product Storytelling", score: "93.7" },
  { name: "Zee Sol", specialty: "Campaign Art", score: "92.4" },
  { name: "Rae Moss", specialty: "Editorial Design", score: "91.3" },
  { name: "Iris Noon", specialty: "AI Visuals", score: "90.8" },
  { name: "Juno Faye", specialty: "Brand Film", score: "89.2" },
  { name: "Milo Hart", specialty: "UX Motion", score: "88.6" },
  { name: "Sora Venn", specialty: "Packaging Design", score: "87.9" },
];

const trendingCreators = [
  { rank: 1, name: "Aster Vale", specialty: "Motion Design", score: 96.8 },
  { rank: 2, name: "Nova Kline", specialty: "Brand Systems", score: 95.6 },
  { rank: 3, name: "Luma Reed", specialty: "3D Illustration", score: 94.9 },
  { rank: 4, name: "Kiro Sato", specialty: "Product Storytelling", score: 93.7 },
  { rank: 5, name: "Zee Sol", specialty: "Campaign Art", score: 92.4 },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "BUILD YOUR PROFILE",
    text: "Show the portfolio and skills that prove your creative edge.",
  },
  {
    step: "02",
    title: "PLACE A BID",
    text: "Compete for the best position in the next 48-hour ranking cycle.",
  },
  {
    step: "03",
    title: "EARN ATTENTION",
    text: "Top performers get discovered, featured, and validated by the market.",
  },
];

const categoryOptions: Category[] = ["DESIGN", "COPY", "BUILD"];

const specialtyOptions: Record<Category, string[]> = {
  DESIGN: ["UI/UX Design", "Branding", "Graphic Design", "Art Direction", "Illustration"],
  COPY: ["Copywriting", "Content Marketing", "Brand Voice", "Email Marketing", "SEO Copy"],
  BUILD: ["Web Development", "App Development", "No-Code", "Frontend Development", "Product Design Systems"],
};

const createDefaultDemoForm = (): DemoFormState => ({
  creatorName: "",
  professionalTitle: "",
  bio: "",
  location: "",
  email: "",
  portfolioUrl: "",
  socialUrl: "",
  profileImageUrl: "",
  category: "DESIGN",
  specialty: specialtyOptions.DESIGN[0],
  projectTitle: "",
  projectImageUrl: "",
  projectUrl: "",
  projectDescription: "",
  desiredPosition: null,
  bidAmount: "",
});

const formatCurrencyCompact = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }

  return `$${value.toLocaleString()}`;
};

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const isValidUrl = (value: string) => {
  if (!value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const scrollToSection = (sectionId: string) => {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export default function Home() {
  const [deadline] = useState(() => Date.now() + 48 * 60 * 60 * 1000);
  const [now, setNow] = useState(Date.now());
  const [liveBids, setLiveBids] = useState<BidEntry[]>(baseLiveBids);
  const [selectedBid, setSelectedBid] = useState<BidEntry | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-up");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [demoFlowOpen, setDemoFlowOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [demoForm, setDemoForm] = useState<DemoFormState>(createDefaultDemoForm());
  const [demoErrors, setDemoErrors] = useState<Record<string, string>>({});
  const [demoSuccess, setDemoSuccess] = useState<DemoSuccessState | null>(null);

  const totalDemoSteps = 6;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const countdown = useMemo(
    () => formatCountdown(Math.max(deadline - now, 0)),
    [deadline, now],
  );

  const currentPositionData = demoForm.desiredPosition
    ? liveBids.find((entry) => entry.rank === demoForm.desiredPosition) ?? null
    : null;

  const openDemoFlow = (preselectedPosition?: number) => {
    if (!session) {
      setAuthMode("sign-up");
      setAuthError("");
      setAuthInfo("");
      setAuthModalOpen(true);
      return;
    }

    setDemoFlowOpen(true);
    setDemoStep(1);
    setDemoErrors({});
    setDemoSuccess(null);
    setDemoForm({
      ...createDefaultDemoForm(),
      desiredPosition: preselectedPosition ?? null,
      bidAmount: preselectedPosition ? String(liveBids.find((entry) => entry.rank === preselectedPosition)?.minimumRequired ?? 0) : "",
    });
    setSelectedBid(null);
  };

  const handleAuthSubmit = async () => {
    const email = authEmail.trim();
    const password = authPassword.trim();

    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthInfo("");

    try {
      const supabase = createSupabaseBrowserClient();

      if (authMode === "sign-up") {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.session) {
          setSession(signUpData.session);
          setAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setSelectedBid(null);
          setDemoFlowOpen(true);
          setDemoStep(1);
          setDemoErrors({});
          setDemoSuccess(null);
          setDemoForm(createDefaultDemoForm());
          return;
        }

        setAuthInfo("Account created. Confirm your email if required, then sign in to continue.");
        setAuthMode("sign-in");
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      setSession(signInData.session);
      setAuthModalOpen(false);
      setAuthEmail("");
      setAuthPassword("");
      setSelectedBid(null);
      setDemoFlowOpen(true);
      setDemoStep(1);
      setDemoErrors({});
      setDemoSuccess(null);
      setDemoForm(createDefaultDemoForm());
    } catch (error) {
      console.error("Supabase auth failed:", error);
      setAuthError(
        error instanceof Error ? error.message : "Authentication failed. Please try again.",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFieldChange = (field: keyof DemoFormState, value: string) => {
    setDemoForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setDemoErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const handleCategoryChange = (category: Category) => {
    setDemoForm((previous) => ({
      ...previous,
      category,
      specialty: specialtyOptions[category][0],
    }));
  };

  const validateCurrentStep = () => {
    const nextErrors: Record<string, string> = {};

    if (demoStep === 1) {
      if (!demoForm.creatorName.trim()) nextErrors.creatorName = "Creator name is required.";
      if (!demoForm.professionalTitle.trim()) nextErrors.professionalTitle = "Professional title is required.";
      if (!demoForm.bio.trim()) nextErrors.bio = "Short bio is required.";
      if (!demoForm.location.trim()) nextErrors.location = "Location is required.";
      if (!demoForm.email.trim()) nextErrors.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demoForm.email)) nextErrors.email = "Please enter a valid email address.";
      if (!demoForm.portfolioUrl.trim()) nextErrors.portfolioUrl = "Portfolio URL is required.";
      else if (!isValidUrl(demoForm.portfolioUrl)) nextErrors.portfolioUrl = "Please enter a valid http or https URL.";
      if (!demoForm.socialUrl.trim()) nextErrors.socialUrl = "Social/profile URL is required.";
      else if (!isValidUrl(demoForm.socialUrl)) nextErrors.socialUrl = "Please enter a valid http or https URL.";
      if (!demoForm.profileImageUrl.trim()) nextErrors.profileImageUrl = "Profile image URL is required.";
      else if (!isValidUrl(demoForm.profileImageUrl)) nextErrors.profileImageUrl = "Please enter a valid http or https URL.";
    }

    if (demoStep === 2) {
      if (!demoForm.category.trim()) nextErrors.category = "Choose a category.";
      if (!demoForm.specialty.trim()) nextErrors.specialty = "Add your specialty.";
    }

    if (demoStep === 3) {
      if (!demoForm.projectTitle.trim()) nextErrors.projectTitle = "Featured project title is required.";
      if (!demoForm.projectImageUrl.trim()) nextErrors.projectImageUrl = "Project image URL is required.";
      else if (!isValidUrl(demoForm.projectImageUrl)) nextErrors.projectImageUrl = "Please enter a valid http or https URL.";
      if (!demoForm.projectUrl.trim()) nextErrors.projectUrl = "Project URL is required.";
      else if (!isValidUrl(demoForm.projectUrl)) nextErrors.projectUrl = "Please enter a valid http or https URL.";
      if (!demoForm.projectDescription.trim()) nextErrors.projectDescription = "Project description is required.";
    }

    if (demoStep === 4 && demoForm.desiredPosition === null) {
      nextErrors.desiredPosition = "Select a position to take.";
    }

    if (demoStep === 5) {
      if (!demoForm.bidAmount.trim()) nextErrors.bidAmount = "Enter a demo bid amount.";
      else {
        const parsedBid = Number(demoForm.bidAmount);
        const minimumRequired = currentPositionData?.minimumRequired ?? 0;

        if (Number.isNaN(parsedBid) || parsedBid < minimumRequired) {
          nextErrors.bidAmount = `Bid must be at least ${formatCurrencyCompact(minimumRequired)}.`;
        }
      }
    }

    setDemoErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleDemoNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setDemoStep((previous) => Math.min(previous + 1, totalDemoSteps));
  };

  const handleDemoBack = () => {
    setDemoStep((previous) => Math.max(previous - 1, 1));
  };

  const handleDemoConfirm = async () => {
    const bidValue = Number(demoForm.bidAmount);
    const minimumRequired = currentPositionData?.minimumRequired ?? 0;

    if (!demoForm.desiredPosition || !currentPositionData) {
      setDemoErrors((previous) => ({
        ...previous,
        desiredPosition: "Select a desired position before confirming.",
      }));
      setDemoStep(4);
      return;
    }

    if (!demoForm.bidAmount.trim()) {
      setDemoErrors((previous) => ({
        ...previous,
        bidAmount: "Enter a demo bid amount.",
      }));
      return;
    }

    if (Number.isNaN(bidValue) || bidValue < minimumRequired) {
      setDemoErrors((previous) => ({
        ...previous,
        bidAmount: `Bid must be at least ${formatCurrencyCompact(minimumRequired)}.`,
      }));
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setAuthError("Your session expired. Please sign in again.");
        setAuthModalOpen(true);
        return;
      }

      const { error: insertError } = await supabase.from("creators").insert([
        {
          user_id: user.id,
          name: demoForm.creatorName.trim(),
          professional_title: demoForm.professionalTitle.trim(),
          bio: demoForm.bio.trim(),
          location: demoForm.location.trim(),
          email: demoForm.email.trim(),
          portfolio_url: demoForm.portfolioUrl.trim(),
          social_url: demoForm.socialUrl.trim(),
          profile_image_url: demoForm.profileImageUrl.trim(),
          category: demoForm.category,
          specialty: demoForm.specialty.trim() || demoForm.category,
        },
      ]);

      if (insertError) {
        console.error("Supabase insert failed for creators:", insertError);
        setDemoErrors({
          ...demoErrors,
          submit: insertError.message,
        });
        return;
      }
    } catch (error) {
      console.error("Unexpected error saving creator profile:", error);
      return;
    }

    const targetRank = demoForm.desiredPosition;
    const demoEntry: BidEntry = {
      rank: targetRank,
      name: demoForm.creatorName.trim(),
      specialty: demoForm.specialty.trim() || demoForm.category,
      bid: formatCurrencyCompact(bidValue),
      bidValue,
      score: "NEW",
      minimumRequired: currentPositionData.minimumRequired,
    };

    const nextList = [...liveBids];
    const targetIndex = targetRank - 1;
    const shifted = nextList.map((entry, index) => {
      if (index === targetIndex) {
        return demoEntry;
      }

      if (index > targetIndex) {
        return nextList[index - 1];
      }

      return entry;
    }).slice(0, 10).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const successSnapshot: DemoSuccessState = {
      creatorName: demoForm.creatorName.trim(),
      position: targetRank,
      category: demoForm.category,
      specialty: demoForm.specialty.trim() || demoForm.category,
      bidAmount: bidValue,
    };

    setLiveBids(shifted);
    setDemoSuccess(successSnapshot);
    setDemoStep(6);
  };

  const renderProfileStep = () => (
    <div className="demo-step-body">
      <div className="form-grid">
        <label className="field">
          <span>Creator name</span>
          <input
            value={demoForm.creatorName}
            onChange={(event) => handleFieldChange("creatorName", event.target.value)}
            aria-invalid={Boolean(demoErrors.creatorName)}
            placeholder="Your artist name"
          />
          {demoErrors.creatorName ? <small className="field-error">{demoErrors.creatorName}</small> : null}
        </label>

        <label className="field">
          <span>Professional title</span>
          <input
            value={demoForm.professionalTitle}
            onChange={(event) => handleFieldChange("professionalTitle", event.target.value)}
            aria-invalid={Boolean(demoErrors.professionalTitle)}
            placeholder="Creative Director"
          />
          {demoErrors.professionalTitle ? <small className="field-error">{demoErrors.professionalTitle}</small> : null}
        </label>

        <label className="field field-wide">
          <span>Short bio</span>
          <textarea
            value={demoForm.bio}
            onChange={(event) => handleFieldChange("bio", event.target.value)}
            aria-invalid={Boolean(demoErrors.bio)}
            placeholder="Describe your creative focus and strengths"
          />
          {demoErrors.bio ? <small className="field-error">{demoErrors.bio}</small> : null}
        </label>

        <label className="field">
          <span>Location</span>
          <input
            value={demoForm.location}
            onChange={(event) => handleFieldChange("location", event.target.value)}
            aria-invalid={Boolean(demoErrors.location)}
            placeholder="Berlin, DE"
          />
          {demoErrors.location ? <small className="field-error">{demoErrors.location}</small> : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={demoForm.email}
            onChange={(event) => handleFieldChange("email", event.target.value)}
            aria-invalid={Boolean(demoErrors.email)}
            placeholder="name@example.com"
          />
          {demoErrors.email ? <small className="field-error">{demoErrors.email}</small> : null}
        </label>

        <label className="field field-wide">
          <span>Portfolio URL</span>
          <input
            type="url"
            value={demoForm.portfolioUrl}
            onChange={(event) => handleFieldChange("portfolioUrl", event.target.value)}
            aria-invalid={Boolean(demoErrors.portfolioUrl)}
            placeholder="https://yourportfolio.com"
          />
          {demoErrors.portfolioUrl ? <small className="field-error">{demoErrors.portfolioUrl}</small> : null}
        </label>

        <label className="field field-wide">
          <span>Social/profile URL</span>
          <input
            type="url"
            value={demoForm.socialUrl}
            onChange={(event) => handleFieldChange("socialUrl", event.target.value)}
            aria-invalid={Boolean(demoErrors.socialUrl)}
            placeholder="https://instagram.com/yourhandle"
          />
          {demoErrors.socialUrl ? <small className="field-error">{demoErrors.socialUrl}</small> : null}
        </label>

        <label className="field field-wide">
          <span>Profile image URL</span>
          <input
            type="url"
            value={demoForm.profileImageUrl}
            onChange={(event) => handleFieldChange("profileImageUrl", event.target.value)}
            aria-invalid={Boolean(demoErrors.profileImageUrl)}
            placeholder="https://images.example.com/profile.jpg"
          />
          {demoErrors.profileImageUrl ? <small className="field-error">{demoErrors.profileImageUrl}</small> : null}
        </label>
      </div>
    </div>
  );

  const renderCategoryStep = () => (
    <div className="demo-step-body">
      <div className="field">
        <span>Category</span>
        <div className="choice-grid">
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              className={`choice-button ${demoForm.category === category ? "active" : ""}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {demoErrors.category ? <small className="field-error">{demoErrors.category}</small> : null}
      </div>

      <label className="field">
        <span>Specialty</span>
        <input
          list="specialty-options"
          value={demoForm.specialty}
          onChange={(event) => handleFieldChange("specialty", event.target.value)}
          aria-invalid={Boolean(demoErrors.specialty)}
          placeholder="Type your specialty"
        />
        <datalist id="specialty-options">
          {specialtyOptions[demoForm.category].map((specialty) => (
            <option key={specialty} value={specialty} />
          ))}
        </datalist>
        {demoErrors.specialty ? <small className="field-error">{demoErrors.specialty}</small> : null}
      </label>
    </div>
  );

  const renderWorkStep = () => (
    <div className="demo-step-body">
      <div className="form-grid">
        <label className="field field-wide">
          <span>Featured project title</span>
          <input
            value={demoForm.projectTitle}
            onChange={(event) => handleFieldChange("projectTitle", event.target.value)}
            aria-invalid={Boolean(demoErrors.projectTitle)}
            placeholder="Launch campaign systems redesign"
          />
          {demoErrors.projectTitle ? <small className="field-error">{demoErrors.projectTitle}</small> : null}
        </label>

        <label className="field field-wide">
          <span>Project image URL</span>
          <input
            type="url"
            value={demoForm.projectImageUrl}
            onChange={(event) => handleFieldChange("projectImageUrl", event.target.value)}
            aria-invalid={Boolean(demoErrors.projectImageUrl)}
            placeholder="https://images.example.com/project.jpg"
          />
          {demoErrors.projectImageUrl ? <small className="field-error">{demoErrors.projectImageUrl}</small> : null}
        </label>

        <label className="field field-wide">
          <span>Project/portfolio URL</span>
          <input
            type="url"
            value={demoForm.projectUrl}
            onChange={(event) => handleFieldChange("projectUrl", event.target.value)}
            aria-invalid={Boolean(demoErrors.projectUrl)}
            placeholder="https://yourproject.com"
          />
          {demoErrors.projectUrl ? <small className="field-error">{demoErrors.projectUrl}</small> : null}
        </label>

        <label className="field field-wide">
          <span>Short project description</span>
          <textarea
            value={demoForm.projectDescription}
            onChange={(event) => handleFieldChange("projectDescription", event.target.value)}
            aria-invalid={Boolean(demoErrors.projectDescription)}
            placeholder="Summarize the work and the result"
          />
          {demoErrors.projectDescription ? <small className="field-error">{demoErrors.projectDescription}</small> : null}
        </label>
      </div>

      <div className="demo-preview-card">
        <div className="preview-image-card">
          <div
            className="preview-art"
            style={{
              backgroundImage: demoForm.profileImageUrl
                ? `linear-gradient(135deg, rgba(139, 61, 255, 0.22), rgba(0,0,0,0.04)), url(${demoForm.profileImageUrl})`
                : "linear-gradient(135deg, rgba(139, 61, 255, 0.42), rgba(18, 18, 24, 0.2), rgba(255,255,255,0.08))",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div className="preview-copy">
          <div className="preview-topline">PREVIEW</div>
          <h4>{demoForm.creatorName || "Creator Name"}</h4>
          <p>{demoForm.professionalTitle || "Professional Title"}</p>
          <div className="preview-meta">
            <span>{demoForm.category}</span>
            <span>{demoForm.specialty || "Specialty"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPositionStep = () => (
    <div className="demo-step-body">
      <div className="position-summary-card">
        <div>
          <span>Current creator</span>
          <strong>{demoForm.creatorName || "Your creator name"}</strong>
        </div>
        <div>
          <span>Current bid</span>
          <strong>{currentPositionData ? currentPositionData.bid : "—"}</strong>
        </div>
        <div>
          <span>Minimum required</span>
          <strong>{currentPositionData ? formatCurrencyCompact(currentPositionData.minimumRequired) : "—"}</strong>
        </div>
      </div>

      <div className="position-grid">
        {liveBids.map((entry) => (
          <button
            key={entry.rank}
            type="button"
            className={`position-option ${demoForm.desiredPosition === entry.rank ? "selected" : ""}`}
            onClick={() => {
              setDemoForm((previous) => ({
                ...previous,
                desiredPosition: entry.rank,
                bidAmount: previous.bidAmount || String(entry.minimumRequired),
              }));
              setDemoErrors((previous) => ({
                ...previous,
                desiredPosition: "",
              }));
            }}
          >
            <div className="position-option-top">
              <span>#{entry.rank}</span>
              <span className="position-badge">TAKE #{entry.rank}</span>
            </div>
            <div className="position-option-name">{entry.name}</div>
            <div className="position-option-meta">
              <span>Current bid</span>
              <strong>{entry.bid}</strong>
            </div>
            <div className="position-option-meta">
              <span>Minimum required</span>
              <strong>{formatCurrencyCompact(entry.minimumRequired)}</strong>
            </div>
          </button>
        ))}
      </div>

      {demoErrors.desiredPosition ? <small className="field-error">{demoErrors.desiredPosition}</small> : null}
    </div>
  );

  const renderReviewStep = () => {
    const selectedPosition = currentPositionData;

    return (
      <div className="demo-step-body">
        <div className="review-grid">
          <div className="review-item">
            <span>Creator</span>
            <strong>{demoForm.creatorName}</strong>
          </div>
          <div className="review-item">
            <span>Category</span>
            <strong>{demoForm.category}</strong>
          </div>
          <div className="review-item">
            <span>Specialty</span>
            <strong>{demoForm.specialty}</strong>
          </div>
          <div className="review-item">
            <span>Desired ranking position</span>
            <strong>#{demoForm.desiredPosition}</strong>
          </div>
          <div className="review-item">
            <span>Current bid</span>
            <strong>{selectedPosition ? selectedPosition.bid : "—"}</strong>
          </div>
          <div className="review-item">
            <span>Minimum required bid</span>
            <strong>{selectedPosition ? formatCurrencyCompact(selectedPosition.minimumRequired) : "—"}</strong>
          </div>
        </div>

        <label className="field">
          <span>Demo bid amount</span>
          <input
            type="number"
            min={selectedPosition?.minimumRequired ?? 0}
            value={demoForm.bidAmount}
            onChange={(event) => handleFieldChange("bidAmount", event.target.value)}
            aria-invalid={Boolean(demoErrors.bidAmount)}
            placeholder={String(selectedPosition?.minimumRequired ?? 0)}
          />
          <small className="field-hint">Must be equal to or greater than {selectedPosition ? formatCurrencyCompact(selectedPosition.minimumRequired) : "$0"}.</small>
          {demoErrors.bidAmount ? <small className="field-error">{demoErrors.bidAmount}</small> : null}
        </label>
      </div>
    );
  };

  const renderSuccessStep = () => {
    const successData: DemoSuccessState = demoSuccess ?? {
      creatorName: demoForm.creatorName.trim(),
      position: demoForm.desiredPosition ?? 1,
      category: demoForm.category,
      specialty: demoForm.specialty.trim() || demoForm.category,
      bidAmount: Number(demoForm.bidAmount || 0),
    };

    return (
      <div className="demo-step-body success-step">
        <div className="success-badge">ESTÁS EN EL RANKING</div>
        <h4>{successData.creatorName}</h4>
        <p>
          Nueva posición simulada: <strong>#{successData.position}</strong>
        </p>
        <p>
          Oferta confirmada: <strong>{formatCurrencyCompact(successData.bidAmount)}</strong>
        </p>
        <p>
          Creador: <strong>{successData.creatorName}</strong>
        </p>
        <div className="success-meta">
          <span>{successData.category}</span>
          <span>{successData.specialty}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap" aria-label="Creative Rank home">
          <div className="brand-mark">CR</div>
          <span>CREATIVE RANK</span>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {session ? (
            <button
              className="secondary-button button-medium"
              onClick={async () => {
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signOut();
                setSession(null);
              }}
            >
              LOG OUT
            </button>
          ) : (
            <button className="secondary-button button-medium" onClick={() => setAuthModalOpen(true)}>
              LOG IN
            </button>
          )}
          <button className="primary-button button-medium" onClick={() => openDemoFlow()}>
            JOIN THE RANKING
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">VISIBLE. VOTED. VERIFIED.</div>
            <h1>
              WHO GETS THE <span className="attention-text">ATTENTION?</span>
            </h1>
            <p className="hero-subtitle">
              Creators compete for visibility.
              <span className="divider-dot">•</span>
              Their work decides who rises.
            </p>

            <div className="hero-actions">
              <button className="primary-button" onClick={() => openDemoFlow()}>
                ENTER THE RANKING
              </button>
              <button className="secondary-button" onClick={() => scrollToSection("trending")}>
                DISCOVER TALENT
              </button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-glow" />
            <div className="mini-score-card">
              <div className="mini-header">
                <span className="mini-label">TOP CREATOR</span>
                <span className="mini-pill">LIVE</span>
              </div>
              <h2>Aster Vale</h2>
              <p>Motion Design</p>
              <div className="mini-stats">
                <div>
                  <span>Attention</span>
                  <strong>96.8</strong>
                </div>
                <div>
                  <span>Bid</span>
                  <strong>$18.4K</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="concept-grid" aria-label="Platform value propositions">
          {conceptCards.map((card) => (
            <article key={card.title} className="concept-card">
              <div className="concept-title">{card.title}</div>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="section-block live-bids-block" id="live-bids">
          <div className="section-header">
            <div>
              <div className="section-kicker">LIVE BIDS</div>
              <h3>Round closes in</h3>
            </div>
            <div className="countdown" aria-live="polite">
              {countdown}
            </div>
          </div>

          <div className="bid-layout">
            <div className="ranking-panel">
              <div className="ranking-header">
                <span>TOP 10 RANKING</span>
                <span className="status-pill">48H ROUND</span>
              </div>

              <div className="rank-list">
                {liveBids.map((entry) => (
                  <div key={entry.rank} className="rank-row">
                    <div className="rank-cell rank-index">#{entry.rank}</div>
                    <div className="rank-cell creator-meta">
                      <strong>{entry.name}</strong>
                      <span>{entry.specialty}</span>
                    </div>
                    <div className="rank-cell bid-value">{entry.bid}</div>
                    <div className="rank-cell score-value">{entry.score}</div>
                    <button
                      className="take-button"
                      onClick={() => {
                        setSelectedBid(entry);
                      }}
                    >
                      TAKE #{entry.rank}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <aside className="leader-panel">
              <div className="leader-topline">CURRENT LEADER</div>
              <h4>Aster Vale</h4>
              <p>Motion Design / Campaign Systems</p>
              <div className="leader-metrics">
                <div>
                  <span>Attention Score</span>
                  <strong>96.8</strong>
                </div>
                <div>
                  <span>Bid Active</span>
                  <strong>$18.4K</strong>
                </div>
              </div>
              <div className="leader-visual">
                <div className="visual-orb orb-1" />
                <div className="visual-orb orb-2" />
                <div className="visual-orb orb-3" />
              </div>
            </aside>
          </div>
        </section>

        <section className="section-block showcase-block" id="showcase">
          <div className="section-header compact">
            <div>
              <div className="section-kicker">SHOWCASE</div>
              <h3>Previous round Top 10</h3>
            </div>
          </div>

          <div className="showcase-grid">
            {showcaseCards.map((card, index) => (
              <article key={card.name} className="showcase-card">
                <div className="card-number">#{index + 1}</div>
                <div className="card-visual" />
                <h4>{card.name}</h4>
                <p>{card.specialty}</p>
                <div className="score-row">
                  <span>Attention Score</span>
                  <strong>{card.score}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block trending-block" id="trending">
          <div className="section-header compact">
            <div>
              <div className="section-kicker">TRENDING CREATORS</div>
              <h3>August</h3>
            </div>
          </div>

          <div className="trending-table-wrap">
            <div className="trending-table" role="table" aria-label="Trending creators list">
              <div className="table-head" role="row">
                <span role="columnheader">Rank</span>
                <span role="columnheader">Creator</span>
                <span role="columnheader">Specialty</span>
                <span role="columnheader">Attention Score</span>
              </div>

              {trendingCreators.map((creator) => (
                <div key={creator.rank} className="table-row" role="row">
                  <span role="cell">#{creator.rank}</span>
                  <span role="cell" className="creator-name">{creator.name}</span>
                  <span role="cell">{creator.specialty}</span>
                  <span role="cell" className="table-score">{creator.score}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block how-it-works-block" id="how-it-works">
          <div className="section-header compact">
            <div>
              <div className="section-kicker">HOW IT WORKS</div>
              <h3>Three steps to the top</h3>
            </div>
          </div>

          <div className="how-it-works-grid">
            {howItWorksSteps.map((step) => (
              <article key={step.step} className="how-it-works-card">
                <div className="how-it-works-step">{step.step}</div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-panel">
          <div>
            <div className="section-kicker">ARE YOU A CREATIVE?</div>
            <h3>Get seen. Prove your work. Earn your rank.</h3>
          </div>
          <button className="primary-button" onClick={() => openDemoFlow()}>
            JOIN THE NEXT ROUND
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="brand-mark small">CR</div>
          <span>CREATIVE RANK</span>
        </div>

        <p>Visibility is bought. Attention is earned.</p>

        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </footer>

      {selectedBid && (
        <div className="bid-modal-backdrop" onClick={() => setSelectedBid(null)}>
          <div
            className="bid-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bid-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelectedBid(null)} aria-label="Close bid modal">
              ×
            </button>
            <div className="section-kicker">TAKE POSITION</div>
            <h4 id="bid-modal-title">Creator position #{selectedBid.rank}</h4>

            <div className="modal-details">
              <div>
                <span>Creator</span>
                <strong>{selectedBid.name}</strong>
              </div>
              <div>
                <span>Current bid</span>
                <strong>{selectedBid.bid}</strong>
              </div>
              <div>
                <span>Minimum amount required</span>
                <strong>{formatCurrencyCompact(selectedBid.minimumRequired)}</strong>
              </div>
            </div>

            <button
              className="primary-button modal-button"
              onClick={() => {
                setSelectedBid(null);
                openDemoFlow(selectedBid.rank);
              }}
            >
              CONTINUE TO BID
            </button>
          </div>
        </div>
      )}

      {authModalOpen && (
        <div className="demo-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div
            className="demo-modal auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="demo-modal-header">
              <div>
                <div className="section-kicker">ACCESS</div>
                <h3 id="auth-modal-title">{authMode === "sign-up" ? "Create account" : "Sign in"}</h3>
              </div>
              <button className="modal-close" onClick={() => setAuthModalOpen(false)} aria-label="Close auth modal">
                ×
              </button>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <label className="field field-wide">
                <span>Email</span>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="name@example.com"
                />
              </label>

              <label className="field field-wide">
                <span>Password</span>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </label>
            </div>

            {authError ? <small className="field-error">{authError}</small> : null}
            {authInfo ? <small className="field-hint">{authInfo}</small> : null}

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setAuthMode(authMode === "sign-up" ? "sign-in" : "sign-up")}>
                {authMode === "sign-up" ? "Already have an account?" : "Need an account?"}
              </button>
              <button className="primary-button" type="button" onClick={handleAuthSubmit} disabled={authLoading}>
                {authLoading ? "PLEASE WAIT..." : authMode === "sign-up" ? "CREATE ACCOUNT" : "SIGN IN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {demoFlowOpen && (
        <div className="demo-modal-backdrop" onClick={() => setDemoFlowOpen(false)}>
          <div
            className="demo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="demo-modal-header">
              <div>
                <div className="section-kicker">JOIN THE RANKING</div>
                <h3 id="demo-modal-title">Create your demo profile</h3>
              </div>
              <button className="modal-close" onClick={() => setDemoFlowOpen(false)} aria-label="Close creator flow modal">
                ×
              </button>
            </div>

            <div className="demo-progress" aria-live="polite">
              PASO {demoStep} DE {totalDemoSteps}
            </div>
            <div className="demo-progress-bar" aria-hidden="true">
              <span style={{ width: `${(demoStep / totalDemoSteps) * 100}%` }} />
            </div>

            {demoStep === 1 && renderProfileStep()}
            {demoStep === 2 && renderCategoryStep()}
            {demoStep === 3 && renderWorkStep()}
            {demoStep === 4 && renderPositionStep()}
            {demoStep === 5 && renderReviewStep()}
            {demoStep === 6 && renderSuccessStep()}

            {demoStep >= 1 && demoStep <= 4 && (
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={handleDemoBack} disabled={demoStep === 1}>
                  Atrás
                </button>
                <button className="primary-button" type="button" onClick={handleDemoNext}>
                  Continuar
                </button>
              </div>
            )}

            {demoStep === 6 && (
              <div className="modal-actions success-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    setDemoFlowOpen(false);
                    scrollToSection("live-bids");
                  }}
                >
                  VER CLASIFICACIÓN EN VIVO
                </button>
              </div>
            )}

            {demoStep === 5 && (
              <div className="modal-actions confirm-actions">
                <button className="secondary-button" type="button" onClick={handleDemoBack}>
                  Atrás
                </button>
                <button className="primary-button" type="button" onClick={handleDemoConfirm}>
                  CONFIRMAR OFERTA DE DEMO
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
