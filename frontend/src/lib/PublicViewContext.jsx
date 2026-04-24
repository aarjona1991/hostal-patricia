import { createContext, useContext } from "react";

/** `viewData` de `/api/sections` ya localizado (`localizeSectionsMap`) para páginas internas. */
export const PublicViewContext = createContext(null);

export function usePublicView() {
  return useContext(PublicViewContext);
}
