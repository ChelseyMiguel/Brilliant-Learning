/**
 * FormulaSheet — a modal that shows a printable formula/key-rules sheet
 * for a given course. Triggered from course-detail and lesson-player.
 *
 * Usage:
 *   <FormulaSheet courseId={3} trigger={<Button>Formula Sheet</Button>} />
 */

import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, ScrollText } from "lucide-react";
import { FORMULA_SHEETS } from "@/data/formulaSheets";

interface FormulaSheetProps {
  courseId: number;
  trigger?: React.ReactNode;
}

export default function FormulaSheet({ courseId, trigger }: FormulaSheetProps) {
  const sheet = FORMULA_SHEETS[courseId];
  const printRef = useRef<HTMLDivElement>(null);

  if (!sheet) return null;

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sheet.courseTitle} — Formula Sheet</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
            .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
            h2 { font-size: 13px; font-weight: 700; text-transform: uppercase;
                 letter-spacing: 0.06em; color: #4f46e5; margin: 20px 0 8px; }
            .block { background: #f9fafb; border: 1px solid #e5e7eb;
                     border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
            .block-label { font-size: 11px; color: #6b7280; margin-bottom: 3px; }
            .block-formula { font-family: "Courier New", monospace; font-size: 14px;
                             font-weight: 600; color: #1e1b4b; }
            .block-note { font-size: 11px; color: #6b7280; margin-top: 3px; }
            hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>${sheet.courseTitle}</h1>
          <p class="subtitle">Formula Sheet — Lumina Learning</p>
          <hr />
          ${sheet.sections.map(section => `
            <h2>${section.heading}</h2>
            ${section.blocks.map(block => `
              <div class="block">
                <div class="block-label">${block.label}</div>
                <div class="block-formula">${block.formula}</div>
                ${block.note ? `<div class="block-note">${block.note}</div>` : ""}
              </div>
            `).join("")}
          `).join("")}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <ScrollText className="w-3.5 h-3.5" />
            Formula Sheet
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[82vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6">
            <span className="font-bold">{sheet.courseTitle}</span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0 text-xs"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Sheet body */}
        <div ref={printRef} className="mt-2 space-y-5">
          {sheet.sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
                {section.heading}
              </h3>
              <div className="space-y-2">
                {section.blocks.map((block) => (
                  <div
                    key={block.label}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  >
                    <p className="text-[11px] text-muted-foreground mb-0.5">{block.label}</p>
                    <p className="font-mono text-sm font-semibold text-indigo-900">
                      {block.formula}
                    </p>
                    {block.note && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{block.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
