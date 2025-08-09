"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { useMapSettings } from "../providers/map-settings";

export default function MapControlsOverlay() {
  const { showTerritories, setShowTerritories } = useMapSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute right-3 top-4 z-20 flex flex-col items-end gap-2">
      <div
        aria-hidden={!open}
        className={
          "w-64 max-w-[80vw] overflow-hidden rounded-md text-white shadow-lg backdrop-blur transition-all duration-200 ease-out " +
          (open
            ? "pointer-events-auto border border-white/15 bg-black/70 p-3 opacity-100 translate-y-0 scale-100 max-h-48"
            : "pointer-events-none border border-transparent bg-black/0 p-0 opacity-0 -translate-y-1 scale-95 max-h-0")
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Map Controls</div>
          <button
            aria-label="Close map controls"
            className="rounded px-2 py-1 text-sm hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showTerritories}
            onChange={(e) => setShowTerritories(e.target.checked)}
          />
          Territories overlay
        </label>
      </div>

      <button
        aria-label={open ? "Hide map controls" : "Show map controls"}
        className={
          "pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-md backdrop-blur transition-all duration-200 ease-out hover:bg-black/70 " +
          (open ? "translate-y-2" : "translate-y-0")
        }
        onClick={() => setOpen((v) => !v)}
      >
        <Layers size={20} />
      </button>
    </div>
  );
}

