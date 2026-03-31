import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
    to?: string;
    label?: string;
    className?: string;
}

/**
 * Reusable back button component with premium styling
 */
export default function BackButton({ to, label = "Back", className = "" }: BackButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleClick}
            className={`group flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all ${className}`}
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{label}</span>
        </Button>
    );
}
