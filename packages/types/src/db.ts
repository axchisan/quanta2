export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ai_cache: {
        Row: {
          created_at: string;
          hit_count: number;
          key: string;
          kind: string;
          provider: string;
          value: Json | null;
        };
        Insert: {
          created_at?: string;
          hit_count?: number;
          key: string;
          kind: string;
          provider: string;
          value?: Json | null;
        };
        Update: {
          created_at?: string;
          hit_count?: number;
          key?: string;
          kind?: string;
          provider?: string;
          value?: Json | null;
        };
        Relationships: [];
      };
      challenge_assets: {
        Row: {
          challenge_id: string;
          created_at: string;
          id: string;
          kind: string;
          prompt_hash: string | null;
          provider: string | null;
          storage_path: string;
        };
        Insert: {
          challenge_id: string;
          created_at?: string;
          id?: string;
          kind: string;
          prompt_hash?: string | null;
          provider?: string | null;
          storage_path: string;
        };
        Update: {
          challenge_id?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          prompt_hash?: string | null;
          provider?: string | null;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'challenge_assets_challenge_id_fkey';
            columns: ['challenge_id'];
            isOneToOne: false;
            referencedRelation: 'challenges';
            referencedColumns: ['id'];
          },
        ];
      };
      challenge_attempts: {
        Row: {
          challenge_id: string;
          created_at: string;
          feedback: string | null;
          guest_session_id: string | null;
          id: string;
          is_correct: boolean;
          room_id: string | null;
          score: number;
          submitted_answer: Json;
          time_taken_ms: number;
          user_id: string | null;
        };
        Insert: {
          challenge_id: string;
          created_at?: string;
          feedback?: string | null;
          guest_session_id?: string | null;
          id?: string;
          is_correct: boolean;
          room_id?: string | null;
          score: number;
          submitted_answer: Json;
          time_taken_ms: number;
          user_id?: string | null;
        };
        Update: {
          challenge_id?: string;
          created_at?: string;
          feedback?: string | null;
          guest_session_id?: string | null;
          id?: string;
          is_correct?: boolean;
          room_id?: string | null;
          score?: number;
          submitted_answer?: Json;
          time_taken_ms?: number;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'challenge_attempts_challenge_id_fkey';
            columns: ['challenge_id'];
            isOneToOne: false;
            referencedRelation: 'challenges';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'challenge_attempts_guest_session_id_fkey';
            columns: ['guest_session_id'];
            isOneToOne: false;
            referencedRelation: 'guest_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'challenge_attempts_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      challenges: {
        Row: {
          created_at: string;
          creator_id: string | null;
          difficulty: string;
          explanation_template: string | null;
          id: string;
          is_predefined: boolean;
          kind: string;
          payload: Json;
          published_at: string | null;
          slug: string | null;
          solution: Json;
          statement: string;
          status: string;
          subject: string;
          title: string;
          topic: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          creator_id?: string | null;
          difficulty: string;
          explanation_template?: string | null;
          id?: string;
          is_predefined?: boolean;
          kind: string;
          payload: Json;
          published_at?: string | null;
          slug?: string | null;
          solution: Json;
          statement: string;
          status?: string;
          subject: string;
          title: string;
          topic: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          creator_id?: string | null;
          difficulty?: string;
          explanation_template?: string | null;
          id?: string;
          is_predefined?: boolean;
          kind?: string;
          payload?: Json;
          published_at?: string | null;
          slug?: string | null;
          solution?: Json;
          statement?: string;
          status?: string;
          subject?: string;
          title?: string;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_results: {
        Row: {
          correct_count: number;
          created_at: string;
          id: string;
          mode: string;
          nickname: string;
          rank: number;
          room_code: string;
          score: number;
          topic: string;
          total_players: number;
          total_questions: number;
          user_id: string;
        };
        Insert: {
          correct_count: number;
          created_at?: string;
          id?: string;
          mode?: string;
          nickname: string;
          rank: number;
          room_code: string;
          score: number;
          topic: string;
          total_players: number;
          total_questions: number;
          user_id: string;
        };
        Update: {
          correct_count?: number;
          created_at?: string;
          id?: string;
          mode?: string;
          nickname?: string;
          rank?: number;
          room_code?: string;
          score?: number;
          topic?: string;
          total_players?: number;
          total_questions?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      guest_sessions: {
        Row: {
          created_at: string;
          id: string;
          last_seen_at: string;
          linked_user_id: string | null;
          nickname: string;
          room_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          linked_user_id?: string | null;
          nickname: string;
          room_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          linked_user_id?: string | null;
          nickname?: string;
          room_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guest_sessions_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          nickname: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          nickname: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          nickname?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_memberships: {
        Row: {
          guest_session_id: string | null;
          joined_at: string;
          left_at: string | null;
          member_key: string;
          role: string;
          room_id: string;
          user_id: string | null;
        };
        Insert: {
          guest_session_id?: string | null;
          joined_at?: string;
          left_at?: string | null;
          member_key?: string;
          role?: string;
          room_id: string;
          user_id?: string | null;
        };
        Update: {
          guest_session_id?: string | null;
          joined_at?: string;
          left_at?: string | null;
          member_key?: string;
          role?: string;
          room_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'room_memberships_guest_session_id_fkey';
            columns: ['guest_session_id'];
            isOneToOne: false;
            referencedRelation: 'guest_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'room_memberships_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      rooms: {
        Row: {
          code: string;
          created_at: string;
          finished_at: string | null;
          host_id: string | null;
          id: string;
          max_players: number;
          mode: string;
          settings: Json;
          started_at: string | null;
          status: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          finished_at?: string | null;
          host_id?: string | null;
          id?: string;
          max_players?: number;
          mode: string;
          settings?: Json;
          started_at?: string | null;
          status?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          finished_at?: string | null;
          host_id?: string | null;
          id?: string;
          max_players?: number;
          mode?: string;
          settings?: Json;
          started_at?: string | null;
          status?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_room_member: { Args: { target_room_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
