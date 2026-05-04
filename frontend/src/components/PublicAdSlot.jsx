import AdsterraSlot from "./AdsterraSlot.jsx";
import GoogleAdSlot from "./GoogleAdSlot.jsx";

/**
 * @param {{ placement: { provider: string; adClient?: string; adSlot?: string; adsterraKey?: string; adsterraInvokeUrl?: string; adsterraWidth?: number; adsterraHeight?: number } | null }} props
 */
export default function PublicAdSlot({ placement }) {
  if (!placement) return null;
  if (placement.provider === "adsterra") {
    return (
      <AdsterraSlot
        adKey={placement.adsterraKey}
        invokeUrl={placement.adsterraInvokeUrl}
        width={placement.adsterraWidth}
        height={placement.adsterraHeight}
      />
    );
  }
  return <GoogleAdSlot adClient={placement.adClient} adSlot={placement.adSlot} />;
}
