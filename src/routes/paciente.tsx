import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/paciente")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
