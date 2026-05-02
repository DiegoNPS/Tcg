export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      inscripciones: {
        Row: {
          created_at: string;
          estado: Database["public"]["Enums"]["estado_inscripcion"];
          id: string;
          jugador_id: string;
          nombre_jugador: string;
          torneo_id: string;
        };
        Insert: {
          created_at?: string;
          estado?: Database["public"]["Enums"]["estado_inscripcion"];
          id?: string;
          jugador_id: string;
          nombre_jugador: string;
          torneo_id: string;
        };
        Update: {
          created_at?: string;
          estado?: Database["public"]["Enums"]["estado_inscripcion"];
          id?: string;
          jugador_id?: string;
          nombre_jugador?: string;
          torneo_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inscripciones_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inscripciones_torneo_id_fkey";
            columns: ["torneo_id"];
            isOneToOne: false;
            referencedRelation: "torneos";
            referencedColumns: ["id"];
          },
        ];
      };
      tiendas: {
        Row: {
          ciudad: string;
          created_at: string;
          id: string;
          nombre: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          ciudad: string;
          created_at?: string;
          id?: string;
          nombre: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          ciudad?: string;
          created_at?: string;
          id?: string;
          nombre?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tiendas_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      torneos: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_torneo"];
          ciudad: string;
          costo_entrada: number;
          created_at: string;
          cupo_maximo: number;
          descripcion: string;
          direccion: string;
          fecha_inicio: string;
          id: string;
          imagen_url: string | null;
          latitud: number | null;
          longitud: number | null;
          publicado: boolean;
          tcg_juego: Database["public"]["Enums"]["tcg_juego"];
          tienda_id: string;
          titulo: string;
          updated_at: string;
        };
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_torneo"];
          ciudad: string;
          costo_entrada?: number;
          created_at?: string;
          cupo_maximo: number;
          descripcion: string;
          direccion: string;
          fecha_inicio: string;
          id?: string;
          imagen_url?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          publicado?: boolean;
          tcg_juego: Database["public"]["Enums"]["tcg_juego"];
          tienda_id: string;
          titulo: string;
          updated_at?: string;
        };
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_torneo"];
          ciudad?: string;
          costo_entrada?: number;
          created_at?: string;
          cupo_maximo?: number;
          descripcion?: string;
          direccion?: string;
          fecha_inicio?: string;
          id?: string;
          imagen_url?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          publicado?: boolean;
          tcg_juego?: Database["public"]["Enums"]["tcg_juego"];
          tienda_id?: string;
          titulo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "torneos_tienda_id_fkey";
            columns: ["tienda_id"];
            isOneToOne: false;
            referencedRelation: "tiendas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      categoria_torneo: "local" | "regional" | "premier" | "casual";
      estado_inscripcion: "confirmada" | "cancelada";
      tcg_juego:
        | "pokemon"
        | "yugioh"
        | "magic"
        | "one_piece"
        | "digimon"
        | "lorcana"
        | "otro";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];
export type TcgJuego = PublicSchema["Enums"]["tcg_juego"];
export type CategoriaTorneo = PublicSchema["Enums"]["categoria_torneo"];
export type EstadoInscripcion = PublicSchema["Enums"]["estado_inscripcion"];
