import { useEffect } from "react";

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  onEventScheduled?: () => void;
}

declare global {
  interface Window {
    Calendly?: any;
  }
}

export function CalendlyEmbed({ url, prefill, onEventScheduled }: CalendlyEmbedProps) {
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    // Listen for Calendly events
    const handleMessage = (e: MessageEvent) => {
      if (e.data.event && e.data.event === "calendly.event_scheduled") {
        onEventScheduled?.();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      document.body.removeChild(script);
      window.removeEventListener("message", handleMessage);
    };
  }, [onEventScheduled]);

  // Build URL with prefill
  let calendlyUrl = url;
  if (prefill) {
    const params = new URLSearchParams();
    if (prefill.name) params.set("name", prefill.name);
    if (prefill.email) params.set("email", prefill.email);
    calendlyUrl = `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;
  }

  return (
    <div
      className="calendly-inline-widget w-full"
      data-url={calendlyUrl}
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}
