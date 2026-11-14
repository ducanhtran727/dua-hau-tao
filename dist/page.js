// Paste the Google Apps Script Web App URL ending in /exec here.
const orderScriptUrl = "";

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

const orderDialog = document.querySelector(".order-dialog");
const orderForm = orderDialog.querySelector("form");
const orderResult = orderForm.querySelector(".order-result");
const orderSubmit = orderForm.querySelector('[type="submit"]');

function openOrder() {
  if (!orderSubmit.disabled) orderResult.hidden = true;
  orderDialog.showModal();
}

document.querySelector("[data-open-order]").addEventListener("click", openOrder);

const offerTimer = document.querySelector(".offer-countdown time");
const offerDuration = 30 * 60;
const offerStarted = Date.now();

function updateOfferTimer() {
  const elapsed = Math.floor((Date.now() - offerStarted) / 1000);
  const remaining = offerDuration - (elapsed % offerDuration);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  offerTimer.dateTime = `PT${minutes}M${seconds}S`;
  offerTimer.textContent = [minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

updateOfferTimer();
setInterval(updateOfferTimer, 1000);

for (const id of ["rojvvtdw", "llc44l7n"]) {
  activate(document.getElementById("w-" + id), openOrder);
}

orderDialog.querySelector(".order-close").addEventListener("click", () => orderDialog.close());
function showOrderResult(message) {
  orderResult.textContent = message;
  orderResult.hidden = false;
  if (orderDialog.open) orderResult.scrollIntoView({ block: "nearest" });
}

orderForm.addEventListener("input", () => {
  if (!orderSubmit.disabled) orderResult.hidden = true;
});
orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (orderSubmit.disabled) return;
  if (!orderScriptUrl.trim()) {
    showOrderResult("Trang chưa kết nối hệ thống nhận đơn.");
    return;
  }

  const formData = new FormData(orderForm);
  const order = new URLSearchParams();
  for (const field of ["full_name", "phone_number", "address", "package"]) {
    const value = String(formData.get(field) ?? "").trim();
    if (!value) {
      showOrderResult("Vui lòng điền đầy đủ thông tin và chọn gói mua.");
      return;
    }
    order.set(field, value);
  }

  orderSubmit.disabled = true;
  orderForm.setAttribute("aria-busy", "true");
  showOrderResult("Đang gửi đơn hàng…");
  try {
    const response = await fetch(orderScriptUrl, { method: "POST", body: order });
    if (!response.ok || (await response.json()).ok !== true) {
      throw new Error("Order was not confirmed");
    }
    orderForm.reset();
    showOrderResult("Đặt hàng thành công!");
  } catch {
    showOrderResult("Chưa xác nhận được đơn hàng. Vui lòng kiểm tra kết nối hoặc thử lại.");
  } finally {
    orderSubmit.disabled = false;
    orderForm.removeAttribute("aria-busy");
  }
});
