import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  fullName?: string | null;
  firstName?: string | null;
}

export async function syncUserProfile(
  clerkUser: ClerkUser,
  supabaseClient: SupabaseClient<Database>
): Promise<UserProfile> {
  console.log('🔄 [syncUserProfile] Starting sync for Clerk user:', clerkUser.id);
  console.log('👤 [syncUserProfile] User data:', {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    fullName: clerkUser.fullName,
    firstName: clerkUser.firstName
  });
  
  try {
    // Check if user profile exists
    console.log('🔍 [syncUserProfile] Checking for existing profile...');
    const { data: existingProfile, error: fetchError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', clerkUser.id)
      .single();

    console.log('📋 [syncUserProfile] Existing profile:', existingProfile);
    console.log('🔍 [syncUserProfile] Fetch error:', fetchError);

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ [syncUserProfile] Error fetching profile:', fetchError);
      
      // Try alternative lookup method for profile that might be 406 errors
      try {
        console.log('🔄 [syncUserProfile] Trying alternative lookup method...');
        const { data: profiles, error: altFetchError } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('id', clerkUser.id);
          
        if (!altFetchError && profiles && profiles.length > 0) {
          console.log('✅ [syncUserProfile] Found profile using alternative method');
          return profiles[0];
        }
      } catch (altErr) {
        console.error('❌ [syncUserProfile] Alternative lookup also failed:', altErr);
      }
      
      throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
    }

    if (!existingProfile) {
      console.log('➕ [syncUserProfile] Creating new user profile...');
      
      const profileData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        full_name: clerkUser.fullName || clerkUser.firstName || 'User',
        role: 'worker' as UserRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 [syncUserProfile] Profile data to insert:', profileData);

      // Create new user profile
      const { data: newProfile, error: insertError } = await supabaseClient
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      console.log('✅ [syncUserProfile] New profile created:', newProfile);
      console.log('❌ [syncUserProfile] Insert error:', insertError);

      if (insertError) {
        console.error('❌ [syncUserProfile] Failed to create profile:', insertError);
        
        // More detailed error logging for database issues
        if (insertError.code) {
          console.error('[syncUserProfile] Error code:', insertError.code);
          console.error('[syncUserProfile] Error details:', insertError.details);
          console.error('[syncUserProfile] Error hint:', insertError.hint);
        }
        
        // Handle 409 Conflict - profile already exists
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
          console.log('🔄 [syncUserProfile] Profile already exists, fetching existing profile...');
          try {
            const { data: existingProfile, error: refetchError } = await supabaseClient
              .from('user_profiles')
              .select('*')
              .eq('id', clerkUser.id);
              
            if (!refetchError && existingProfile && existingProfile.length > 0) {
              console.log('✅ [syncUserProfile] Retrieved existing profile after conflict');
              return existingProfile[0];
            }
          } catch (refetchErr) {
            console.error('❌ [syncUserProfile] Failed to fetch existing profile after conflict:', refetchErr);
          }
        }
        
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }
      
      if (!newProfile) {
        throw new Error('Profile creation succeeded but no profile data returned');
      }

      console.log('🎉 [syncUserProfile] Profile sync completed - new user created');
      return newProfile;
    } else {
      console.log('🔄 [syncUserProfile] User profile exists, checking for updates...');
      
      // Update existing profile if needed
      const updatedData: Partial<UserProfile> = {};
      const currentEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
      const currentName = clerkUser.fullName || clerkUser.firstName || 'User';

      if (existingProfile.email !== currentEmail) {
        updatedData.email = currentEmail;
      }
      if (existingProfile.full_name !== currentName) {
        updatedData.full_name = currentName;
      }

      if (Object.keys(updatedData).length > 0) {
        updatedData.updated_at = new Date().toISOString();
        
        console.log('📝 [syncUserProfile] Updating profile with:', updatedData);

        const { data: updatedProfile, error: updateError } = await supabaseClient
          .from('user_profiles')
          .update(updatedData)
          .eq('id', clerkUser.id)
          .select()
          .single();

        console.log('✅ [syncUserProfile] Updated profile:', updatedProfile);
        console.log('❌ [syncUserProfile] Update error:', updateError);

        if (updateError) {
          console.error('❌ [syncUserProfile] Failed to update profile:', updateError);
          
          // More detailed error logging for database issues
          if (updateError.code) {
            console.error('[syncUserProfile] Error code:', updateError.code);
            console.error('[syncUserProfile] Error details:', updateError.details);
            console.error('[syncUserProfile] Error hint:', updateError.hint);
          }
          
          throw new Error(`Failed to update user profile: ${updateError.message}`);
        }
        
        if (!updatedProfile) {
          throw new Error('Profile update succeeded but no profile data returned');
        }

        console.log('🎉 [syncUserProfile] Profile sync completed - user updated');
        return updatedProfile;
      } else {
        console.log('✅ [syncUserProfile] No updates needed for profile');
        console.log('🎉 [syncUserProfile] Profile sync completed - no changes needed');
        return existingProfile;
      }
    }
  } catch (err) {
    console.error('💥 [syncUserProfile] Error syncing user profile:', err);
    
    // More detailed error logging for any unexpected errors
    if (err && typeof err === 'object' && 'code' in err) {
      console.error('[syncUserProfile] Error code:', (err as any).code);
      console.error('[syncUserProfile] Error details:', (err as any).details);
      console.error('[syncUserProfile] Error message:', (err as any).message);
      console.error('[syncUserProfile] Error hint:', (err as any).hint);
    }
    
    throw err;
  }
}

