// localStorage key used to remember which Account tab (profile/security/etc.)
// the user last had open, so a page refresh returns them to the same place.
// Cleared on logout via AuthProvider so the next session starts on Profile.
const ACCOUNT_ACTIVE_TAB_STORAGE_KEY = 'accountActiveTab';

export default ACCOUNT_ACTIVE_TAB_STORAGE_KEY;
