# Firestore Security Specification: Travel With Shubham

## Data Invariants
1. **Public Readability**: Anyone (even unauthenticated visitors) can read trips, photos, videos, and stats.
2. **Admin-Only Modifications**: Only the certified admin (`shubhamnagvanshi84823@gmail.com`) can create, update, or delete entries.
3. **No Self-Privilege Escalation**: Non-admins are strictly forbidden from modifying any statistics, trips, gallery photos, or videos.
4. **Data Integrity**: Trips, photos, and videos must contain all required fields with proper types, non-empty IDs, and sizes bounded to prevent Denial of Wallet storage-bloat attacks.

---

## The "Dirty Dozen" Malicious Payloads
The following payloads attempt to break the laws of Identity, Integrity, and State:

1. **Escalation Attack (Unauthorized Create Trip)**: Anonymous user attempts to create a trip document.
2. **Identity Spoofing (Non-Admin Write)**: Authenticated but unverified/wrong email user (e.g. `malicious@gmail.com`) attempts to create a trip.
3. **Spoofed Email (Email Unverified)**: Malicious user with email set to `shubhamnagvanshi84823@gmail.com` but `email_verified: false` attempts to write.
4. **Resource Poisoning (Junk Character ID)**: Admin attempts to write a trip with a 1MB size ID containing junk characters like `$$$*&^%`.
5. **Type Poisoning (Invalid Field Type)**: Admin attempts to write a trip with `distance` set to a Boolean value instead of an Integer.
6. **Immutable Field Bypass (Change ID)**: Admin attempts to update a trip, changing its immutable `id` field.
7. **Orphaned Photo Create (Missing Trip Reference)**: Admin attempts to create a photo document that does not have a `tripId`.
8. **Orphaned Video Create (Missing Trip Reference)**: Admin attempts to create a video document that does not have a `tripId`.
9. **Stats Sabotage (Unauthorized Stats Edit)**: Unauthenticated user attempts to delete or write over the global stats.
10. **Shadow Update (Ghost Fields on Trip)**: Admin attempts to update a trip with a ghost field `isSuperSecretFeatured: true` which is not in the schema.
11. **Negative Value Poisoning (Stats)**: Admin attempts to create stats with negative `trips` or negative `distance`.
12. **Null Field Injection**: Admin attempts to set `coverImage` to `null` which is required as a non-empty string.

---

## Test Verification Runner
To verify that all the "Dirty Dozen" are rejected, we'll design a comprehensive `firestore.rules` that returns `PERMISSION_DENIED` for all violations.
