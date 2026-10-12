import Image from "next/image";

export default function LayoutAcesso({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <Image src="/img/priscila-campo.webp" alt="" fill priority sizes="100vw" className="object-cover object-[60%_25%] opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-noite-950/70 via-noite-900/90 to-noite-950" />
      </div>
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-mata-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-ouro-400/10 blur-3xl" />

      <div className="flex w-full max-w-md flex-col items-center">
        <Image src="/img/rr.png" alt="" width={283} height={166} priority className="h-14 w-auto drop-shadow-[0_4px_16px_rgba(212,162,83,0.4)]" />
        <p className="mt-4 font-display text-lg font-bold uppercase tracking-[0.08em] text-white">Regulariza Rural</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-ouro-400">Central de consulta</p>
        <div className="mt-8 w-full rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-8 animate-surgir">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-white/35">Conteúdo exclusivo para alunos do Regulariza Rural.</p>
      </div>
    </div>
  );
}
