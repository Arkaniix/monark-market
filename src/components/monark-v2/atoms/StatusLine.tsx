import { useEffect, useState } from "react";

interface StatusLineProps {
  text: string;
  state?: "pending" | "success" | "error";
  errorText?: string;
  animateTypewriter?: boolean;
}

export function StatusLine({
  text,
  state = "pending",
  errorText,
  animateTypewriter = true,
}: StatusLineProps) {
  const [typed, setTyped] = useState(animateTypewriter ? "" : text);
  const [done, setDone] = useState(!animateTypewriter);

  useEffect(() => {
    if (!animateTypewriter) {
      setTyped(text);
      setDone(true);
      return;
    }
    setTyped("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 22);
    return () => clearInterval(id);
  }, [text, animateTypewriter]);

  return (
    <div className="font-monarkMono text-sm text-zinc-300">
      <span>&gt; {typed}</span>
      {done && state === "success" && (
        <span className="ml-2 text-monark-bull animate-in fade-in duration-300">✓</span>
      )}
      {done && state === "error" && (
        <span className="ml-2 text-monark-bear animate-in fade-in duration-300">
          ✗{errorText ? ` ${errorText}` : ""}
        </span>
      )}
    </div>
  );
}