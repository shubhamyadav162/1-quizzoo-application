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
      questions: {
        Row: {
          id: string
          created_at: string
          question: string
          options: Json
          correct_answer: string
          category: string
          difficulty: string
          points: number
        }
        Insert: {
          id?: string
          created_at?: string
          question: string
          options: Json
          correct_answer: string
          category: string
          difficulty: string
          points?: number
        }
        Update: {
          id?: string
          created_at?: string
          question?: string
          options?: Json
          correct_answer?: string
          category?: string
          difficulty?: string
          points?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          display_name: string | null
          avatar_url: string | null
          points: number
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          display_name?: string | null
          avatar_url?: string | null
          points?: number
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          display_name?: string | null
          avatar_url?: string | null
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_answers: {
        Row: {
          id: string
          created_at: string
          user_id: string
          question_id: string
          selected_answer: string
          is_correct: boolean
          points_earned: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          question_id: string
          selected_answer: string
          is_correct: boolean
          points_earned?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          question_id?: string
          selected_answer?: string
          is_correct?: boolean
          points_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
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
  }
} 