import API from "./api";

/** Verify this browser session with Flask, then cache ONLY server-returned identity. */
export async function refreshSessionUser() {
  const token = sessionStorage.getItem("lama_token");
  if (!token) throw new Error("Please sign in to continue.");

  // Explicit Authorization makes the /me request self-contained and easier
  // to verify in DevTools. The server still validates the token against SQL.
  const response = await API.get("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Prevent an older request from replacing the user of a newer login.
  if (sessionStorage.getItem("lama_token") !== token) {
    throw new Error("Your login changed while verifying the session. Please retry.");
  }

  const profile = response.data;
  const customerId = Number(profile?.customer_id);
  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    throw new Error("Your customer profile could not be loaded. Please contact support.");
  }

  const { token: ignoredToken, ...safeProfile } = profile;
  const verifiedUser = { ...safeProfile, customer_id: customerId };
  sessionStorage.setItem("user", JSON.stringify(verifiedUser));
  return verifiedUser;
}
