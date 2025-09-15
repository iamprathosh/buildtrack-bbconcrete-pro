import { useEffect, useState, useCallback, useMemo } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useAuthContext } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

export function useUserProfile() {
  // Use centralized auth context instead of direct Clerk hooks
  const { user, userId, isAuthenticated, isLoaded } = useAuthContext();
  const { supabase, isLoading: supabaseLoading } = useSupabaseClient();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache for profile data to prevent redundant syncs
  const [lastSyncUserId, setLastSyncUserId] = useState<string | null>(null);
  const [profileCache, setProfileCache] = useState<{[userId: string]: UserProfile}>({});

  const syncUserProfile = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !userId) {
        console.log('❌ No user found');
        setProfile(null);
        setLoading(false);
        return;
      }

      // Check cache first (avoid redundant API calls)
      if (!forceRefresh) {
        if (lastSyncUserId === userId && profileCache[userId]) {
          console.log('📋 Using cached profile for user:', userId);
          setProfile(profileCache[userId]);
          setLoading(false);
          return;
        }
      }
      
      console.log('🔄 Syncing user profile for user:', userId);
      console.log('👤 User data:', {
        id: userId,
        email: user?.emailAddresses?.[0]?.emailAddress,
        fullName: user?.fullName,
        firstName: user?.firstName
      });
      
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📋 Existing profile:', existingProfile);
      console.log('🔍 Fetch error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (!existingProfile) {
        console.log('➕ Creating new user profile...');
        
        // Get role from localStorage (set during role validation) or default to worker
        const pendingRole = localStorage.getItem('pendingUserRole') as UserRole;
        const assignedRole = pendingRole || 'worker';
        
        console.log('🔍 Pending role from localStorage:', pendingRole);
        console.log('🎯 Assigned role:', assignedRole);
        
        const profileData = {
          id: userId,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          full_name: user.fullName || user.firstName || 'User',
          role: assignedRole as UserRole,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('📝 Profile data to insert:', profileData);

        // Create new user profile
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single();

        console.log('✅ New profile created:', newProfile);
        console.log('❌ Insert error:', insertError);

        if (insertError) {
          console.error('❌ Failed to create profile:', insertError);
          throw insertError;
        }
        
        setProfile(newProfile);
        
        // Cache the new profile
        setProfileCache(prev => ({ ...prev, [userId]: newProfile }));
        setLastSyncUserId(userId);
        
        // Clear the pending role from localStorage after successful creation
        if (pendingRole) {
          localStorage.removeItem('pendingUserRole');
          console.log('✅ Cleared pendingUserRole from localStorage');
        }
        
        console.log('🎉 Profile sync completed - new user created');
      } else {
        console.log('🔄 User profile exists, checking for updates...');
        
        // Update existing profile if needed
        const updatedData: any = {};
        const currentEmail = user.emailAddresses?.[0]?.emailAddress || '';
        const currentName = user.fullName || user.firstName || 'User';

        if (existingProfile.email !== currentEmail) {
          updatedData.email = currentEmail;
        }
        if (existingProfile.full_name !== currentName) {
          updatedData.full_name = currentName;
        }

        if (Object.keys(updatedData).length > 0) {
          updatedData.updated_at = new Date().toISOString();
          
          console.log('📝 Updating profile with:', updatedData);

          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update(updatedData)
            .eq('id', userId)
            .select()
            .single();

          console.log('✅ Updated profile:', updatedProfile);
          console.log('❌ Update error:', updateError);

          if (updateError) {
            console.error('❌ Failed to update profile:', updateError);
            throw updateError;
          }
          
          setProfile(updatedProfile);
          
          // Cache the updated profile
          setProfileCache(prev => ({ ...prev, [userId]: updatedProfile }));
          setLastSyncUserId(userId);
          
          console.log('🎉 Profile sync completed - user updated');
        } else {
          console.log('✅ No updates needed for profile');
          setProfile(existingProfile);
          
          // Cache the existing profile
          setProfileCache(prev => ({ ...prev, [userId]: existingProfile }));
          setLastSyncUserId(userId);
          
          console.log('🎉 Profile sync completed - no changes needed');
        }
      }
    } catch (err) {
      console.error('💥 Error syncing user profile:', err);
      
      // More detailed error logging
      if (err && typeof err === 'object' && 'code' in err) {
        console.error('Error code:', (err as any).code);
        console.error('Error details:', (err as any).details);
        console.error('Error message:', (err as any).message);
        console.error('Error hint:', (err as any).hint);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to sync user profile');
    } finally {
      setLoading(false);
    }
  }, [user, userId, supabase, lastSyncUserId, profileCache]);

  useEffect(() => {
    console.log('🔄 useUserProfile effect triggered:', {
      isLoaded,
      hasUser: !!user,
      userId,
      supabaseLoading,
      isAuthenticated,
      lastSyncUserId
    });
    
    // Wait for all auth dependencies to be ready
    if (!isLoaded || !userId || supabaseLoading) {
      console.log('⏳ Waiting for auth to be ready...');
      setLoading(true);
      return;
    }

    // Only sync if user has changed or we haven't synced this user yet
    if (lastSyncUserId !== userId) {
      console.log('🔄 User changed or first sync, syncing profile...');
      syncUserProfile();
    } else {
      console.log('📋 Profile already synced for current user');
      setLoading(false);
    }
  }, [userId, isLoaded, supabaseLoading, lastSyncUserId, syncUserProfile]);

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

  const refetch = useCallback(() => {
    if (userId && isLoaded && !supabaseLoading) {
      console.log('🔄 Manual profile refetch requested');
      syncUserProfile(true); // Force refresh
    }
  }, [userId, isLoaded, supabaseLoading, syncUserProfile]);

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
    userId: userId,
    refetch
  };
}