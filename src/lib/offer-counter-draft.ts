import type { OfferContactData, OfferRecord } from "./offer-data";

/**
 * Build the "do better" outreach email Miles will send the targeted buyer's
 * agent when the seller greenlights the move. This is NOT a formal counter
 * (nothing is signed yet). It's a tactful note that there's a stronger price
 * already on the table and an invitation to come up + tighten terms before
 * the review window closes.
 *
 * Miles previews + approves the draft language at build-time. The seller's
 * greenlight tap triggers a Gmail draft creation. Miles still hits send.
 */
export function buildDoBetterDraft(
  data: OfferContactData,
  targetOfferId: string,
) {
  const target = data.offers.find((o) => o.offerId === targetOfferId);
  if (!target) {
    throw new Error(`Offer ${targetOfferId} not found on contact ${data.contactId}`);
  }

  const leading = data.offers.find((o) => o.status === "leading");
  const priceAnchor = leading ? leading.basePrice : target.basePrice;

  const reviewDeadline = new Date(data.masterDeadline).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });

  const subject = `Re: Purchase Offer - ${data.property.address}`;
  const to = target.buyer.agentEmail;

  const body = [
    `${target.buyer.agentName.split(" ")[0]},`,
    ``,
    `Thanks for getting this in front of us tonight. ${data.sellerFirstName} appreciates ${target.buyer.name.split(" ")[0]}'s interest in the home and we wanted to come back to you quickly with where things actually stand.`,
    ``,
    `We have stronger paper on the table right now. The highest price point we are working with is $${priceAnchor.toLocaleString()}, and our formal review window closes ${reviewDeadline}.`,
    ``,
    `If your buyer can come up over that number and hold the strong inspection posture you sent (waiving single-item defects under $500), we are open to bringing your offer into the review on equal footing with what we already have. Two things would help us seriously consider it:`,
    ``,
    `  1. A price that beats $${priceAnchor.toLocaleString()}, ideally with a small margin so the seller sees real movement, not a $1 escalation.`,
    `  2. A re-issued pre-approval letter at the new contract price. The current letter from Langley FCU caps at $300,000, and we need to see a lender that can fund what we agree to.`,
    ``,
    `We are also fine extending your 8 AM ratification clock to let your buyer work this through. Just send the updated terms and a fresh pre-approval before our Tuesday review and we will give it the same look the leading offer is getting.`,
    ``,
    `Appreciate you and ${target.buyer.name.split(" ")[0]}. Talk soon.`,
    ``,
    `Miles Agee`,
    `MAMS LLC`,
    `www.MAMSnow.com`,
  ].join("\n");

  return { to, subject, body };
}

/**
 * HTML notification to Miles when the seller greenlights the plan.
 * Tells him the Gmail draft is already created and waiting for him to
 * eyeball + send. Includes the exact body inline as a fallback.
 */
export function buildMilesGreenlightEmail(
  data: OfferContactData,
  targetOfferId: string,
  draftCreatedOk: boolean,
) {
  const target = data.offers.find((o) => o.offerId === targetOfferId);
  if (!target) {
    throw new Error(`Offer ${targetOfferId} not found on contact ${data.contactId}`);
  }
  const draft = buildDoBetterDraft(data, targetOfferId);
  const subject = `[Offer Dashboard] ${data.sellerFirstName} greenlit the ${target.buyer.agentName.split(" ")[0]} push. Draft ${draftCreatedOk ? "ready in your Gmail" : "creation failed, see fallback"}.`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">

  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Listing Concierge · Seller Greenlight</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${data.sellerFirstName} is good with the plan.</div>
  </div>

  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">

    <p style="margin: 0 0 16px 0;">
      ${data.sellerFirstName} tapped greenlight on the dashboard. The "do better" email to ${target.buyer.agentName} (${target.buyer.agentBrokerage}) ${draftCreatedOk ? "is ready below. Open in Gmail, eyeball, send." : "could not be auto-drafted in Gmail. See fallback below and copy into a fresh email."}
    </p>

    <p style="margin: 0 0 8px 0; font-weight: 600;">${draftCreatedOk ? "What's in your Gmail Drafts" : "Fallback (copy into Gmail)"}:</p>

    <div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 16px 20px; margin: 12px 0 20px 0; font-size: 14px;">
      <p style="margin: 0 0 6px 0;"><strong>To:</strong> ${draft.to}</p>
      <p style="margin: 0 0 12px 0;"><strong>Subject:</strong> ${draft.subject}</p>
      <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; font-size: 14px; color: #003F3F;">${draft.body}</pre>
    </div>

    <p style="margin: 16px 0 8px 0; font-size: 13px; color: #003F3F99;">
      ${target.buyer.agentName.split(" ")[0]}'s offer expires at ${target.offerExpiresAt ? new Date(target.offerExpiresAt).toLocaleString("en-US", { weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" }) : "no set time"}. Getting this out tonight gives him room to work it on his side before the clock.
    </p>

  </div>

</body>
</html>
  `.trim();

  return { subject, html, to: "miles@milesagee.com" };
}
