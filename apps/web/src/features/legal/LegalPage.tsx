import { Link, Navigate, useParams } from "react-router";
import { LEGAL_DOCS } from "@addendex/shared";
import type { LegalDocId } from "@addendex/shared";
import { ThemeToggle } from "../../shared/components/ThemeToggle";
import { LEGAL_CONTENT, LEGAL_COPYRIGHT } from "./content";

const VALID_SLUGS: readonly LegalDocId[] = ["terminos", "privacidad", "cookies"];

function isLegalDocId(value: string | undefined): value is LegalDocId {
  return value !== undefined && (VALID_SLUGS as readonly string[]).includes(value);
}

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!isLegalDocId(slug)) {
    return <Navigate to="/" replace />;
  }

  const meta = LEGAL_DOCS[slug];
  const content = LEGAL_CONTENT[slug];

  return (
    <div className="min-h-screen bg-base">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="99 Soluciones" className="h-12 w-auto" />
              <span className="text-sm font-normal tracking-tight text-ink">
                Generador de addendas
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="text-sm text-ink transition-colors hover:text-accent">
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">{meta.titulo}</h1>
        <p className="mt-1 text-sm text-muted">Última actualización: {meta.actualizado}</p>

        {content.intro && <p className="mt-6 text-sm leading-relaxed text-ink">{content.intro}</p>}

        <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-ink">
          {content.blocks.map((block, i) => {
            switch (block.kind) {
              case "h2":
                return (
                  <h2 key={i} className="mt-4 text-lg font-semibold">
                    {block.text}
                  </h2>
                );
              case "h3":
                return (
                  <h3 key={i} className="mt-2 font-semibold">
                    {block.text}
                  </h3>
                );
              case "p":
                return <p key={i}>{block.text}</p>;
              case "list":
                return (
                  <ul key={i} className="list-disc space-y-1 pl-5 text-muted">
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
            }
          })}
        </div>

        <p className="mt-10 border-t border-line pt-4 text-xs text-muted">{LEGAL_COPYRIGHT}</p>
      </main>
    </div>
  );
}
