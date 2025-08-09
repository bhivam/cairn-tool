"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type MapSettingsContextValue = {
  showTerritories: boolean;
  setShowTerritories: (value: boolean) => void;
};

const MapSettingsContext = createContext<MapSettingsContextValue | undefined>(
  undefined,
);

export function MapSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Territories overlay should be OFF by default
  const [showTerritories, setShowTerritories] = useState<boolean>(false);

  const value = useMemo(
    () => ({ showTerritories, setShowTerritories }),
    [showTerritories],
  );

  return (
    <MapSettingsContext.Provider value={value}>
      {children}
    </MapSettingsContext.Provider>
  );
}

export function useMapSettings(): MapSettingsContextValue {
  const ctx = useContext(MapSettingsContext);
  if (!ctx)
    throw new Error(
      "useMapSettings must be used within a MapSettingsProvider",
    );
  return ctx;
}

