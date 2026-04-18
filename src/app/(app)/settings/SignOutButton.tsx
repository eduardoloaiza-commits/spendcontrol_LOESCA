"use client";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut size={14} />
      Cerrar sesión
    </Button>
  );
}
