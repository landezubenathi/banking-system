import API from "./api";

/**
 * Refresh the signed-in customer's profile from the authenticated API.
 * Never trust a customer_id supplied by the browser for authorization.
 */
export async function refreshSessionUser() {
  const token = sessionStorage.getItem("lama_token");
  if (!token) throw new Error("Please sign in to continue.");

  const response = await API.get("/me");
  const profile = response.data;
  const customerId = Number(profile?.customer_id);
  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    throw new Error("Your customer profile could not be loaded. Please contact support.");
  }

  // Retain the server-returned customer profile. The bearer token remains
  // separate and is never written to the user object.
  const { token: ignoredToken, ...safeProfile } = profile;
  sessionStorage.setItem("user", JSON.stringify({
    ...safeProfile,
    customer_id: customerId,
  }));
  return { ...safeProfile, customer_id: customerId };
}
