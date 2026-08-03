import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Several projects share this parent folder; pin the root so Turbopack does
  // not walk up and pick a sibling lockfile.
  turbopack: { root: __dirname },

  // `standalone` emite .next/standalone com um server.js e só as dependências
  // realmente usadas — é o que a imagem de produção copia.
  output: "standalone",

  images: {
    // Fotos de anúncio vêm da CDN do canal, nunca do nosso domínio.
    remotePatterns: [{ protocol: "https", hostname: "**.mlstatic.com" }],
  },
};

export default nextConfig;
