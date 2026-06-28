(() => {
  const chips = Array.from(document.querySelectorAll("[data-blog-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-blog-card]"));
  const emptyState = document.querySelector("[data-blog-empty]");
  if (!chips.length || !cards.length) return;

  const normalizeTag = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch (_) {
      decoded = raw;
    }
    return decoded.toLowerCase().split("_").join("-");
  };

  const parseList = (value) =>
    String(value || "")
      .split(",")
      .map((item) => normalizeTag(item))
      .filter(Boolean);

  const applyFilter = (activeChip) => {
    chips.forEach((chip) => {
      const isActive = chip === activeChip;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    const showAll = activeChip.dataset.blogFilter === "all";
    const matchTags = parseList(activeChip.dataset.blogMatch);
    let visibleCount = 0;

    cards.forEach((card) => {
      const postTags = parseList(card.dataset.blogTags);
      const visible = showAll || matchTags.some((tag) => postTags.includes(tag));
      card.hidden = !visible;
      card.classList.toggle("is-filter-hidden", !visible);
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      applyFilter(chip);
    });
  });

  applyFilter(chips[0]);
})();
