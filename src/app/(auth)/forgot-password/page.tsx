"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { forgetPassword } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const email = values.email.trim().toLowerCase();
    try {
      setIsLoading(true);

      // Call Better Auth client method
      await forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      // ALWAYS show success to prevent email enumeration attacks
      setSubmittedEmail(email);
      setIsSubmitted(true);
      toast.success(
        "If an account exists, a password reset link has been dispatched."
      );
    } catch {
      // Still show success to prevent email enumeration
      setSubmittedEmail(email);
      setIsSubmitted(true);
      toast.success(
        "If an account exists, a password reset link has been dispatched."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Success view after submitting email
  if (isSubmitted) {
    return (
      <Card className="border-border/60 shadow-lg shadow-black/5 text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your inbox
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-semibold text-foreground">
              {submittedEmail}
            </span>
            , we have sent a link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
            <p>
              Please allow a few minutes for the email to arrive. Be sure to also
              check your spam or junk folder.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              form.reset({ email: "" });
            }}
          >
            <RefreshCw className="mr-2 size-3.5" />
            Try another email address
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/40 p-4 text-center text-xs text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Return to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Initial input form
  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Forgot password?
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          No worries. Enter your email and we&apos;ll send you instructions to
          reset your password.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
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
