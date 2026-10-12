"use client";
import { useMemo } from "react";
import { customerRows, customerViews, type CustomerView } from "@/demo/admin/customers";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useAdmin } from "@/stores/admin";

/** Clientes con objetivo y recompras calculados contra la fecha de la demo (tabla, ficha e inicio usan lo mismo). */
export function useCustomerViews(): CustomerView[] {
  const users = useAdmin((s) => s.users);
  const orders = useAdmin((s) => s.orders);
  const products = useAdmin((s) => s.data.products);
  const profiles = useAdmin((s) => s.workshop.profiles);
  return useMemo(() => customerViews(customerRows(users, orders), profiles, products, DEMO_TODAY), [users, orders, products, profiles]);
}
