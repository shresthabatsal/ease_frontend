"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { handleGoogleAuth } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";

export default function GoogleAuthButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in failed.");
      return;
    }
    startTransition(async () => {
      const result = await handleGoogleAuth(credentialResponse.credential!);
      if (result.success) {
        toast.success("Logged in with Google!");
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className={pending ? "opacity-50 pointer-events-none" : ""}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => toast.error("Google sign-in failed.")}
        width="384"
        theme="outline"
        shape="rectangular"
        text="continue_with"
      />
    </div>
  );
}
