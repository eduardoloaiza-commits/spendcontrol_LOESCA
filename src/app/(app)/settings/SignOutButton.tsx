"use client";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";
export function SignOutButton() {
  return <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</Button>;
}
