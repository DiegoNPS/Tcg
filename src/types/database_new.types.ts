export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          user_role: "jugador" | "tienda" | "admin"
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          user_role?: "jugador" | "tienda" | "admin"
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          user_role?: "jugador" | "tienda" | "admin"
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tiendas: {
        Row: {
          id: string
          owner_id: string
          nombre: string
          ciudad: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          nombre: string
          ciudad: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          nombre?: string
          ciudad?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiendas_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      torneos: {
        Row: {
          id: string
          tienda_id: string
          titulo: string
          descripcion: string
          tcg_juego: "pokemon" | "yugioh" | "magic" | "one_piece" | "digimon" | "lorcana" | "otro"
          categoria: "local" | "regional" | "premier" | "casual"
          ciudad: string
          direccion: string
          fecha_inicio: string
          cupo_maximo: number
          costo_entrada: number
          publicado: boolean
          latitud: number | null
          longitud: number | null
          imagen_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tienda_id: string
          titulo: string
          descripcion: string
          tcg_juego: "pokemon" | "yugioh" | "magic" | "one_piece" | "digimon" | "lorcana" | "otro"
          categoria: "local" | "regional" | "premier" | "casual"
          ciudad: string
          direccion: string
          fecha_inicio: string
          cupo_maximo: number
          costo_entrada: number
          publicado?: boolean
          latitud?: number | null
          longitud?: number | null
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tienda_id?: string
          titulo?: string
          descripcion?: string
          tcg_juego?: "pokemon" | "yugioh" | "magic" | "one_piece" | "digimon" | "lorcana" | "otro"
          categoria?: "local" | "regional" | "premier" | "casual"
          ciudad?: string
          direccion?: string
          fecha_inicio?: string
          cupo_maximo?: number
          costo_entrada?: number
          publicado?: boolean
          latitud?: number | null
          longitud?: number | null
          imagen_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "torneos_tienda_id_fkey"
            columns: ["tienda_id"]
            isOneToOne: false
            referencedRelation: "tiendas"
            referencedColumns: ["id"]
          }
        ]
      }
      inscripciones: {
        Row: {
          id: string
          torneo_id: string
          jugador_id: string
          estado: "confirmada" | "cancelada"
          created_at: string
        }
        Insert: {
          id?: string
          torneo_id: string
          jugador_id: string
          estado?: "confirmada" | "cancelada"
          created_at?: string
        }
        Update: {
          id?: string
          torneo_id?: string
          jugador_id?: string
          estado?: "confirmada" | "cancelada"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "torneos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_jugador_id_fkey"
            columns: ["jugador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: "jugador" | "tienda" | "admin"
      tcg_juego: "pokemon" | "yugioh" | "magic" | "one_piece" | "digimon" | "lorcana" | "otro"
      categoria_torneo: "local" | "regional" | "premier" | "casual"
      estado_inscripcion: "confirmada" | "cancelada"
    }
    CompositeTypes: Record<string, never>
  }
}

