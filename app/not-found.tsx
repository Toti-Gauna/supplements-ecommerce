import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";

export default function NotFound() {
  return (
    <EmptyState title="No encontramos esta página" action={<ButtonLink href="/">Volver al inicio</ButtonLink>}>
      Puede que el link esté incompleto. Probá buscar el producto.
    </EmptyState>
  );
}
