import type { CategoriaTorneo, TcgJuego } from "@/types/database.types";

export const TCG_OPTIONS: { value: TcgJuego; label: string }[] = [
  { value: "pokemon", label: "Pokemon TCG" },
  { value: "yugioh", label: "Yu-Gi-Oh!" },
  { value: "magic", label: "Magic: The Gathering" },
  { value: "one_piece", label: "One Piece Card Game" },
  { value: "digimon", label: "Digimon Card Game" },
  { value: "lorcana", label: "Disney Lorcana" },
  { value: "otro", label: "Otro" },
];

export const CATEGORIA_OPTIONS: { value: CategoriaTorneo; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "regional", label: "Regional" },
  { value: "premier", label: "Premier" },
  { value: "casual", label: "Casual" },
];
