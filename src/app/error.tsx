"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log unexpected runtime error for diagnostics without exposing stack trace to users
    console.error("Global application error captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Icon Graphic */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
        <AlertCircle className="h-10 w-10" />
      </div>

      <div className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive mb-4">
        Unexpected Error
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Something went wrong!
      </h1>

      <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground leading-relaxed">
        We encountered an unexpected problem while processing your request. Please try again or return to the homepage.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={() => reset()}
          className="gap-2 shadow-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
        <Button size="lg" variant="outline" className="gap-2" asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
