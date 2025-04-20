"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePlaidLink } from "react-plaid-link";
import { DollarSign, Loader2 } from "lucide-react";
import { Button } from "../button";

export default function PlaidConnect({accountId}: {accountId: string}) {
  const supabase = createClient();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserAndToken = async () => {
    setIsLoading(true);
    try {
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
      console.log("Link token: ", data);
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error fetching user and token:", error);
    } finally {
      open();
      setIsLoading(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token) => {
      console.log("Success! Public Token from frontend: ", public_token);

      try {
        const response = await fetch("/api/exchange-public-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token, user_id: userId, accountId: accountId }),
        });

        const { data } = await response.json();

        console.log("Account transactions: ", data);
      } catch (error) {
        console.error("Error exchanging public token: ", error);
      }
    },
  });

  const handleClick = async () => {
    if (!linkToken) {
      await fetchUserAndToken();
    }
    if (ready && linkToken) {
      open();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="gradient-bg text-white shadow-sm"
    >
      <DollarSign className="mr-2 h-4 w-4" />
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Bank Account"
      )}
    </Button>
  );
}
