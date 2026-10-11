/** Personajes de Volta (Fase 5, pedido de Ignacio, fuera de la especificación): perros ilustrados para animar escenas. */
export type PupPose = "stand" | "walk" | "wave" | "hop";

export interface PupOutfit {
  /** Sombrero sobre la cabeza. */
  hat?: "fedora" | "party";
  /** Corbata colgando del collar. */
  tie?: string;
  /** Pañuelo al cuello (color). */
  bandana?: string;
  /** Moño en el copete (caniche). */
  bow?: string;
}

export interface PupProps {
  pose?: PupPose;
  outfit?: PupOutfit;
  /** Mira a la izquierda (espejado). */
  flip?: boolean;
  /** Cachorro: cabeza más grande y cuerpo más corto. */
  pup?: boolean;
  /** Animaciones propias (cola, parpadeo, patas). Sin esto queda quieto. */
  animated?: boolean;
  className?: string;
}
