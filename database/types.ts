export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          icon_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          icon_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          icon_url?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      contest_questions: {
        Row: {
          id: string
          contest_id: string
          question_id: string
          question_order: number
          created_at: string | null
        }
        Insert: {
          id?: string
          contest_id: string
          question_id: string
          question_order: number
          created_at?: string | null
        }
        Update: {
          id?: string
          contest_id?: string
          question_id?: string
          question_order?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_questions_contest_id_fkey"
            columns: ["contest_id"]
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_questions_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "question_reference"
            referencedColumns: ["id"]
          }
        ]
      }
      contest_settings: {
        Row: {
          contest_id: string
          category_id: number | null
          question_count: number
          time_per_question: number
          difficulty_level: string | null
          first_place_percentage: number
          second_place_percentage: number
          third_place_percentage: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          contest_id: string
          category_id?: number | null
          question_count?: number
          time_per_question?: number
          difficulty_level?: string | null
          first_place_percentage?: number
          second_place_percentage?: number
          third_place_percentage?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          contest_id?: string
          category_id?: number | null
          question_count?: number
          time_per_question?: number
          difficulty_level?: string | null
          first_place_percentage?: number
          second_place_percentage?: number
          third_place_percentage?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_settings_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_settings_contest_id_fkey"
            columns: ["contest_id"]
            referencedRelation: "contests"
            referencedColumns: ["id"]
          }
        ]
      }
      contests: {
        Row: {
          id: string
          name: string
          description: string | null
          entry_fee: number
          max_participants: number
          platform_fee_percentage: number
          total_prize_pool: number
          status: string
          start_time: string | null
          end_time: string | null
          is_private: boolean | null
          private_code: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          entry_fee: number
          max_participants: number
          platform_fee_percentage?: number
          total_prize_pool: number
          status?: string
          start_time?: string | null
          end_time?: string | null
          is_private?: boolean | null
          private_code?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          entry_fee?: number
          max_participants?: number
          platform_fee_percentage?: number
          total_prize_pool?: number
          status?: string
          start_time?: string | null
          end_time?: string | null
          is_private?: boolean | null
          private_code?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contests_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      leaderboards: {
        Row: {
          id: string
          contest_id: string
          user_id: string
          total_correct_answers: number | null
          total_response_time_ms: number | null
          final_score: number | null
          rank: number | null
          prize_amount: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          contest_id: string
          user_id: string
          total_correct_answers?: number | null
          total_response_time_ms?: number | null
          final_score?: number | null
          rank?: number | null
          prize_amount?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          contest_id?: string
          user_id?: string
          total_correct_answers?: number | null
          total_response_time_ms?: number | null
          final_score?: number | null
          rank?: number | null
          prize_amount?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_contest_id_fkey"
            columns: ["contest_id"]
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      participations: {
        Row: {
          id: string
          user_id: string
          contest_id: string
          joined_at: string | null
          status: string | null
        }
        Insert: {
          id?: string
          user_id: string
          contest_id: string
          joined_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          contest_id?: string
          joined_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participations_contest_id_fkey"
            columns: ["contest_id"]
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      question_reference: {
        Row: {
          id: string
          category_id: number | null
          difficulty_level: string
          language: string
          correct_answer_index: number
          created_at: string | null
        }
        Insert: {
          id?: string
          category_id?: number | null
          difficulty_level: string
          language?: string
          correct_answer_index: number
          created_at?: string | null
        }
        Update: {
          id?: string
          category_id?: number | null
          difficulty_level?: string
          language?: string
          correct_answer_index?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_reference_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          status: string
          reference_id: string | null
          payment_method: string | null
          upi_reference_id: string | null
          upi_transaction_id: string | null
          transaction_status: string | null
          qr_code_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          status?: string
          reference_id?: string | null
          payment_method?: string | null
          upi_reference_id?: string | null
          upi_transaction_id?: string | null
          transaction_status?: string | null
          qr_code_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          status?: string
          reference_id?: string | null
          payment_method?: string | null
          upi_reference_id?: string | null
          upi_transaction_id?: string | null
          transaction_status?: string | null
          qr_code_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          id: string
          language: string | null
          theme: string | null
          notifications_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          id: string
          language?: string | null
          theme?: string | null
          notifications_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          language?: string | null
          theme?: string | null
          notifications_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_question_history: {
        Row: {
          id: string
          user_id: string
          question_id: string
          seen_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          seen_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_question_history_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "question_reference"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_responses: {
        Row: {
          id: string
          participation_id: string
          question_id: string
          selected_answer_index: number | null
          is_correct: boolean | null
          response_time_ms: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          participation_id: string
          question_id: string
          selected_answer_index?: number | null
          is_correct?: boolean | null
          response_time_ms?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          participation_id?: string
          question_id?: string
          selected_answer_index?: number | null
          is_correct?: boolean | null
          response_time_ms?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_responses_participation_id_fkey"
            columns: ["participation_id"]
            referencedRelation: "participations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_responses_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "question_reference"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          full_name: string | null
          created_at: string | null
          is_active: boolean | null
          profile_picture_url: string | null
        }
        Insert: {
          id: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          created_at?: string | null
          is_active?: boolean | null
          profile_picture_url?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          created_at?: string | null
          is_active?: boolean | null
          profile_picture_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wallets: {
        Row: {
          id: string
          balance: number | null
          total_earnings: number | null
          total_spent: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          balance?: number | null
          total_earnings?: number | null
          total_spent?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          balance?: number | null
          total_earnings?: number | null
          total_spent?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      withdrawal_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: string
          payment_method: string
          account_details: Json
          admin_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          status?: string
          payment_method: string
          account_details: Json
          admin_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          status?: string
          payment_method?: string
          account_details?: Json
          admin_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      app_settings: {
        Row: {
          id: string
          upi_payments_enabled: boolean | null
          gateway_payments_enabled: boolean | null
          business_upi_id: string | null
          minimum_deposit_amount: number | null
          maximum_deposit_amount: number | null
          minimum_withdrawal_amount: number | null
          maximum_withdrawal_amount: number | null
          platform_fee_percentage: number | null
          created_at: string | null
          updated_at: string | null
          phonepe_enabled: boolean | null
          phonepe_merchant_id: string | null
          phonepe_salt_key: string | null
          phonepe_salt_index: number | null
          phonepe_callback_url: string | null
          phonepe_test_mode: boolean | null
        }
        Insert: {
          id: string
          upi_payments_enabled?: boolean | null
          gateway_payments_enabled?: boolean | null
          business_upi_id?: string | null
          minimum_deposit_amount?: number | null
          maximum_deposit_amount?: number | null
          minimum_withdrawal_amount?: number | null
          maximum_withdrawal_amount?: number | null
          platform_fee_percentage?: number | null
          created_at?: string | null
          updated_at?: string | null
          phonepe_enabled?: boolean | null
          phonepe_merchant_id?: string | null
          phonepe_salt_key?: string | null
          phonepe_salt_index?: number | null
          phonepe_callback_url?: string | null
          phonepe_test_mode?: boolean | null
        }
        Update: {
          id?: string
          upi_payments_enabled?: boolean | null
          gateway_payments_enabled?: boolean | null
          business_upi_id?: string | null
          minimum_deposit_amount?: number | null
          maximum_deposit_amount?: number | null
          minimum_withdrawal_amount?: number | null
          maximum_withdrawal_amount?: number | null
          platform_fee_percentage?: number | null
          created_at?: string | null
          updated_at?: string | null
          phonepe_enabled?: boolean | null
          phonepe_merchant_id?: string | null
          phonepe_salt_key?: string | null
          phonepe_salt_index?: number | null
          phonepe_callback_url?: string | null
          phonepe_test_mode?: boolean | null
        }
        Relationships: []
      }
      contest_templates: {
        Row: {
          id: string
          template_name: string
          template_description: string | null
          template_type: string
          template_version: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_name: string
          template_description?: string | null
          template_type: string
          template_version?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_name?: string
          template_description?: string | null
          template_type?: string
          template_version?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      template_parameters: {
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 