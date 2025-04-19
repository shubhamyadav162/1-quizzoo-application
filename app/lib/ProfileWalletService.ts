import { supabase } from '@/config/supabase';
import { ensureUserProfile } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { WalletService, Transaction } from './WalletService';

// Extended wallet interface to include all needed fields
interface WalletExtended {
  id: string;
  user_id?: string;
  balance: number;
  actual_balance: number;
  tax_credit_balance: number;
  total_earnings: number;
  total_spent: number;
  updated_at: string;
}

// Integrated profile and wallet interface
export interface ProfileWithWallet {
  // Profile data
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  total_games_played: number;
  highest_score: number;
  is_admin: boolean;
  push_notification_token?: string;
  
  // Wallet data
  wallet: {
    id: string;
    balance: number;
    actual_balance: number;
    tax_credit_balance: number;
    total_earnings: number;
    total_spent: number;
    updated_at: string;
  };
  
  // Common metadata
  created_at: string;
  updated_at: string;
}

export class ProfileWalletService {
  private session: Session | null;
  private walletService: WalletService | null;

  constructor(session: Session | null) {
    this.session = session;
    this.walletService = session ? new WalletService(session) : null;
  }

  // Get integrated profile and wallet data
  async getProfileWithWallet(): Promise<ProfileWithWallet | null> {
    if (!this.session?.user) return null;

    try {
      // First ensure the user has a profile and wallet
      await ensureUserProfile(this.session.user.id, this.session.user);
      
      // Use the new database function that returns combined data
      const { data, error } = await supabase.rpc('get_profile_with_wallet');
      
      if (error) {
        console.error('Error fetching profile with wallet:', error);
        
        // Fallback to separate queries if the RPC fails
        return this.getProfileAndWalletSeparately();
      }
      
      if (data) {
        return this.formatProfileWithWallet(data);
      }
      
      // If no data but no error, try the fallback method
      return this.getProfileAndWalletSeparately();
    } catch (error) {
      console.error('Exception in getProfileWithWallet:', error);
      return this.getProfileAndWalletSeparately();
    }
  }

  // Fallback method to get profile and wallet separately and combine them
  private async getProfileAndWalletSeparately(): Promise<ProfileWithWallet | null> {
    if (!this.session?.user || !this.walletService) return null;

    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Get wallet data
      const wallet = await this.walletService.getWallet();
      
      if (!wallet) {
        console.error('Could not retrieve wallet data');
        return null;
      }

      // Create a default profile if not found
      const profile = profileData || {
        id: this.session.user.id,
        username: this.session.user.email?.split('@')[0] || 'User',
        total_games_played: 0,
        highest_score: 0,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Combine the data
      return {
        // Profile fields
        id: profile.id,
        username: profile.username || 'User',
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        total_games_played: profile.total_games_played || 0,
        highest_score: profile.highest_score || 0,
        is_admin: profile.is_admin || false,
        push_notification_token: profile.push_notification_token,
        
        // Wallet fields
        wallet: {
          id: wallet.id,
          balance: wallet.balance || 0,
          actual_balance: wallet.actual_balance || 0,
          tax_credit_balance: wallet.tax_credit_balance || 0,
          total_earnings: (wallet as any).total_earnings || 0,
          total_spent: (wallet as any).total_spent || 0,
          updated_at: wallet.updated_at || new Date().toISOString()
        },
        
        // Common metadata
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getProfileAndWalletSeparately:', error);
      return null;
    }
  }

  // Format the combined data from the RPC function
  private formatProfileWithWallet(data: any): ProfileWithWallet {
    // Extract profile and wallet data from the JSON response
    const { profile, wallet } = data;
    
    return {
      // Profile fields
      id: profile?.id || this.session?.user?.id || '',
      username: profile?.username || 'User',
      display_name: profile?.display_name,
      bio: profile?.bio,
      avatar_url: profile?.avatar_url,
      total_games_played: profile?.total_games_played || 0,
      highest_score: profile?.highest_score || 0,
      is_admin: profile?.is_admin || false,
      push_notification_token: profile?.push_notification_token,
      
      // Wallet fields
      wallet: {
        id: wallet?.id || profile?.id || '',
        balance: wallet?.balance || 0,
        actual_balance: (wallet?.balance * 0.72) || 0, // Calculate if not provided
        tax_credit_balance: (wallet?.balance * 0.28) || 0, // Calculate if not provided
        total_earnings: wallet?.total_earnings || 0,
        total_spent: wallet?.total_spent || 0,
        updated_at: wallet?.updated_at || new Date().toISOString()
      },
      
      // Common metadata
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: profile?.updated_at || new Date().toISOString()
    };
  }

  // Update profile data
  async updateProfile(profileData: Partial<ProfileWithWallet>): Promise<boolean> {
    if (!this.session?.user) return false;

    try {
      // Separate profile fields from wallet fields
      const { wallet, ...profileFields } = profileData;
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileFields)
        .eq('id', this.session.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception in updateProfile:', error);
      return false;
    }
  }

  // Get wallet transactions, delegating to WalletService
  async getTransactions(limit = 10, offset = 0): Promise<Transaction[]> {
    if (!this.walletService) return [];
    return this.walletService.getTransactions(limit, offset);
  }

  // Delegate wallet operations to WalletService
  async addMoney(amount: number, paymentMethod: string): Promise<Transaction | null> {
    if (!this.walletService) return null;
    return this.walletService.addMoney(amount, paymentMethod);
  }

  async withdrawMoney(amount: number, paymentMethod: string): Promise<Transaction | null> {
    if (!this.walletService) return null;
    return this.walletService.withdrawMoney(amount, paymentMethod);
  }

  async useWalletForContest(amount: number, contestId: string): Promise<{ status: string; message: string } | null> {
    if (!this.walletService) return { status: 'ERROR', message: 'Wallet service not available.' };
    return this.walletService.useWalletForContest(amount, contestId);
  }
} 