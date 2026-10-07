(() => {
  const existing = window.TFT_ITEM_LAB_BACKEND || {};
  const functionsBase = typeof existing.functionsBase === "string" && existing.functionsBase
    ? existing.functionsBase.replace(/\/$/,"")
    : "https://bieihhaobdztjyoweewa.supabase.co/functions/v1";

  window.TFT_ITEM_LAB_BACKEND = Object.freeze({
    functionsBase,
    tftProfile: existing.tftProfile || functionsBase + "/riot-legacy-tft-profile",
    source: "zerotwo-gamer-supabase"
  });
})();