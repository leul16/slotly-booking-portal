"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Check URL parameters for status banners and redirect destination
  const isRegistered = searchParams.get("registered") === "true";
  const isResetSuccess = searchParams.get("reset") === "success";
  const isVerified = searchParams.get("verified") === "true";
  const urlError = searchParams.get("error");
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard";

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      setIsLoading(true);

      const response = await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: callbackUrl,
      });

      if (response?.error) {
        const errorMsg =
          response.error.message ||
          "Invalid email or password. Please try again.";
        toast.error(errorMsg);
        return;
      }

      toast.success("Welcome back! Redirecting...");
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign in.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your credentials to access your Slotly account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Success Notifications from URL parameters */}
        {isRegistered && (
          <div
            className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">Account created successfully!</p>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                Please check your inbox to verify your email, or sign in below.
              </p>
            </div>
          </div>
        )}

        {isResetSuccess && (
          <div
            className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">Password reset successfully!</p>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                You can now log in using your new password.
              </p>
            </div>
          </div>
        )}

        {isVerified && (
          <div
            className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">Email verified!</p>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                Your email has been verified. Please log in to continue.
              </p>
            </div>
          </div>
        )}

        {urlError && (
          <div
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Authentication notice</p>
              <p className="mt-0.5">{urlError}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
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

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
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
                </FormItem>
              )}
            />

            {/* Remember Me Checkbox */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </FormControl>
                  <label
                    htmlFor="rememberMe"
                    className="text-xs text-muted-foreground cursor-pointer select-none"
                  >
                    Remember me on this device
                  </label>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t border-border/40 p-4 text-center text-xs text-muted-foreground">
        <div>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/60 shadow-lg shadow-black/5 animate-pulse">
          <CardHeader className="space-y-2 text-center">
            <div className="h-6 w-36 bg-muted rounded mx-auto" />
            <div className="h-4 w-56 bg-muted rounded mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </CardContent>
        </Card>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
