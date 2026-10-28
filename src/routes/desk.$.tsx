import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/desk/$")({
  beforeLoad: ({ params }) => {
    const rest = params._splat ?? "";
    throw redirect({ href: rest ? `/admin/${rest}` : "/admin" });
  },
});
