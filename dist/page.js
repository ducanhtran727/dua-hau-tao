const page = document.querySelector(".pageview");

function resizePage() {
  const scale = Math.min(1, document.documentElement.clientWidth / 420);
  document.documentElement.style.setProperty("--page-scale", scale);
}

resizePage();
window.addEventListener("resize", resizePage);

function activate(element, handler, label) {
  element.setAttribute("role", "button");
  element.tabIndex = 0;
  if (label) element.setAttribute("aria-label", label);
  element.addEventListener("click", handler);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  });
}

const scrollTargets = {
  rdrgi7ww: "kmezwmaz",
  gqx27e8z: "kmezwmaz",
  rojvvtdw: "kmezwmaz",
  llc44l7n: "kmezwmaz",
  "44gmw9eu": "wle3l5cp",
  "45eavcqz": "wle3l5cp",
  eyq2hqh0: "wle3l5cp",
};

for (const [buttonId, targetId] of Object.entries(scrollTargets)) {
  const button = document.getElementById("w-" + buttonId);
  const target = document.getElementById("w-" + targetId);
  if (!button || !target) continue;
  activate(button, () => {
    const top = target.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({
      top,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  });
}

const gallery = page.querySelector(".com-gallery");
const galleryView = gallery.querySelector(".gallery-view");
const slides = Array.from(gallery.querySelectorAll(".gallery-view-item"));
const thumbnails = Array.from(gallery.querySelectorAll(".gallery-controls-item"));
const thumbnailScroller = gallery.querySelector(".gallery-scroll");
let currentImage = 0;

function selectImage(index) {
  currentImage = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => {
    slide.classList.toggle("active", position === currentImage);
    slide.setAttribute("aria-hidden", String(position !== currentImage));
    slide.setAttribute("aria-label", `Ảnh sản phẩm ${position + 1}`);
  });
  thumbnails.forEach((thumbnail, position) => {
    thumbnail.classList.toggle("active", position === currentImage);
    thumbnail.setAttribute("aria-pressed", String(position === currentImage));
  });
  const thumbnail = thumbnails[currentImage];
  thumbnailScroller.scrollLeft = thumbnail.offsetLeft - thumbnailScroller.clientWidth / 2 + thumbnail.offsetWidth / 2;
}

thumbnails.forEach((thumbnail, index) => {
  activate(thumbnail, () => selectImage(index), `Xem ảnh ${index + 1}`);
});
for (const section of ["view", "controls"]) {
  activate(gallery.querySelector(`.gallery-${section}-icon-next`), () => selectImage(currentImage + 1), "Ảnh tiếp theo");
  activate(gallery.querySelector(`.gallery-${section}-icon-prev`), () => selectImage(currentImage - 1), "Ảnh trước");
}

let touchStart;
galleryView.addEventListener("touchstart", (event) => {
  touchStart = event.changedTouches[0].clientX;
}, { passive: true });
galleryView.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 35) selectImage(currentImage + (distance < 0 ? 1 : -1));
}, { passive: true });
selectImage(0);

const countdownDuration = 300;
const countdownStarted = Date.now();
const countdowns = page.querySelectorAll(".com-countdown");

function renderCountdown() {
  const elapsed = Math.floor((Date.now() - countdownStarted) / 1000);
  const remaining = countdownDuration - (elapsed % countdownDuration);
  for (const countdown of countdowns) {
    countdown.querySelector(".countdown-item-minute > div").textContent = String(Math.floor(remaining / 60)).padStart(2, "0");
    countdown.querySelector(".countdown-item-second > div").textContent = String(remaining % 60).padStart(2, "0");
  }
}

renderCountdown();
setInterval(renderCountdown, 1000);

const notice = document.createElement("dialog");
notice.className = "order-notice";
notice.setAttribute("aria-labelledby", "order-notice-title");
notice.innerHTML = `
  <h2 id="order-notice-title">Biểu mẫu xem thử</h2>
  <p>Thông tin hợp lệ. Trang này chưa kết nối hệ thống nhận đơn nên đơn hàng chưa được gửi.</p>
  <button type="button">Đóng</button>
`;
document.body.append(notice);
notice.querySelector("button").addEventListener("click", () => notice.close());

for (const form of page.querySelectorAll("form")) {
  activate(form.querySelector(".com-button"), () => form.requestSubmit());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    notice.showModal();
  });
}
