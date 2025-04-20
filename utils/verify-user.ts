import { createClient } from "@/utils/supabase/server";

export const verifyUser = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return false;
  }

  return data.user;
};
