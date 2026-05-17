"use server";

import { revalidatePath } from "next/cache";
import { getConciergeContact } from "@/lib/ghl-concierge";
import { moveOpportunityStage, stageById } from "@/lib/ghl-concierge-agent";

/**
 * Server action: move the concierge opportunity to a new pipeline stage.
 * Authenticated by the same share token used to view the dashboard.
 */
export async function moveStageAction(formData: FormData): Promise<void> {
  const contactId = String(formData.get("contactId") || "");
  const token = String(formData.get("token") || "");
  const opportunityId = String(formData.get("opportunityId") || "");
  const newStageId = String(formData.get("stageId") || "");

  if (!contactId || !token || !opportunityId || !newStageId) {
    throw new Error("missing required fields");
  }
  if (!stageById(newStageId)) {
    throw new Error("invalid stage id");
  }

  // Re-validate token against the contact record before mutating.
  const contact = await getConciergeContact(contactId);
  if (!contact || !contact.shareToken || contact.shareToken !== token) {
    throw new Error("unauthorized");
  }

  const result = await moveOpportunityStage(opportunityId, newStageId);
  if (!result.ok) throw new Error(result.error);

  revalidatePath(`/concierge/${contactId}/agent`);
}
