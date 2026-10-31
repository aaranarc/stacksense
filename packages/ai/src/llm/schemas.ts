import { z } from "zod";
import { Observation, PhotoLabel, SourceFamily, Trade, ClaimLevel } from "@stacksense/contracts";
export const ChatLabels = z.object({ observations: z.array(Observation.pick({flatId:true,room:true,zone:true,surface:true,kind:true,hazards:true,hazardQuestionsAnswered:true,rawText:true,sourceMessageIds:true}).strict()) }).strict();
export const PhotoLabels = PhotoLabel.pick({surface:true,zone:true,boxes:true,meterDigits:true}).extend({ boxes: z.array(z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1),w:z.number().min(0).max(1),h:z.number().min(0).max(1),label:z.string()}).strict()).max(3) }).strict();
export const OpinionDraft = z.object({verdict:z.enum(["objection","needs_evidence","no_objection"]),allowedLevel:ClaimLevel,claim:z.string(),supports:z.array(z.string()),challenges:z.array(z.string()),unknown:z.array(z.string()),wouldChange:z.array(z.string())}).strict();
export const BaselineDraft = z.object({family:SourceFamily,flatId:z.string().nullable(),trade:Trade,emergency:z.boolean()}).strict();
