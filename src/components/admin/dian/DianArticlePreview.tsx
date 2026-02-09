import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import {
  AlertTriangle, Calendar, Clock, FileCheck, FileText, Gavel,
  HelpCircle, Key, LogIn, Globe, Receipt, RefreshCw, Shield, ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle, Calendar, Clock, FileCheck, FileText, Gavel,
  HelpCircle, Key, LogIn, Globe, Receipt, RefreshCw, Shield, ShieldCheck,
};

interface SectionBlock { title: string; content: string; bullets?: string[]; }
interface PainVsSolution { pain: string; solution: string; }
interface FAQ { question: string; answer: string; }

interface PreviewProps {
  h1: string;
  hero_subtitle: string;
  hero_badge: string;
  hero_icon: string;
  sections: SectionBlock[];
  pain_vs_solution: PainVsSolution[];
  faqs: FAQ[];
  cta_text: string;
}

export function DianArticlePreview({ h1, hero_subtitle, hero_badge, hero_icon, sections, pain_vs_solution, faqs, cta_text }: PreviewProps) {
  const Icon = iconMap[hero_icon] || FileText;

  return (
    <div className="border rounded-lg overflow-hidden bg-background text-foreground text-xs">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground p-4">
        <Badge className="mb-2 bg-white/20 text-white border-white/30 text-[10px]">
          <Icon className="h-2.5 w-2.5 mr-1" />
          {hero_badge || "Badge"}
        </Badge>
        <h2 className="text-sm font-bold leading-tight">{h1 || "Título del artículo"}</h2>
        {hero_subtitle && <p className="text-[10px] mt-1 text-primary-foreground/80 line-clamp-2">{hero_subtitle}</p>}
      </div>

      {/* Sections */}
      <div className="p-3 space-y-3">
        {sections.length === 0 && <p className="text-muted-foreground italic">Sin secciones aún</p>}
        {sections.slice(0, 3).map((sec, i) => (
          <div key={i}>
            <h3 className="font-semibold text-[11px] mb-1">{sec.title || "Sección sin título"}</h3>
            <p className="text-muted-foreground text-[10px] line-clamp-2">{sec.content}</p>
            {sec.bullets && sec.bullets.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {sec.bullets.slice(0, 3).map((b, j) => (
                  <li key={j} className="text-[10px] text-muted-foreground flex items-start gap-1">
                    <span className="text-primary mt-0.5">•</span> {b}
                  </li>
                ))}
                {sec.bullets.length > 3 && <li className="text-[10px] text-muted-foreground/60">+{sec.bullets.length - 3} más...</li>}
              </ul>
            )}
          </div>
        ))}
        {sections.length > 3 && <p className="text-[10px] text-muted-foreground/60">+{sections.length - 3} secciones más...</p>}
      </div>

      {/* Pain vs Solution */}
      {pain_vs_solution.length > 0 && (
        <>
          <Separator />
          <div className="p-3">
            <h3 className="font-semibold text-[11px] mb-2">⚡ Dolor vs Solución</h3>
            <div className="space-y-1.5">
              {pain_vs_solution.slice(0, 3).map((pvs, i) => (
                <div key={i} className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-start gap-1 text-[10px]">
                    <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                    <span>{pvs.pain}</span>
                  </div>
                  <div className="flex items-start gap-1 text-[10px]">
                    <CheckCircle className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    <span>{pvs.solution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <>
          <Separator />
          <div className="p-3">
            <h3 className="font-semibold text-[11px] mb-1">❓ FAQs ({faqs.length})</h3>
            {faqs.slice(0, 2).map((faq, i) => (
              <div key={i} className="mt-1">
                <p className="text-[10px] font-medium">{faq.question}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CTA */}
      {cta_text && (
        <>
          <Separator />
          <div className="p-3 text-center">
            <Button size="sm" className="h-7 text-[10px]">
              {cta_text} <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
