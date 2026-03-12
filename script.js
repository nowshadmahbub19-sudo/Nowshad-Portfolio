const yearTarget = document.querySelector("#year");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const tiltCards = document.querySelectorAll(".tilt-card");
const typingTarget = document.querySelector("#typing-target");
const profileFrame = document.querySelector("#profile-frame");
const profilePhoto = document.querySelector("#profile-photo");
const cursorAura = document.querySelector(".cursor-aura");
const logoIcons = document.querySelectorAll(".tech-icon--logo");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear().toString();
}

if (profileFrame && profilePhoto) {
  const showProfile = () => profileFrame.classList.add("has-image");
  const hideProfile = () => profileFrame.classList.remove("has-image");

  profilePhoto.addEventListener("load", showProfile);
  profilePhoto.addEventListener("error", hideProfile);

  if (profilePhoto.complete && profilePhoto.naturalWidth > 0) {
    showProfile();
  }
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

const typingWords = [
  "full-stack learner",
  "React and Node.js builder",
  "AI-curious problem solver",
  "future computer scientist",
];

if (typingTarget) {
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeLoop = () => {
    const currentWord = typingWords[wordIndex];

    if (isDeleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }

    typingTarget.textContent = currentWord.slice(0, charIndex);

    let timeout = isDeleting ? 40 : 75;

    if (!isDeleting && charIndex === currentWord.length) {
      timeout = 1200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % typingWords.length;
      timeout = 240;
    }

    window.setTimeout(typeLoop, timeout);
  };

  typeLoop();
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (!reduceMotion && finePointer) {
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

  if (cursorAura) {
    const state = {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      auraX: window.innerWidth / 2,
      auraY: window.innerHeight / 2,
    };

    const activateCursor = () => {
      cursorAura.style.opacity = "1";
    };

    const deactivateCursor = () => {
      cursorAura.style.opacity = "0";
      cursorAura.classList.remove("is-active");
    };

    document.addEventListener("mousemove", (event) => {
      state.mouseX = event.clientX;
      state.mouseY = event.clientY;
      activateCursor();
    });

    document.addEventListener("mouseleave", deactivateCursor);

    document.querySelectorAll("a, button, .tilt-card, .tech-chip").forEach((element) => {
      element.addEventListener("mouseenter", () => cursorAura.classList.add("is-active"));
      element.addEventListener("mouseleave", () => cursorAura.classList.remove("is-active"));
    });

    const renderCursor = () => {
      state.auraX += (state.mouseX - state.auraX) * 0.14;
      state.auraY += (state.mouseY - state.auraY) * 0.14;
      cursorAura.style.left = `${state.auraX}px`;
      cursorAura.style.top = `${state.auraY}px`;
      requestAnimationFrame(renderCursor);
    };

    renderCursor();
  }
}
