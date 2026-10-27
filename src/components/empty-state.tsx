import * as React from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: ButtonProps["variant"];
}

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: EmptyStateAction | React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const isActionObject =
    action &&
    typeof action === "object" &&
    "label" in action &&
    ("href" in action || "onClick" in action);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5">
          {isActionObject ? (
            (() => {
              const act = action as EmptyStateAction;
              if (act.href) {
                return (
                  <Button variant={act.variant ?? "default"} asChild>
                    <Link href={act.href}>{act.label}</Link>
                  </Button>
                );
              }
              return (
                <Button
                  variant={act.variant ?? "default"}
                  onClick={act.onClick}
                >
                  {act.label}
                </Button>
              );
            })()
          ) : (
            (action as React.ReactNode)
          )}
        </div>
      )}
    </div>
  );
}
