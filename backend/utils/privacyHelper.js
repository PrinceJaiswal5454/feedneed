/**
 * Privacy & Contact Protection Helper
 * Masks phone numbers and exact addresses unless:
 *  - The viewer is the owner of the post/campaign
 *  - The viewer is an Admin
 *  - The viewer has an Accepted/Completed request or volunteer application
 *  - Or the owner explicitly consented to immediate visibility
 */
function maskPhone(phone) {
  if (!phone) return 'Protected (Request approval required)';
  const cleaned = String(phone).trim();
  if (cleaned.length <= 4) return '****';
  return `${cleaned.slice(0, 3)}-****-${cleaned.slice(-2)} (Protected)`;
}

function sanitizeFoodPostForViewer(postDoc, viewerUser = null, hasAcceptedRequest = false) {
  const post = postDoc.toObject ? postDoc.toObject() : { ...postDoc };
  const donorId = post.donor && post.donor._id ? String(post.donor._id) : String(post.donor);
  const viewerId = viewerUser ? String(viewerUser._id) : null;

  const isOwner = Boolean(viewerId && viewerId === donorId);
  const isAdmin = Boolean(viewerUser && viewerUser.role === 'admin');
  const donorConsentedImmediately =
    post.donorPhoneConsent === true || post.contactPreference === 'immediate_consent';

  const canSeeProtectedDetails =
    isOwner || isAdmin || hasAcceptedRequest || donorConsentedImmediately;

  post.contactUnlocked = canSeeProtectedDetails;

  if (!canSeeProtectedDetails) {
    post.exactPickupAddress = `🔒 Exact address in ${post.pickupArea}, ${post.pickupCity} is revealed once the donor accepts your pickup request.`;
    if (post.donor && typeof post.donor === 'object') {
      post.donor = {
        ...post.donor,
        phone: maskPhone(post.donor.phone),
        email: '🔒 Protected until request accepted',
        exactAddress: undefined,
      };
    }
  }

  return post;
}

function sanitizeCampaignForViewer(campaignDoc, viewerUser = null, isApprovedParticipant = false) {
  const campaign = campaignDoc.toObject ? campaignDoc.toObject() : { ...campaignDoc };
  const ngoId = campaign.ngo && campaign.ngo._id ? String(campaign.ngo._id) : String(campaign.ngo);
  const viewerId = viewerUser ? String(viewerUser._id) : null;

  const isOwner = Boolean(viewerId && viewerId === ngoId);
  const isAdmin = Boolean(viewerUser && viewerUser.role === 'admin');
  const canSeeProtected =
    isOwner || isAdmin || isApprovedParticipant || campaign.publicContactConsent === true;

  campaign.contactUnlocked = canSeeProtected;

  if (!canSeeProtected) {
    campaign.exactDropoffAddress = `🔒 Exact drop-off point in ${campaign.dropoffArea}, ${campaign.city} is shared upon volunteer approval or donation pledge.`;
    if (campaign.ngo && typeof campaign.ngo === 'object') {
      campaign.ngo = {
        ...campaign.ngo,
        phone: maskPhone(campaign.ngo.phone),
        email: '🔒 Protected (Use In-App Campaign Pledge or Volunteer Form)',
      };
    }
  }

  return campaign;
}

module.exports = {
  maskPhone,
  sanitizeFoodPostForViewer,
  sanitizeCampaignForViewer,
};
