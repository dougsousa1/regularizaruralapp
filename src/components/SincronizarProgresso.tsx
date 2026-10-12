"use client";

import { useEffect, useRef } from "react";
import {
  aoMudarEstado,
  CHAVE_DONO,
  exportarEstado,
  importarEstado,
  juntarEstados,
  limparEstadoLocal,
  type EstadoCompleto,
} from "@/lib/estado";
import { supabaseNavegador } from "@/lib/supabase/cliente";

/**
 * Mantém salvos, concluídos, recentes e checklists na conta do aluno:
 * ao abrir o app junta o que está no aparelho com o que está no banco,
 * e depois envia cada mudança (agrupada a cada 1,5 s).
 */
export default function SincronizarProgresso() {
  const pronto = useRef(false);
  const usuario = useRef<string | null>(null);

  useEffect(() => {
    const supabase = supabaseNavegador();
    let espera: ReturnType<typeof setTimeout> | undefined;
    let importando = false;

    const enviar = async () => {
      if (!usuario.current) return;
      const e = exportarEstado();
      await supabase.from("progresso").upsert({ usuario_id: usuario.current, ...e });
    };

    const iniciar = async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user.id;
      if (!id) return;
      usuario.current = id;

      // Aparelho usado por outra conta antes: não mistura os dados.
      let dono: string | null = null;
      try {
        dono = localStorage.getItem(CHAVE_DONO);
      } catch {}
      if (dono && dono !== id) limparEstadoLocal();
      try {
        localStorage.setItem(CHAVE_DONO, id);
      } catch {}

      const { data: linha } = await supabase
        .from("progresso")
        .select("favoritos, concluidos, recentes, checklists")
        .eq("usuario_id", id)
        .maybeSingle();
      const remoto: EstadoCompleto = {
        favoritos: linha?.favoritos ?? [],
        concluidos: linha?.concluidos ?? [],
        recentes: linha?.recentes ?? [],
        checklists: (linha?.checklists as EstadoCompleto["checklists"]) ?? {},
      };
      importando = true;
      importarEstado(juntarEstados(exportarEstado(), remoto));
      importando = false;
      pronto.current = true;
      await enviar();

      // Último acesso (uma vez por sessão do navegador).
      try {
        if (!sessionStorage.getItem("rr-acesso-registrado")) {
          await supabase.rpc("registrar_acesso");
          sessionStorage.setItem("rr-acesso-registrado", "1");
        }
      } catch {}
    };

    iniciar();
    const parar = aoMudarEstado((chave) => {
      if (!pronto.current || importando || chave === CHAVE_DONO) return;
      clearTimeout(espera);
      espera = setTimeout(enviar, 1500);
    });
    return () => {
      parar();
      clearTimeout(espera);
    };
  }, []);

  return null;
}
