"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chrome, Facebook } from "lucide-react";

export function LoginButtons() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/checkout";

    return (
        <div className="grid grid-cols-1 gap-4 w-full">
            <Button
                onClick={() => signIn("google", { callbackUrl })}
                className="h-14 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-100 font-bold rounded-2xl gap-3 shadow-sm transition-all text-lg"
            >
                <Chrome className="w-6 h-6 text-red-500" />
                Continuar com Google
            </Button>

            <Button
                onClick={() => signIn("facebook", { callbackUrl })}
                className="h-14 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-2xl gap-3 shadow-sm transition-all text-lg"
            >
                <Facebook className="w-6 h-6 fill-current" />
                Continuar com Facebook
            </Button>
        </div>
    );
}
