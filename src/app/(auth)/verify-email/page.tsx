"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { verifyEmail, sendVerificationEmail } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";

  // State: "verifying" | "success" | "error" | "awaiting"
  const [status, setStatus] = React.useState<
    "verifying" | "success" | "error" | "awaiting"
  >(token ? "verifying" : "awaiting");

  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [resendEmail, setResendEmail] = React.useState<string>(emailParam);
  const [isResending, setIsResending] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  // Timer countdown effect for rate limiting resend button
  React.useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Keep resend email in sync if query param changes
  React.useEffect(() => {
    if (emailParam && !resendEmail) {
      setResendEmail(emailParam);
    }
  }, [emailParam, resendEmail]);

  // Automatic verification when token is present
  React.useEffect(() => {
    if (!token) {
      setStatus("awaiting");
      return;
    }

    let isMounted = true;

    async function attemptVerification(verifyToken: string) {
      try {
        setStatus("verifying");

        const response = await verifyEmail({
          query: { token: verifyToken },
        });

        if (!isMounted) return;

        if (response?.error) {
          setStatus("error");
          setErrorMessage(
            response.error.message ||
              "The verification link is invalid, expired, or has already been used."
          );
          toast.error(
            response.error.message || "Failed to verify email address."
          );
        } else {
          setStatus("success");
          toast.success("Email verified successfully! You can now sign in.");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setStatus("error");
        const msg =
          err instanceof Error
            ? err.message
            : "Verification failed. The token may be expired or invalid.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    }

    attemptVerification(token);

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Resend email handler with 60 second cooldown rate limit
  async function handleResendEmail(e: React.FormEvent) {
    e.preventDefault();

    const targetEmail = resendEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      toast.error("Please enter a valid email address to resend verification.");
      return;
    }

    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before requesting another email.`);
      return;
    }

    try {
      setIsResending(true);

      const response = await sendVerificationEmail({
        email: targetEmail,
        callbackURL: "/verify-email",
      });

      if (response?.error) {
        toast.error(
          response.error.message ||
            "Failed to send verification email. Please try again."
        );
        return;
      }

      toast.success("Verification email sent! Please check your inbox.");
      setCountdown(60);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while sending email.";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  }

  // 1. Verifying State
  if (status === "verifying") {
    return (
      <Card className="border-border/60 shadow-lg shadow-black/5 text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="size-6 animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verifying your email
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Please wait while we confirm your email address...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 2. Success State
  if (status === "success") {
    return (
      <Card className="border-border/60 shadow-lg shadow-black/5 text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Email verified!
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Your email has been confirmed. You can now access all features of your Slotly account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/login?verified=true")}
            className="w-full font-medium"
          >
            Continue to sign in
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 3. Error / Expired Token State
  if (status === "error") {
    return (
      <Card className="border-border/60 shadow-lg shadow-black/5">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Verification link invalid or expired
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {errorMessage ||
              "This verification link is invalid, expired, or has already been used. Please request a new one below."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleResendEmail} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="resend-error-email" className="text-xs">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="resend-error-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  disabled={isResending}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isResending || countdown > 0 || !resendEmail}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending email...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="mr-2 size-4" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 size-4" />
                  Send new verification link
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/40 p-4 text-center text-xs text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // 4. Awaiting Verification (Arrived from register or default)
  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Verify your email
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {emailParam ? (
            <>
              We sent a verification link to{" "}
              <span className="font-semibold text-foreground">
                {emailParam}
              </span>
              . Click the link in that email to activate your account.
            </>
          ) : (
            "We have sent a verification link to your email address. Please click the link to activate your account."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Didn&apos;t receive the email?</p>
          <p>
            Check your spam or junk folder, or request another link using the form
            below.
          </p>
        </div>

        <form onSubmit={handleResendEmail} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="resend-email" className="text-xs">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="resend-email"
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={isResending}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={isResending || countdown > 0 || !resendEmail}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending verification email...
              </>
            ) : countdown > 0 ? (
              <>
                <RefreshCw className="mr-2 size-4" />
                Resend in {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Resend verification email
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 p-4 text-center text-xs text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/60 shadow-lg shadow-black/5 animate-pulse text-center">
          <CardHeader className="space-y-2">
            <div className="mx-auto size-12 rounded-full bg-muted" />
            <div className="h-6 w-48 bg-muted rounded mx-auto" />
            <div className="h-4 w-64 bg-muted rounded mx-auto" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
