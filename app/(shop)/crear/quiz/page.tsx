import type { Metadata } from "next";
import { QuizView } from "@/features/quiz/QuizView";

export const metadata: Metadata = {
  title: "¿Qué necesitás? · Quiz de objetivos y deportes",
  description: "Cinco preguntas (objetivos, deporte, días, horario y restricciones) y te armamos un programa de suplementos y equipamiento con el porqué de cada producto. Orientativo.",
};

export default function QuizPage() {
  return <QuizView />;
}
