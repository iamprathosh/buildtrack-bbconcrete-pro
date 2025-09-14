import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

export function useUserProfile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    const syncUserProfile = async () => {
      try {
        setLoading(true);
        
        // Check if user profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (!existingProfile) {
          // Create new user profile
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress || '',
              full_name: user.fullName || user.firstName || 'User',
              role: 'worker' as UserRole
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newProfile);
        } else {
          // Update existing profile if needed
          const updatedData: any = {};
          const currentEmail = user.emailAddresses[0]?.emailAddress || '';
          const currentName = user.fullName || user.firstName || 'User';

          if (existingProfile.email !== currentEmail) {
            updatedData.email = currentEmail;
          }
          if (existingProfile.full_name !== currentName) {
            updatedData.full_name = currentName;
          }

          if (Object.keys(updatedData).length > 0) {
            const { data: updatedProfile, error: updateError } = await supabase
              .from('user_profiles')
              .update(updatedData)
              .eq('id', user.id)
              .select()
              .single();

            if (updateError) throw updateError;
            setProfile(updatedProfile);
          } else {
            setProfile(existingProfile);
          }
        }
      } catch (err) {
        console.error('Error syncing user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to sync user profile');
      } finally {
        setLoading(false);
      }
    };

    syncUserProfile();
  }, [user, isLoaded]);

  const hasRole = (role: UserRole) => {
    return profile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return profile?.role ? roles.includes(profile.role) : false;
  };

  const isWorker = () => hasRole('worker');
  const isProjectManager = () => hasRole('project_manager');
  const isSuperAdmin = () => hasRole('super_admin');
  const isAdminOrManager = () => hasAnyRole(['super_admin', 'project_manager']);

  return {
    profile,
    loading,
    error,
    hasRole,
    hasAnyRole,
    isWorker,
    isProjectManager,
    isSuperAdmin,
    isAdminOrManager,
    userId: user?.id
  };
}