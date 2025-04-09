"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePlaidLink } from "react-plaid-link";

export default function PlaidConnect() {
  const supabase = createClient();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndToken = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User not found or error:", error);
        return;
      }

      setUserId(user.id);

      const res = await fetch("/api/create-link-token");
      const data = await res.json();
      setLinkToken(data.link_token);
    };

    fetchUserAndToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token) => {
      console.log("Success! Public Token from frontend: ", public_token);

      try {
        const response = await fetch("/api/exchange-public-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token, user_id: userId }),
        });

        const { data } = await response.json();

        console.log("Account transactions: ", data);
      } catch (error) {
        console.error("Error exchanging public token: ", error);
      }
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready || !linkToken}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
    >
      Connect Bank Account
    </button>
  );
}
