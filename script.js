const yearTarget = document.querySelector("#year");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const tiltCards = document.querySelectorAll(".tilt-card");
const logoIcons = document.querySelectorAll(".tech-icon--logo");
const navLinks = document.querySelectorAll(".site-nav a");
const sectionTargets = document.querySelectorAll("main section[id]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear().toString();
}

logoIcons.forEach((icon) => {
  const img = icon.querySelector(".tech-logo");
  const fallbackText = icon.dataset.fallback || "";

  if (!img) {
    return;
  }

  const showFallback = () => {
    icon.classList.add("has-fallback");
    icon.textContent = fallbackText;
  };

  img.addEventListener("error", showFallback);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const counter = entry.target;
        animateCounter(counter);
        counterObserver.unobserve(counter);
      });
    },
    {
      threshold: 0.5,
    }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach((counter) => animateCounter(counter));
}

function animateCounter(counter) {
  const targetValue = Number(counter.dataset.counter || "0");
  const decimals = Number(counter.dataset.decimals || "0");
  const duration = 1400;
  const startTime = performance.now();

  const updateValue = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = targetValue * eased;

    counter.textContent = currentValue.toFixed(decimals);

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    } else {
      counter.textContent = targetValue.toFixed(decimals);
    }
  };

  requestAnimationFrame(updateValue);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateY = ((event.clientX - centerX) / rect.width) * 10;
      const rotateX = ((centerY - event.clientY) / rect.height) * 10;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setActiveLink(id) {
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window && sectionTargets.length && navLinks.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry?.target?.id) {
        setActiveLink(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.2, 0.45, 0.7],
    }
  );

  sectionTargets.forEach((section) => navObserver.observe(section));
}
