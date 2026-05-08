import { z } from "zod";

export const EventInvitationV1Schema = z.object({
  $version: z.literal(1).default(1),
  event: z.object({
    title: z.string().default(""),
    subtitle: z.string().optional(),
    date: z.string().default(""),         // "2025-06-15"
    time: z.string().optional(),          // "19:00"
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    locationUrl: z.string().optional(),   // Google Maps linki
    description: z.string().optional(),
    coverUrl: z.string().optional(),
  }),
  organizer: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
  rsvp: z.object({
    enabled: z.boolean().default(false),
    buttonText: z.string().default("Katılacağım"),
    url: z.string().optional(),
  }),
});

export type EventInvitationV1Type = z.infer<typeof EventInvitationV1Schema>;

export const defaultEventInvitation: EventInvitationV1Type = {
  $version: 1,
  event: { title: "", date: "" },
  organizer: {},
  rsvp: { enabled: false, buttonText: "Katılacağım" },
};
