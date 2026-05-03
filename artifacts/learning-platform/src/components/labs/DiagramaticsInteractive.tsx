import { useEffect, useRef } from "react";
import type { Interactive } from "diagramatics";

export type DiagramaticsSetup = (
  int: Interactive,
  lib: typeof import("diagramatics")
) => void;

interface Props {
  setup: DiagramaticsSetup;
  className?: string;
}

export default function DiagramaticsInteractive({ setup, className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const intRef = useRef<Interactive | null>(null);

  useEffect(() => {
    if (!svgRef.current || !controlsRef.current) return;
    let cancelled = false;
    let instance: Interactive | null = null;

    import("diagramatics").then((lib) => {
      if (cancelled || !svgRef.current || !controlsRef.current) return;
      const { Interactive } = lib;
      instance = new Interactive(controlsRef.current, svgRef.current);
      intRef.current = instance;
      setup(instance, lib);
    });

    return () => {
      cancelled = true;
      instance?.removeRegisteredEventListener();
    };
  }, []);

  return (
    <div className={`diagramatics-container ${className}`}>
      <svg
        ref={svgRef}
        className="w-full"
        style={{ display: "block", overflow: "visible", minHeight: "420px" }}
      />
      <div
        ref={controlsRef}
        className="diagramatics-controls"
      />
    </div>
  );
}
