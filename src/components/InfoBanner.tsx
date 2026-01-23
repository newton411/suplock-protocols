import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ChevronRight, X } from "lucide-react";

interface InfoBannerProps {
  title: string;
  description: string;
  tip?: string;
  onDismiss?: () => void;
  variant?: "default" | "accent" | "warning";
}

export function InfoBanner({
  title,
  description,
  tip,
  onDismiss,
  variant = "default",
}: InfoBannerProps) {
  const variants = {
    default: "bg-primary/5 border-primary/20",
    accent: "bg-accent/5 border-accent/20",
    warning: "bg-destructive/5 border-destructive/20",
  };

  const textVariants = {
    default: "text-primary",
    accent: "text-accent",
    warning: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 border ${variants[variant]} mb-6`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 bg-primary/10 border border-primary/20 shrink-0`}>
          <Lightbulb className={`w-4 h-4 ${textVariants[variant]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-bold uppercase tracking-widest ${textVariants[variant]} mb-1`}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
          {tip && (
            <p className="text-[10px] text-primary/60 mt-2 flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              {tip}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-primary/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-primary/40" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
