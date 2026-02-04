export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cartorio_usuarios: {
        Row: {
          ativo: boolean
          cartorio_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cartorio_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          cartorio_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cartorio_usuarios_cartorio_id_fkey"
            columns: ["cartorio_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
        ]
      }
      cartorios: {
        Row: {
          ativo: boolean
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conciliacoes: {
        Row: {
          cartorio_id: string | null
          conciliado_em: string
          created_at: string
          diferenca: number | null
          extrato_item_id: string
          id: string
          lancamento_id: string
          observacao: string | null
          user_id: string
        }
        Insert: {
          cartorio_id?: string | null
          conciliado_em?: string
          created_at?: string
          diferenca?: number | null
          extrato_item_id: string
          id?: string
          lancamento_id: string
          observacao?: string | null
          user_id: string
        }
        Update: {
          cartorio_id?: string | null
          conciliado_em?: string
          created_at?: string
          diferenca?: number | null
          extrato_item_id?: string
          id?: string
          lancamento_id?: string
          observacao?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conciliacoes_cartorio_id_fkey"
            columns: ["cartorio_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_extrato_item_id_fkey"
            columns: ["extrato_item_id"]
            isOneToOne: false
            referencedRelation: "extrato_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_bancarias: {
        Row: {
          agencia: string
          ativo: boolean
          banco: string
          cartorio_id: string | null
          conta: string
          created_at: string
          id: string
          saldo: number
          tipo: Database["public"]["Enums"]["tipo_conta"]
          updated_at: string
          user_id: string
        }
        Insert: {
          agencia: string
          ativo?: boolean
          banco: string
          cartorio_id?: string | null
          conta: string
          created_at?: string
          id?: string
          saldo?: number
          tipo?: Database["public"]["Enums"]["tipo_conta"]
          updated_at?: string
          user_id: string
        }
        Update: {
          agencia?: string
          ativo?: boolean
          banco?: string
          cartorio_id?: string | null
          conta?: string
          created_at?: string
          id?: string
          saldo?: number
          tipo?: Database["public"]["Enums"]["tipo_conta"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_bancarias_cartorio_id_fkey"
            columns: ["cartorio_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
        ]
      }
      extrato_itens: {
        Row: {
          cartorio_id: string | null
          created_at: string
          data_transacao: string
          descricao: string
          extrato_id: string
          id: string
          lancamento_vinculado_id: string | null
          saldo_parcial: number | null
          status_conciliacao: Database["public"]["Enums"]["status_conciliacao"]
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          user_id: string
          valor: number
        }
        Insert: {
          cartorio_id?: string | null
          created_at?: string
          data_transacao: string
          descricao: string
          extrato_id: string
          id?: string
          lancamento_vinculado_id?: string | null
          saldo_parcial?: number | null
          status_conciliacao?: Database["public"]["Enums"]["status_conciliacao"]
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          user_id: string
          valor: number
        }
        Update: {
          cartorio_id?: string | null
          created_at?: string
          data_transacao?: string
          descricao?: string
          extrato_id?: string
          id?: string
          lancamento_vinculado_id?: string | null
          saldo_parcial?: number | null
          status_conciliacao?: Database["public"]["Enums"]["status_conciliacao"]
          tipo?: Database["public"]["Enums"]["tipo_transacao"]
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "extrato_itens_cartorio_id_fkey"
            columns: ["cartorio_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extrato_itens_extrato_id_fkey"
            columns: ["extrato_id"]
            isOneToOne: false
            referencedRelation: "extratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extrato_itens_lancamento_vinculado_id_fkey"
            columns: ["lancamento_vinculado_id"]
            isOneToOne: false
            referencedRelation: "lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      extratos: {
        Row: {
          arquivo: string
          cartorio_id: string | null
          conta_id: string
          created_at: string
          id: string
          periodo_fim: string
          periodo_inicio: string
          status: string
          total_lancamentos: number
          user_id: string
        }
        Insert: {
          arquivo: string
          cartorio_id?: string | null
          conta_id: string
          created_at?: string
          id?: string
          periodo_fim: string
          periodo_inicio: string
          status?: string
          total_lancamentos?: number
          user_id: string
        }
        Update: {
          arquivo?: string
          cartorio_id?: string | null
          conta_id?: string
          created_at?: string
          id?: string
          periodo_fim?: string
          periodo_inicio?: string
          status?: string
          total_lancamentos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extratos_cartorio_id_fkey"
            columns: ["cartorio_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extratos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          cartorio_id: string | null
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          extrato_item_vinculado_id: string | null
          id: string
          observacoes: string | null
          responsavel: string | null
          status: Database["public"]["Enums"]["status_lancamento"]
          status_conciliacao: Database["public"]["Enums"]["status_conciliacao"]
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          cartorio_id?: string | null
          categoria?: string | null
          created_at?: string
          data: string
          descricao: string
          extrato_item_vinculado_id?: string | null
          id?: string
          observacoes?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"]
          status_conciliacao?: Database["public"]["Enums"]["status_conciliacao"]
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          cartorio_id?: string | null
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          extrato_item_vinculado_id?: string | null
          id?: string
          observacoes?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"]
          status_conciliacao?: Database["public"]["Enums"]["status_conciliacao"]
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_extrato_item_vinculado"
            columns: ["extrato_item_vinculado_id"]
            isOneToOne: false
            referencedRelation: "extrato_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_cartorio_id_fkey"
            columns: ["cartorio_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_acesso: {
        Row: {
          cartorio_id: string
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          permissoes: Json
          updated_at: string
        }
        Insert: {
          cartorio_id: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          permissoes?: Json
          updated_at?: string
        }
        Update: {
          cartorio_id?: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          permissoes?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_acesso_cartorio_id_fkey"
            columns: ["cartorio_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          cartorio_ativo_id: string | null
          created_at: string
          id: string
          nome: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          cartorio_ativo_id?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          cartorio_ativo_id?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cartorio_ativo_id_fkey"
            columns: ["cartorio_ativo_id"]
            isOneToOne: false
            referencedRelation: "cartorios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_cartorios: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      user_can_access_cartorio: {
        Args: { _cartorio_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "financeiro" | "operacional"
      status_conciliacao: "pendente" | "conciliado" | "divergente"
      status_lancamento: "pago" | "pendente" | "agendado" | "cancelado"
      tipo_conta: "corrente" | "poupanca" | "investimento"
      tipo_lancamento: "receita" | "despesa"
      tipo_transacao: "credito" | "debito"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "financeiro", "operacional"],
      status_conciliacao: ["pendente", "conciliado", "divergente"],
      status_lancamento: ["pago", "pendente", "agendado", "cancelado"],
      tipo_conta: ["corrente", "poupanca", "investimento"],
      tipo_lancamento: ["receita", "despesa"],
      tipo_transacao: ["credito", "debito"],
    },
  },
} as const
