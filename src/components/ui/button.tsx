/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium font-sans ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 rounded-xl",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl",
                outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-xl",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl",
                ghost: "hover:bg-accent/10 hover:text-accent rounded-xl",
                link: "text-accent underline-offset-4 hover:underline",
                hero: "bg-hero-foreground/10 text-hero-foreground border border-hero-foreground/30 backdrop-blur-sm hover:bg-hero-foreground/20 hover:border-hero-foreground/50 rounded-xl",
                warm: "bg-warm text-warm-foreground hover:bg-warm/90 hover:shadow-lg rounded-xl",
                accent: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-glow rounded-xl",
                // Premium variants inspired by modern UI - Navy Blue theme
                premium: "bg-gradient-to-r from-[#161A30] to-[#2d3a54] text-white hover:from-[#1f2640] hover:to-[#3d4a64] shadow-lg shadow-[#161A30]/25 hover:shadow-xl hover:shadow-[#161A30]/30 hover:-translate-y-0.5 rounded-full",
                "premium-outline": "border-2 border-[#161A30] text-[#161A30] bg-transparent hover:bg-[#161A30] hover:text-white hover:shadow-lg hover:shadow-[#161A30]/25 hover:-translate-y-0.5 rounded-full",
                pill: "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-full",
                "pill-outline": "border-2 border-slate-900 text-slate-900 bg-transparent hover:bg-slate-900 hover:text-white rounded-full",
                "pill-soft": "bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full",
                success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 rounded-xl",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 px-4 text-xs",
                lg: "h-12 px-8 text-base",
                xl: "h-14 px-10 text-lg",
                icon: "h-10 w-10 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);


export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
