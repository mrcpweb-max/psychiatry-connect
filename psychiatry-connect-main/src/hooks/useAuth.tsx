import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "candidate" | "trainer";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isAdmin: boolean;
  isTrainer: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileResponse, roleResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (profileResponse.error) {
        throw profileResponse.error;
      }

      if (roleResponse.error) {
        throw roleResponse.error;
      }

      return {
        profile: profileResponse.data ?? null,
        role: (roleResponse.data?.role as AppRole | null | undefined) ?? null,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return {
        profile: null,
        role: null,
      };
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const userData = await fetchUserData(user.id);
      setProfile(userData.profile);
      setRole(userData.role);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userData = await fetchUserData(nextSession.user.id);

      if (!isMounted) return;

      setProfile(userData.profile);
      setRole(userData.role);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (event === "PASSWORD_RECOVERY") {
          window.location.href = "/reset-password";
          return;
        }

        // Apply session immediately — no setTimeout deferral
        void applySession(nextSession ?? null);
      }
    );

    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      void applySession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    isAdmin: role === "admin",
    isTrainer: role === "trainer",
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
