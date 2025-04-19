export interface Database {
  public: {
    Tables: {
      contests: {
        Row: {
          id: string;
          name: string;
          entry_fee: number;
          total_prize_pool: number;
          max_participants: number;
          contest_type: string;
          question_count: number;
          time_per_question_sec: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          entry_fee?: number;
          total_prize_pool?: number;
          max_participants?: number;
          contest_type?: string;
          question_count?: number;
          time_per_question_sec?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          entry_fee?: number;
          total_prize_pool?: number;
          max_participants?: number;
          contest_type?: string;
          question_count?: number;
          time_per_question_sec?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      contest_questions: {
        Row: {
          id: string;
          contest_id: string;
          question_id: string;
          sequence_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          contest_id: string;
          question_id: string;
          sequence_number: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          contest_id?: string;
          question_id?: string;
          sequence_number?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 