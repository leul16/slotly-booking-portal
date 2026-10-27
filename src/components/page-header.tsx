import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 pt-2 md:flex-row md:items-center md:justify-between border-b mb-6",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {backHref && (
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-3 mb-1 text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{backLabel}</span>
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>

      {(action || children) && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}
