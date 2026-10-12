/* Browser-only static cache and scroll-edge indicators; no account data here. */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ponto-offline-sw.js').catch(() => {});
}
const watchedTabs = new WeakSet();
function watchTabs() {
  document.querySelectorAll('#gestor-body .tabs').forEach(tabs => {
    if (watchedTabs.has(tabs)) return;
    watchedTabs.add(tabs);
    const wrapper = document.createElement('div');
    wrapper.className = 'tabs-scroll';
    tabs.before(wrapper);
    wrapper.append(tabs);
    const update = () => {
      wrapper.dataset.left = String(tabs.scrollLeft > 2);
      wrapper.dataset.right = String(tabs.scrollLeft + tabs.clientWidth < tabs.scrollWidth - 2);
    };
    tabs.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(tabs);
    requestAnimationFrame(update);
  });
}
new MutationObserver(watchTabs).observe(document.body, { childList: true, subtree: true });
watchTabs();