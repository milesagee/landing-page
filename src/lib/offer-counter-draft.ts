import type { OfferData } from "./offer-data";

export function buildCounterDraft(data: OfferData) {
  const to = "rzzl25@aol.com";
  const cc = "Ed.Lamb@nafinc.com";
  const subject = `Re: purchase offer - ${data.property.address}`;

  const body = [
    `Ronnie,`,
    ``,
    `Working with ${data.sellerFirstName} on this. We're open to accepting early - before the 10:00 AM deadline - but the deal needs to land clean. Three asks before we sign:`,
    ``,
    `1. Strike the escalation. Lock the price at $${data.offer.escalationCap.toLocaleString()} flat.`,
    ``,
    `2. Inspection cap: no individual repair request below $1,000. We name that in writing now so neither side is guessing two weeks from now over things we already know about.`,
    ``,
    `3. Confirm the rest stands: ${new Date(data.offer.settlementDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })} settlement at ${data.offer.settlementAgent}, ${data.offer.financingType.toLowerCase()}, $${data.offer.earnestMoney.toLocaleString()} EMD, ${data.offer.inspectionDays}-day inspection, ${data.offer.personalPropertyIncluded.join(" / ")} convey.`,
    ``,
    `If those three land, we sign before 10. And listen - I know we're up against the clock. If you need a beat to work through it on your end, we can extend the deadline without issue. Just send the revised addenda when you have them.`,
    ``,
    `Miles`,
    `www.MAMSnow.com`,
  ].join("\n");

  return { to, cc, subject, body };
}

export function buildMilesApprovalEmail(data: OfferData) {
  const draft = buildCounterDraft(data);
  const subject = `[Offer Approval] ${data.sellerFirstName} ${data.property.address.split(" ").slice(0, 2).join(" ")} - draft ready to send`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">

  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Listing Concierge - Offer Approval</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${data.sellerFirstName} approved your plan.</div>
  </div>

  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">

    <p style="margin: 0 0 16px 0;">
      ${data.sellerFirstName} ${data.buyer.name.split(" ").slice(-1)[0] === "Seymour" ? "" : "Seymour"} clicked yes on the dashboard for ${data.property.address}. She's good with accepting early in exchange for the three asks.
    </p>

    <p style="margin: 0 0 8px 0; font-weight: 600;">Draft ready to send Ronnie + Ed (copy into Gmail):</p>

    <div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 16px 20px; margin: 12px 0 20px 0; font-size: 14px;">
      <p style="margin: 0 0 6px 0;"><strong>To:</strong> ${draft.to}</p>
      <p style="margin: 0 0 6px 0;"><strong>Cc:</strong> ${draft.cc}</p>
      <p style="margin: 0 0 12px 0;"><strong>Subject:</strong> ${draft.subject}</p>
      <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; font-size: 14px; color: #003F3F;">${draft.body}</pre>
    </div>

    <p style="margin: 16px 0 8px 0; font-size: 13px; color: #003F3F99;">
      Deadline is 10:00 AM. ${data.sellerFirstName} is waiting to hear from you in the morning.
    </p>

  </div>

</body>
</html>
  `.trim();

  return { subject, html, to: "miles@milesagee.com" };
}
