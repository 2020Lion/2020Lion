const defaultVents = [
  {
    id: createId(),
    author: "匿名水母",
    category: "工作",
    content: "最怕一句“这个很简单”，简单到最后又是我半夜改完。想申请把需求方也接入熬夜系统。",
    hearts: 36,
    createdAt: "刚刚",
  },
  {
    id: createId(),
    author: "匿名云朵",
    category: "生活",
    content: "外卖备注写了不要香菜，收到一盒香菜。人生有时候就是这么绿。",
    hearts: 24,
    createdAt: "12 分钟前",
  },
  {
    id: createId(),
    author: "匿名月亮",
    category: "关系",
    content: "我不是不回消息，我只是需要把自己从社交电量 1% 充到 8%。",
    hearts: 51,
    createdAt: "28 分钟前",
  },
];

const comfortLines = [
  "你不需要马上变好。先允许自己觉得累。",
  "今天能撑到这里，已经不是一件容易的事。",
  "把话说出来，不代表你脆弱，而是你在照顾自己。",
  "有些乱糟糟的时刻，也会慢慢过去。",
  "你可以先暂停一下，世界不会因为你休息五分钟就崩塌。",
];

const nicknamePool = ["匿名海盐", "匿名小熊", "匿名乌龙", "匿名星尘", "匿名企鹅", "匿名薄荷"];
const blockedWords = ["电话", "身份证", "住址", "真实姓名"];

const ventWall = document.querySelector("#ventWall");
const ventForm = document.querySelector("#ventForm");
const contentInput = document.querySelector("#content");
const charCount = document.querySelector("#charCount");
const formStatus = document.querySelector("#formStatus");
const filters = document.querySelectorAll(".filter");
const comfortText = document.querySelector("#comfortText");
const comfortButton = document.querySelector("#comfortButton");

let vents = loadVents();
let activeFilter = "全部";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `vent-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadVents() {
  const saved = localStorage.getItem("anonymous-vents");
  return saved ? JSON.parse(saved) : defaultVents;
}

function saveVents() {
  localStorage.setItem("anonymous-vents", JSON.stringify(vents));
}

function renderVents() {
  const visibleVents = activeFilter === "全部" ? vents : vents.filter((vent) => vent.category === activeFilter);

  ventWall.innerHTML = visibleVents
    .map(
      (vent) => `
        <article class="vent-card">
          <div>
            <span class="tag">#${vent.category}</span>
            <p>${escapeHTML(vent.content)}</p>
          </div>
          <footer>
            <span>${vent.author} · ${vent.createdAt}</span>
            <button type="button" data-heart="${vent.id}" aria-label="给这条吐槽一个抱抱">抱抱 ${vent.hearts}</button>
          </footer>
        </article>
      `,
    )
    .join("");
}

function escapeHTML(value) {
  return value.replace(/[&<>'"]/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[char];
  });
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function containsBlockedWord(content) {
  return blockedWords.some((word) => content.includes(word));
}

contentInput.addEventListener("input", () => {
  charCount.textContent = `${contentInput.value.length} / ${contentInput.maxLength}`;
  formStatus.textContent = "";
  formStatus.classList.remove("error");
});

ventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(ventForm);
  const content = formData.get("content").trim();

  if (content.length < 8) {
    formStatus.textContent = "再多写一点点吧，至少 8 个字。";
    formStatus.classList.add("error");
    return;
  }

  if (containsBlockedWord(content)) {
    formStatus.textContent = "为了匿名安全，请删掉可能暴露隐私的词语。";
    formStatus.classList.add("error");
    return;
  }

  vents = [
    {
      id: createId(),
      author: getRandomItem(nicknamePool),
      category: formData.get("category"),
      content,
      hearts: 0,
      createdAt: "刚刚",
    },
    ...vents,
  ];

  saveVents();
  renderVents();
  ventForm.reset();
  charCount.textContent = `0 / ${contentInput.maxLength}`;
  formStatus.textContent = "已经匿名投递。愿你轻一点。";
  formStatus.classList.remove("error");
});

ventWall.addEventListener("click", (event) => {
  const button = event.target.closest("[data-heart]");
  if (!button) return;

  vents = vents.map((vent) => (vent.id === button.dataset.heart ? { ...vent, hearts: vent.hearts + 1 } : vent));
  saveVents();
  renderVents();
});

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === filter));
    renderVents();
  });
});

comfortButton.addEventListener("click", () => {
  comfortText.textContent = getRandomItem(comfortLines.filter((line) => line !== comfortText.textContent));
});

renderVents();