/**
 * Utility function to check if a user profile exists in Supabase
 */
export async function checkUserProfileExists(
  userId: string,
  supabaseClient: SupabaseClient<Database>
): Promise<UserProfile | null> {
  console.log('🔍 [checkUserProfileExists] Checking profile for user:', userId);
  
  try {
    const { data: profile, error } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [checkUserProfileExists] Error fetching profile:', error);
      
      // Try alternative lookup method for profiles with 406 errors
      try {
        console.log('🔄 [checkUserProfileExists] Trying alternative lookup method...');
        const { data: profiles, error: altError } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('id', userId);
          
        if (!altError && profiles && profiles.length > 0) {
          console.log('✅ [checkUserProfileExists] Found profile using alternative method');
          return profiles[0];
        }
      } catch (altErr) {
        console.error('❌ [checkUserProfileExists] Alternative lookup also failed:', altErr);
      }
      
      throw new Error(`Failed to check user profile: ${error.message}`);
    }

    console.log('📋 [checkUserProfileExists] Profile found:', !!profile);
    return profile;
  } catch (err) {
    console.error('💥 [checkUserProfileExists] Error:', err);
    throw err;
  }
}

/**
 * Batch sync multiple users (useful for initial migration or bulk operations)
 */
export async function batchSyncUsers(
  users: ClerkUser[],
  supabaseClient: SupabaseClient<Database>
): Promise<{ success: UserProfile[], errors: Array<{ user: ClerkUser, error: any }> }> {
  console.log(`🔄 [batchSyncUsers] Starting batch sync for ${users.length} users`);
  
  const success: UserProfile[] = [];
  const errors: Array<{ user: ClerkUser, error: any }> = [];
  
  for (const user of users) {
    try {
      const profile = await syncUserProfile(user, supabaseClient);
      success.push(profile);
    } catch (error) {
      console.error(`❌ [batchSyncUsers] Failed to sync user ${user.id}:`, error);
      errors.push({ user, error });
    }
  }
  
  console.log(`✅ [batchSyncUsers] Batch sync completed: ${success.length} successful, ${errors.length} errors`);
  return { success, errors };
}

/**
 * Get all user profiles from Supabase
 */
export async function getAllUserProfiles(
  supabaseClient: SupabaseClient<Database>
): Promise<UserProfile[]> {
  console.log('📋 [getAllUserProfiles] Fetching all user profiles...');
  
  try {
    const { data: profiles, error } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [getAllUserProfiles] Error fetching profiles:', error);
      throw new Error(`Failed to fetch user profiles: ${error.message}`);
    }

    console.log(`✅ [getAllUserProfiles] Found ${profiles?.length || 0} profiles`);
    return profiles || [];
  } catch (err) {
    console.error('💥 [getAllUserProfiles] Error:', err);
    throw err;
  }
}

/**
 * Update a user's role in Supabase
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  supabaseClient: SupabaseClient<Database>
): Promise<UserProfile> {
  console.log(`🔄 [updateUserRole] Updating role for user ${userId} to ${newRole}`);
  
  try {
    const { data: updatedProfile, error } = await supabaseClient
      .from('user_profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ [updateUserRole] Error updating role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    if (!updatedProfile) {
      throw new Error('Role update succeeded but no profile data returned');
    }

    console.log('✅ [updateUserRole] Role updated successfully:', updatedProfile);
    return updatedProfile;
  } catch (err) {
    console.error('💥 [updateUserRole] Error:', err);
    throw err;
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(
  userId: string,
  isActive: boolean,
  supabaseClient: SupabaseClient<Database>
): Promise<UserProfile> {
  console.log(`🔄 [toggleUserStatus] Setting user ${userId} active status to ${isActive}`);
  
  try {
    const { data: updatedProfile, error } = await supabaseClient
      .from('user_profiles')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ [toggleUserStatus] Error updating status:', error);
      throw new Error(`Failed to update user status: ${error.message}`);
    }

    if (!updatedProfile) {
      throw new Error('Status update succeeded but no profile data returned');
    }

    console.log('✅ [toggleUserStatus] Status updated successfully:', updatedProfile);
    return updatedProfile;
  } catch (err) {
    console.error('💥 [toggleUserStatus] Error:', err);
    throw err;
  }
}

// Utility function to manually sync all Clerk users to Supabase
export async function syncAllUsers() {
  console.log('🚨 This function requires server-side Clerk API access');
  console.log('🔧 You would need to implement this using Clerk webhooks or admin API');
  console.log('📝 Recommended approach:');
  console.log('   1. Set up a Clerk webhook for user.created events');
  console.log('   2. Call syncUserProfile() from the webhook handler');
  console.log('   3. Or use Clerk Admin API to fetch all users and sync them');
}
