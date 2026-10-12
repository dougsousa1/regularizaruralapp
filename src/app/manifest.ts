import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Regulariza Rural — Central de Consulta",
    short_name: "Regulariza Rural",
    description: "Guias, checklists e fluxos de decisão do Regulariza Rural.",
    start_url: "/",
    display: "standalone",
    background_color: "#06100c",
    theme_color: "#06100c",
    lang: "pt-BR",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
