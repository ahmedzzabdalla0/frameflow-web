"use client";

import { useState } from "react";
import { Check, Link } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  url: string;
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {}
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command failed");
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyText(url);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <Button
      variant="icon"
      active={copied}
      tone="positive"
      title={copied ? "Copied" : "Copy video link"}
      aria-label={copied ? "Video link copied" : "Copy video link"}
      onClick={(event) => {
        event.stopPropagation();
        void handleCopy();
      }}
      className={cn("absolute top-4 right-4 z-5", copied && "animate-copy-pop")}
    >
      {copied ? <Check size={18} /> : <Link size={18} />}
    </Button>
  );
}
