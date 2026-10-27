"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { resetPassword } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
      token: token,
    },
    mode: "onChange",
  });

  // Sync token if search params become available
  React.useEffect(() => {
    if (token) {
      form.setValue("token", token);
    }
  }, [token, form]);

  const passwordValue = form.watch("password") || "";

  // Password criteria checklist
  const passwordCriteria = [
    {
      label: "At least 8 characters",
      satisfied: passwordValue.length >= 8,
    },
    {
      label: "One uppercase letter (A-Z)",
      satisfied: /[A-Z]/.test(passwordValue),
    },
    {
      label: "One lowercase letter (a-z)",
      satisfied: /[a-z]/.test(passwordValue),
    },
    {
      label: "One number (0-9)",
      satisfied: /[0-9]/.test(passwordValue),
    },
  ];

  // Missing or empty token state
  if (!token) {
    return (
      <Card className="border-border/60 shadow-lg shadow-black/5 text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Invalid reset link
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            The password reset link is invalid or missing required security parameters.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Please make sure you copied the entire URL from your email, or request
            a fresh link below.
          </p>

          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
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

  async function onSubmit(values: ResetPasswordInput) {
    try {
      setIsLoading(true);

      const response = await resetPassword({
        newPassword: values.password,
        token: values.token,
      });

      if (response?.error) {
        const errorMsg =
          response.error.message ||
          "Failed to reset password. The link may have expired or is invalid.";
        toast.error(errorMsg);
        return;
      }

      toast.success("Password reset successfully! Please sign in with your new password.");
      router.push("/login?reset=success");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while resetting your password.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Reset your password
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your new password below to regain access to your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a new password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="pl-9 pr-9"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        tabIndex={-1}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />

                  {/* Password requirements checklist */}
                  <div className="mt-2 space-y-1 rounded-lg border border-border/50 bg-muted/40 p-3 text-xs">
                    <p className="font-medium text-foreground/80 mb-1.5">
                      Password requirements:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {passwordCriteria.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-1.5 transition-colors ${
                            item.satisfied
                              ? "text-emerald-600 dark:text-emerald-400 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.satisfied ? (
                            <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="size-3.5 shrink-0 text-muted-foreground/60" />
                          )}
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="pl-9 pr-9"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        tabIndex={-1}
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden Token Field */}
            <input type="hidden" {...form.register("token")} />

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  Reset password
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

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/60 shadow-lg shadow-black/5 animate-pulse">
          <CardHeader className="space-y-2 text-center">
            <div className="h-6 w-44 bg-muted rounded mx-auto" />
            <div className="h-4 w-60 bg-muted rounded mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
