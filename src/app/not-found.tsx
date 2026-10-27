import Link from "next/link";
import { FileQuestion, Home, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Icon Graphic */}
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <FileQuestion className="h-12 w-12" />
      </div>

      <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground mb-4">
        Error 404
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
        Page Not Found
      </h1>

      <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground leading-relaxed">
        The page or service you are trying to reach doesn&apos;t exist, has been removed, or is temporarily unavailable.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" className="gap-2 shadow-sm" asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="gap-2" asChild>
          <Link href="/services">
            <Calendar className="h-4 w-4" />
            <span>Browse Services</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
