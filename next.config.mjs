/** @type {import('next').NextConfig} */
const nextConfig = {
  // O conteúdo vem dos arquivos em conteudo/, lidos no build.
  outputFileTracingIncludes: { "/**": ["./conteudo/**/*"] },
};

export default nextConfig;
