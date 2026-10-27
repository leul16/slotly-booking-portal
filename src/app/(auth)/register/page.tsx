"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    mode: "onChange",
  });

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

  async function onSubmit(values: RegisterInput) {
    try {
      setIsLoading(true);

      const response = await signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        callbackURL: "/verify-email",
      });

      if (response?.error) {
        const errorMsg =
          response.error.message ||
          "Registration failed. Please check your details and try again.";
        toast.error(errorMsg);
        return;
      }

      toast.success("Account created successfully!");
      router.push(`/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during registration.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your details below to create your Slotly client account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Jane Doe"
                        autoComplete="name"
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
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

                  {/* Password strength requirements checklist */}
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

            {/* Password Confirmation Field */}
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat your password"
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t border-border/40 p-4 text-center text-xs text-muted-foreground">
        <div>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
