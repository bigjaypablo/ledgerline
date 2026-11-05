import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const opportunitiesSearchSchema = z.object({
  kind: z.string().optional(),
  rewardStatus: z.string().optional(),
});

export const Route = createFileRoute("/opportunities")({
  validateSearch: (search) => opportunitiesSearchSchema.parse(search),
});
