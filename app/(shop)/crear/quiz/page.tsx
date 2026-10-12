import type { Metadata } from "next";
import { QuizView } from "@/features/quiz/QuizView";

export const metadata: Metadata = {
  title: "¿Qué necesitás? · Quiz de stack",
  description: "Cuatro preguntas (objetivo, días, horario y restricciones) y te armamos un stack de suplementos con el porqué de cada producto. Orientativo.",
};

export default function QuizPage() {
  return <QuizView />;
}
