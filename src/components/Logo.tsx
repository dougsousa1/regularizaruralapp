import Image from "next/image";
import Link from "next/link";

export default function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Regulariza Rural — início">
      <Image
        src="/img/rr.png"
        alt=""
        width={283}
        height={166}
        priority
        className={`${compacto ? "h-7" : "h-9"} w-auto drop-shadow-[0_2px_8px_rgba(212,162,83,0.35)] transition group-hover:brightness-110`}
      />
      <span className="leading-none">
        <span className={`block font-display font-bold uppercase tracking-[0.06em] text-white ${compacto ? "text-[13px]" : "text-[15px]"}`}>
          Regulariza Rural
        </span>
        <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.28em] text-ouro-400">
          Central de consulta
        </span>
      </span>
    </Link>
  );
}
