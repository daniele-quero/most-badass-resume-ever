export const CV_BUILDER_HASH = "#cv-builder";

export function isCvBuilderRoute(): boolean {
  return typeof window !== "undefined" && window.location.hash === CV_BUILDER_HASH;
}

function setHash(hash: string) {
  window.location.hash = hash;
  // Browsers dispatch "hashchange" asynchronously; dispatch it synchronously too
  // so listeners (and tests) can react to the navigation immediately.
  window.dispatchEvent(new Event("hashchange"));
}

export function navigateToCvBuilder() {
  setHash(CV_BUILDER_HASH);
}

export function navigateToResume() {
  setHash("");
}
