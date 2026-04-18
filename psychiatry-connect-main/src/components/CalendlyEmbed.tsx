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
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      window.removeEventListener("message", handleMessage);
    };
  }, [onEventScheduled]);

  // Build URL with prefill and hide branding
  let calendlyUrl = url;
  const params = new URLSearchParams();
  if (prefill?.name) params.set("name", prefill.name);
  if (prefill?.email) params.set("email", prefill.email);
  params.set("hide_gdpr_banner", "1");
  params.set("hide_event_type_details", "0");
  calendlyUrl = `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;

  return (
    <>
      <style>{`
        .calendly-inline-widget .calendly-badge-widget,
        .calendly-inline-widget [data-container="branding"],
        .calendly-inline-widget .calendly-powered-by {
          display: none !important;
        }
      `}</style>
      <div
        className="calendly-inline-widget w-full"
        data-url={calendlyUrl}
        style={{ minWidth: "320px", height: "700px" }}
      />
    </>
  );
}
