import { z } from "zod";
import { BlockEditorBlockSchema } from "./validation";

export const EditableFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "number",
  "url",
  "image",
  "boolean",
  "select",
  "list",
]);

export const TemplateEditableFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: EditableFieldTypeSchema,
  required: z.boolean().default(false),
  helperText: z.string().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export const TemplateBlockContractSchema = z.object({
  id: z.string().min(1),
  blockType: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean().default(false),
  repeatable: z.boolean().default(false),
  minItems: z.number().int().nonnegative().optional(),
  maxItems: z.number().int().positive().optional(),
  editableFields: z.array(TemplateEditableFieldSchema).default([]),
});

export const TemplateContractSchema = z.object({
  schema: z.literal("qrbir-template-contract"),
  version: z.literal(1),
  productType: z.enum([
    "restaurant_menu",
    "bio_link",
    "brand_bio",
    "google_review",
    "event_invitation",
    "campaign_link",
  ]),
  userEditable: z.object({
    blocks: z.array(TemplateBlockContractSchema),
  }),
  defaults: z.object({
    blocks: z.array(BlockEditorBlockSchema).default([]),
    settings: z.record(z.string(), z.unknown()).default({}),
  }),
  constraints: z
    .object({
      lockedLayout: z.boolean().default(true),
      allowBlockReorder: z.boolean().default(false),
      allowBlockAddRemove: z.boolean().default(false),
      maxBlocks: z.number().int().positive().optional(),
    })
    .default({
      lockedLayout: true,
      allowBlockReorder: false,
      allowBlockAddRemove: false,
    }),
});

export type EditableFieldType = z.infer<typeof EditableFieldTypeSchema>;
export type TemplateEditableField = z.infer<typeof TemplateEditableFieldSchema>;
export type TemplateBlockContract = z.infer<typeof TemplateBlockContractSchema>;
export type TemplateContract = z.infer<typeof TemplateContractSchema>;

export function parseTemplateContract(input: unknown) {
  return TemplateContractSchema.safeParse(input);
}

export function getTemplateContractFromMetadata(metadata: unknown): TemplateContract | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const contract = (metadata as Record<string, unknown>).contract;
  const parsed = parseTemplateContract(contract);
  return parsed.success ? parsed.data : null;
}
