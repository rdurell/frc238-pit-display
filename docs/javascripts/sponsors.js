(function () {
  var fallbackSponsors = [{ name: "Thank you to our sponsors!" }];

  function resolveLogo(src, sponsor) {
    if (!sponsor.logo) {
      return "";
    }

    try {
      return new URL(sponsor.logo, new URL(src, window.location.href)).href;
    } catch (error) {
      return sponsor.logo;
    }
  }

  function makeItem(sponsor, src) {
    var item = document.createElement(sponsor.url ? "a" : "span");
    item.className = "pit-ticker__item";

    if (sponsor.url) {
      item.href = sponsor.url;
      item.target = "_blank";
      item.rel = "noopener";
    }

    var logo = resolveLogo(src, sponsor);

    if (logo) {
      var image = document.createElement("img");
      image.src = logo;
      image.alt = sponsor.name || "";
      image.loading = "lazy";
      item.appendChild(image);
    } else {
      item.textContent = sponsor.name || "";
    }

    return item;
  }

  function renderTicker(el, sponsors, src) {
    var track = el.querySelector(".pit-ticker__track");

    if (!track) {
      return;
    }

    track.textContent = "";
    track.setAttribute("aria-hidden", "true");

    for (var copy = 0; copy < 2; copy += 1) {
      var group = document.createElement("div");
      group.className = "pit-ticker__group";

      sponsors.forEach(function (sponsor) {
        group.appendChild(makeItem(sponsor, src));
      });

      track.appendChild(group);
    }
  }

  function renderGrid(el, sponsors, src) {
    if (!sponsors.length) {
      el.innerHTML = '<p class="pit-muted">Sponsor logos are being updated.</p>';
      return;
    }

    el.textContent = "";

    sponsors.forEach(function (sponsor) {
      var item = document.createElement(sponsor.url ? "a" : "div");
      item.className = "pit-sponsor";

      if (sponsor.url) {
        item.href = sponsor.url;
        item.target = "_blank";
        item.rel = "noopener";
      }

      var logo = resolveLogo(src, sponsor);

      if (logo) {
        var image = document.createElement("img");
        image.src = logo;
        image.alt = sponsor.name || "";
        image.loading = "lazy";
        item.appendChild(image);
      } else {
        item.textContent = sponsor.name || "";
      }

      el.appendChild(item);
    });
  }

  function loadSponsors(el) {
    if (el.dataset.pitLoaded === "true") {
      return;
    }

    el.dataset.pitLoaded = "true";

    var src = el.getAttribute("data-sponsors-src");

    if (!src) {
      renderTicker(el, fallbackSponsors, "");
      renderGrid(el, [], "");
      return;
    }

    fetch(src, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Unable to load sponsors");
        }

        return response.json();
      })
      .then(function (data) {
        var sponsors = Array.isArray(data.sponsors) ? data.sponsors : [];

        if (el.hasAttribute("data-sponsor-ticker")) {
          renderTicker(el, sponsors.length ? sponsors : fallbackSponsors, src);
        } else {
          renderGrid(el, sponsors, src);
        }
      })
      .catch(function () {
        if (el.hasAttribute("data-sponsor-ticker")) {
          renderTicker(el, fallbackSponsors, "");
        } else {
          renderGrid(el, [], "");
        }
      });
  }

  function init() {
    document
      .querySelectorAll("[data-sponsor-ticker], [data-sponsor-grid]")
      .forEach(loadSponsors);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
