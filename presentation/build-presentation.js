// Generates "Mastering Java Streams API.pptx" from the course content.
//
// Usage (from this folder):
//   npm install pptxgenjs react react-dom react-icons sharp   # once, into a scratch dir or here
//   node build-presentation.js
//
// The slide text mirrors the task.md files of the course; when a lesson changes, change the matching slide here.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

// apply_theme.js (copied next to this script) writes the THEME colors into the saved .pptx; pptxgenjs cannot do that itself.
const applyThemePath = process.env.APPLY_THEME || path.join(__dirname, "apply_theme.js");
const { applyTheme } = require(applyThemePath);

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "Mastering Java Streams API.pptx");

// ---------------------------------------------------------------- theme
const THEME = {
  name: "Streams",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B1F33", lt1: "FFFFFF", dk2: "16405E", lt2: "E9F4F4",
    accent1: "0E9594", accent2: "F28C28", accent3: "7FD1C7",
    accent4: "D6453D", accent5: "3AA66E", accent6: "7B6FD0",
    hlink: "0E9594", folHlink: "7B6FD0",
  },
};
const HEX = THEME.colors; // only for the places that accept hex only (chart colors, backgrounds)
const CODE_FONT = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "Mastering Java Streams API";
pres.author = "Jente Sondervorst";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const W = 13.33, H = 7.5, MX = 0.6;

// ---------------------------------------------------------------- layouts
const FOOT = { text: "Mastering Java Streams API  ·  EhB", options: { x: MX, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent3, margin: 0 } };

pres.defineSlideMaster({
  title: "TITLE",
  background: { color: HEX.dk1 },
  objects: [],
  slideNumber: undefined,
});
pres.defineSlideMaster({
  title: "SECTION",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 2.7, w: 12.1, h: 1.3, fontSize: 48, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: MX, y: 4.1, w: 9, h: 1.2, fontSize: 20, color: C.accent3, align: "left", valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: HEX.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.4, w: W - 2 * MX, h: 0.9, fontSize: 34, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } },
    { text: { text: "Mastering Java Streams API  ·  EhB", options: { x: MX, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.text2, align: "right" },
});
pres.defineSlideMaster({
  title: "CLOSING",
  background: { color: HEX.dk1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.4, w: W - 2 * MX, h: 0.9, fontSize: 34, bold: true, color: C.background1, align: "left", valign: "middle", margin: 0 }, text: "" } },
  ],
});

// ---------------------------------------------------------------- helpers
async function icon(name, color = "FFFFFF") {
  const Cmp = fa[name] || fa.FaCircle;
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Cmp, { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// "text with `code` and **bold**" -> runs
function runs(str, base = {}, codeColor = C.text2) {
  const out = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0, m;
  while ((m = re.exec(str))) {
    if (m.index > last) out.push({ text: str.slice(last, m.index), options: { ...base } });
    const tok = m[0];
    if (tok.startsWith("`")) out.push({ text: tok.slice(1, -1), options: { ...base, fontFace: CODE_FONT, color: codeColor } });
    else out.push({ text: tok.slice(2, -2), options: { ...base, bold: true } });
    last = m.index + tok.length;
  }
  if (last < str.length) out.push({ text: str.slice(last), options: { ...base } });
  return out;
}

function title(slide, text) { slide.addText(text, { placeholder: "title" }); }

function card(slide, x, y, w, h, name, fill = C.background2) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { type: "none" }, objectName: name,
  });
}

async function badge(slide, name, x, y, d, bg = C.accent1) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { type: "none" }, objectName: "badge-bg" });
  const pad = d * 0.27;
  slide.addImage({ data: await icon(name), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, altText: name });
}

function code(slide, text, x, y, w, h, size = 15, name = "code") {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: C.text1 }, line: { type: "none" }, objectName: name + "-bg" });
  slide.addText(text, { x: x + 0.2, y: y + 0.12, w: w - 0.4, h: h - 0.24, fontFace: CODE_FONT, fontSize: size, color: C.background1, valign: "top", margin: 0, isTextBox: true, objectName: name });
}

function text(slide, str, o) {
  slide.addText(runs(str, { fontSize: o.fontSize || 16, color: o.color || C.text1, bold: o.bold }, o.codeColor), { isTextBox: true, margin: 0, valign: o.valign || "top", ...o, fontSize: undefined, color: undefined, bold: undefined });
}

function bullets(slide, items, o) {
  const arr = [];
  items.forEach((it, i) => {
    const r = runs(it, { fontSize: o.fontSize || 18, color: o.color || C.text1 }, o.codeColor);
    r[0].options.bullet = { indent: 18 };
    r[0].options.paraSpaceAfter = o.gap ?? 10;
    if (i < items.length - 1) r[r.length - 1].options.breakLine = true;
    arr.push(...r);
  });
  slide.addText(arr, { x: o.x, y: o.y, w: o.w, h: o.h, valign: "top", margin: 0, isTextBox: true, objectName: o.name || "bullets" });
}

function table(slide, header, rows, o) {
  const hdr = header.map(h => ({ text: h.replace(/`/g, ""), options: { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: o.fontSize || 14, valign: "middle" } }));
  const body = rows.map((r, ri) => r.map(c => ({
    text: runs(c, { fontSize: o.fontSize || 14, color: C.text1 }),
    options: { fill: { color: ri % 2 ? C.background1 : C.background2 }, valign: "middle" },
  })));
  slide.addTable([hdr, ...body], {
    x: o.x ?? MX, y: o.y, w: o.w ?? W - 2 * MX, colW: o.colW, rowH: o.rowH,
    border: { type: "solid", pt: 0.5, color: C.background2 }, margin: [0.06, 0.12, 0.06, 0.12], objectName: o.name || "table",
  });
}

let sectionNo = 0;
function sectionSlide(name, subtitle, iconName) {
  pres.addSection({ title: name });
  const s = pres.addSlide({ masterName: "SECTION", sectionTitle: name });
  sectionNo += 1;
  s.addText(String(sectionNo).padStart(2, "0"), { x: MX, y: 1.4, w: 3, h: 1.2, fontSize: 72, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "section-number" });
  s.addText(name, { placeholder: "title" });
  s.addText(subtitle, { placeholder: "body" });
  return s;
}

function contentSlide(section, titleText, notes) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  title(s, titleText);
  if (notes) s.addNotes(notes);
  return s;
}

// ---------------------------------------------------------------- slides
async function build() {
  // ===== 1. Title
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Opening" });
  s.addNotes("Welcome. Who am I, and what will we do in the next 3 hours: understand, create, transform and finish streams, see what goes wrong, then practise.");
  // river of "elements"
  for (let i = 0; i < 9; i++) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.1 + (i % 3) * 1.9, y: 1.1 + Math.floor(i / 3) * 1.9 + (i % 3) * 0.35, w: 1.5, h: 1.5, rectRadius: 0.2,
      fill: { color: [C.accent1, C.accent3, C.accent2][(i + Math.floor(i / 3)) % 3] }, transparency: i % 2 ? 55 : 15, line: { type: "none" }, objectName: "tile-" + i });
  }
  s.addText("Mastering\nJava Streams API", { x: MX, y: 2.0, w: 6.4, h: 2.2, fontFace: "Cambria", fontSize: 48, bold: true, color: C.background1, margin: 0, valign: "top", isTextBox: true, objectName: "deck-title" });
  s.addText("Source → steps → result, in plain Java 25", { x: MX, y: 4.4, w: 6.2, h: 0.5, fontSize: 20, color: C.accent3, margin: 0, isTextBox: true, objectName: "deck-subtitle" });
  s.addText("EhB  ·  Jente Sondervorst", { x: MX, y: 6.5, w: 6, h: 0.4, fontSize: 14, color: C.background2, margin: 0, isTextBox: true, objectName: "deck-author" });

  // ===== 2. Agenda
  s = contentSlide("Opening", "What we will do today",
    "Walk through the agenda. Stress that 'Streams explained' has four parts and that debugging streams is part of it. Pitfalls and exercises come last.");
  const agenda = [
    ["Introduction", "tools, IDE suggestions, the domain", "FaTools"],
    ["What is a Stream", "source, steps, result", "FaWater"],
    ["Stream Initialization", "creating streams", "FaPlay"],
    ["Intermediate operations", "filter, map, flatMap … + debugging", "FaFilter"],
    ["Terminal operations", "collect, count, reduce, Optional", "FaFlagCheckered"],
    ["Pitfalls", "code that is broken on purpose", "FaExclamationTriangle"],
    ["Exercises", "practice makes perfect", "FaLaptopCode"],
  ];
  for (let i = 0; i < agenda.length; i++) {
    const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4;
    const x = MX + col * 6.2, y = 1.65 + row * 1.3;
    card(s, x, y, 5.9, 1.1, "agenda-card-" + i);
    await badge(s, agenda[i][2], x + 0.2, y + 0.2, 0.7, i === 5 ? C.accent4 : C.accent1);
    text(s, agenda[i][0], { x: x + 1.1, y: y + 0.17, w: 4.6, h: 0.4, fontSize: 20, bold: true });
    text(s, agenda[i][1], { x: x + 1.1, y: y + 0.58, w: 4.6, h: 0.35, fontSize: 14, color: C.text2 });
  }

  // ===== Introduction
  sectionSlide("Introduction", "Tools, IDE suggestions and the domain we will use all day");

  s = contentSlide("Introduction", "How this course works",
    "Explain the four kinds of tasks. Theory: read and run Main. Output tasks: match expected output. Exercises: tests. Pitfalls: broken on purpose, so we watch them, we do not fix them.");
  const kinds = [
    ["Theory lessons", "Open `src/Main.java`, read it top to bottom and run it.", "FaBookOpen", C.accent1],
    ["Output tasks", "Finish the TODO. Your output must match the expected output.", "FaTerminal", C.accent6],
    ["Exercises", "Implement the method. The unit tests tell you when you are done.", "FaCheckCircle", C.accent5],
    ["Pitfalls", "This code is broken **on purpose**. Run it and watch what goes wrong.", "FaBug", C.accent4],
  ];
  for (let i = 0; i < 4; i++) {
    const x = MX + i * 3.08;
    card(s, x, 1.7, 2.88, 3.1, "kind-card-" + i);
    await badge(s, kinds[i][2], x + 0.25, 1.95, 0.8, kinds[i][3]);
    text(s, kinds[i][0], { x: x + 0.25, y: 3.0, w: 2.4, h: 0.4, fontSize: 20, bold: true });
    text(s, kinds[i][1], { x: x + 0.25, y: 3.5, w: 2.4, h: 1.2, fontSize: 15 });
  }
  card(s, MX, 5.1, W - 2 * MX, 1.5, "tools-card", C.text2);
  text(s, "**Tools**", { x: MX + 0.3, y: 5.25, w: 3, h: 0.35, fontSize: 16, color: C.accent3 });
  text(s, "Java 25 (LTS)  ·  Gradle wrapper (`./gradlew`)  ·  IntelliJ IDEA + Learn and Teach  ·  JUnit + AssertJ\nsdkman and a good terminal (iTerm2, Windows Terminal) are optional but handy",
    { x: MX + 0.3, y: 5.65, w: W - 2 * MX - 0.6, h: 0.85, fontSize: 16, color: C.background1, codeColor: C.accent3 });

  s = contentSlide("Introduction", "Functional interfaces: the vocabulary of streams",
    "One abstract method each, so a lambda or method reference can implement them. Streams are built from these: filter takes a Predicate, map a Function, forEach a Consumer, collect uses Supplier and BinaryOperator internally, sorted a Comparator.");
  table(s, ["Interface", "Method", "Meaning", "Example"], [
    ["`Predicate<T>`", "`boolean test(T)`", "yes or no about a value", "`s -> s.isEmpty()`"],
    ["`Function<T,R>`", "`R apply(T)`", "turns a value into another", "`String::length`"],
    ["`Consumer<T>`", "`void accept(T)`", "does something, returns nothing", "`System.out::println`"],
    ["`Supplier<T>`", "`T get()`", "produces a value from nothing", "`ArrayList::new`"],
    ["`BinaryOperator<T>`", "`T apply(T, T)`", "combines two values of one type", "`(a, b) -> a + b`"],
    ["`Comparator<T>`", "`int compare(T, T)`", "orders two values", "`comparingInt(String::length)`"],
  ], { y: 1.65, colW: [2.7, 2.7, 3.4, 3.33], rowH: 0.62, fontSize: 15 });
  s.addText(runs("`filter` takes a `Predicate`, `map` a `Function`, `forEach` a `Consumer`, `sorted` a `Comparator`.", { fontSize: 16, color: C.text2 }),
    { x: MX, y: 6.1, w: W - 2 * MX, h: 0.5, margin: 0, isTextBox: true, objectName: "fi-footnote" });

  s = contentSlide("Introduction", "IntelliJ suggestions are part of the lesson",
    "Some code is intentionally suboptimal so that IntelliJ suggests an improvement. When you see the yellow or grey highlight, press Alt+Enter and compare before and after. Hulk meme: when you see the suggestion, you must realise you have to apply it.");
  bullets(s, [
    "Some snippets are **intentionally suboptimal**",
    "Yellow or grey highlight in the editor? Press **Alt+Enter**",
    "Apply the suggestion, then **compare before and after**",
    "Example: `Collectors.toList()` → `.toList()`, lambda → method reference",
  ], { x: MX, y: 1.7, w: 6.2, h: 3.8, fontSize: 20, gap: 16 });
  card(s, 7.3, 1.6, 2.75, 4.2, "hulk-card");
  s.addImage({ path: path.join(ROOT, "Introduction/Introduction/images/hulk_suggesting.png"), x: 7.45, y: 1.75, w: 2.45, h: 2.73, altText: "Hulk suggesting changes" });
  s.addImage({ path: path.join(ROOT, "Introduction/Introduction/images/suggestion_1.png"), x: 10.3, y: 1.6, w: 2.43, h: 1.55, altText: "IntelliJ code suggestion popup" });
  text(s, "When you see this, **you must** apply it", { x: 7.45, y: 4.7, w: 2.45, h: 1.0, fontSize: 16, color: C.text1 });

  s = contentSlide("Introduction", "The domain: four records",
    "All domain classes are records. References are plain ids, not objects: to go from an id to the object you need a lookup. OrderLine.total() is price times quantity.");
  const recs = [
    ["Customer", "id · name · lastName", 0.6, 1.8, C.accent6],
    ["Order", "id · customerId · paid · orderLines", 5.0, 1.8, C.accent1],
    ["OrderLine", "articleId · quantity · price\ntotal() = price × quantity", 5.0, 4.2, C.accent2],
    ["Article", "id · name", 9.4, 4.2, C.accent5],
  ];
  recs.forEach(([n, f, x, y, col], i) => {
    card(s, x, y, 3.3, 1.7, "record-" + n);
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.27, w: 0.28, h: 0.28, fill: { color: col }, line: { type: "none" }, objectName: "record-dot-" + n });
    text(s, n, { x: x + 0.7, y: y + 0.2, w: 2.5, h: 0.45, fontSize: 22, bold: true });
    text(s, f, { x: x + 0.3, y: y + 0.8, w: 2.8, h: 0.8, fontSize: 15, color: C.text2 });
  });
  // connectors between the records
  const arrow = (o) => s.addShape(pres.shapes.LINE, { line: { color: C.text2, width: 2, endArrowType: "triangle" }, objectName: "arrow", ...o });
  arrow({ x: 4.0, y: 2.65, w: 1.0, h: 0, flipH: true });
  text(s, "customerId", { x: 4.0, y: 2.25, w: 1.0, h: 0.3, fontSize: 12, color: C.text2, align: "center" });
  arrow({ x: 6.65, y: 3.5, w: 0, h: 0.7 });
  text(s, "orderLines", { x: 6.8, y: 3.7, w: 1.4, h: 0.3, fontSize: 12, color: C.text2 });
  arrow({ x: 8.3, y: 5.05, w: 1.1, h: 0 });
  text(s, "articleId", { x: 8.3, y: 4.65, w: 1.1, h: 0.3, fontSize: 12, color: C.text2, align: "center" });
  text(s, "References are plain ids, not objects: to get from an id to the `Article` or `Customer` you look it up.",
    { x: 0.6, y: 4.3, w: 3.9, h: 1.6, fontSize: 16, color: C.text1 });

  s = contentSlide("Introduction", "The sample data",
    "Same data in (almost) every lesson. Customers only appear in the exercises. Green phone is a paid order, red phone an unpaid order, the icons are the order lines.");
  s.addImage({ path: path.join(ROOT, "Introduction/The domain/images/orders.png"), x: MX, y: 1.7, w: 7.4, h: 4.17, altText: "The five sample orders with their order lines" });
  text(s, "Green phone = paid order, red phone = unpaid order, icons = order lines.", { x: MX, y: 6.0, w: 7.4, h: 0.5, fontSize: 14, color: C.text2 });
  const stats = [["10", "articles", "Coffee, Pizza, Candy, Taco …"], ["5", "orders", "3 paid, 2 unpaid"], ["18", "order lines", "worth EUR 39.00 in total"]];
  stats.forEach(([n, l, d], i) => {
    const y = 1.7 + i * 1.6;
    card(s, 8.4, y, 4.33, 1.4, "stat-card-" + i);
    text(s, n, { x: 8.65, y: y + 0.15, w: 1.4, h: 1.1, fontSize: 54, bold: true, color: C.accent1, valign: "middle" });
    text(s, "**" + l + "**", { x: 10.1, y: y + 0.3, w: 2.5, h: 0.4, fontSize: 20 });
    text(s, d, { x: 10.1, y: y + 0.75, w: 2.5, h: 0.5, fontSize: 14, color: C.text2 });
  });

  // ===== What is a Stream
  sectionSlide("What is a Stream", "A pipeline: source, steps, result");

  s = contentSlide("What is a Stream", "My first Stream: from loop to pipeline",
    "Task 1. Sum the total of every order line. The loop and the stream give the same answer: EUR39.00. Ask the room which one they find easier to read.");
  card(s, MX, 1.7, 5.9, 2.9, "loop-card");
  text(s, "**for loop**", { x: MX + 0.3, y: 1.85, w: 3, h: 0.4, fontSize: 18 });
  code(s, "double sum = 0;\nfor (OrderLine l : Database.orderLines) {\n    sum += l.total();\n}", MX + 0.25, 2.4, 5.4, 2.0, 14, "loop-code");
  card(s, 6.83, 1.7, 5.9, 2.9, "stream-card");
  text(s, "**stream**", { x: 7.13, y: 1.85, w: 3, h: 0.4, fontSize: 18 });
  code(s, "double sum = Database.orderLines\n    .stream()\n    .mapToDouble(OrderLine::total)\n    .sum();", 7.08, 2.4, 5.4, 2.0, 14, "stream-code");
  card(s, MX, 4.9, W - 2 * MX, 0.95, "result-card", C.text2);
  text(s, "Both print:  `The sum of all the order lines prices is: EUR39.00`", { x: MX + 0.3, y: 4.9, w: W - 2 * MX - 0.6, h: 0.95, fontSize: 18, color: C.background1, codeColor: C.accent3, valign: "middle" });
  text(s, "Read it top to bottom: the stream gets smaller or changes shape at every step.", { x: MX, y: 6.15, w: W - 2 * MX, h: 0.4, fontSize: 16, color: C.text2 });

  s = contentSlide("What is a Stream", "Anatomy of a pipeline",
    "Three parts. The source says where the elements come from. Zero or more intermediate operations transform. Exactly one terminal operation produces the result and starts the pipeline.");
  const parts = [
    ["Source", "Where the elements come from", "`orderLines.stream()`", "FaDatabase", C.accent1],
    ["Intermediate operations", "Zero or more steps that transform the stream", "`mapToDouble(…)`", "FaExchangeAlt", C.accent6],
    ["Terminal operation", "Exactly one. Produces the result and starts the pipeline", "`sum()`", "FaFlagCheckered", C.accent2],
  ];
  for (let i = 0; i < 3; i++) {
    const x = MX + i * 4.3;
    card(s, x, 1.7, 3.5, 3.3, "part-card-" + i);
    await badge(s, parts[i][3], x + 0.3, 1.95, 0.8, parts[i][4]);
    text(s, parts[i][0], { x: x + 0.3, y: 2.95, w: 3.0, h: 0.4, fontSize: 20, bold: true });
    text(s, parts[i][1], { x: x + 0.3, y: 3.4, w: 2.9, h: 0.8, fontSize: 15 });
    text(s, parts[i][2], { x: x + 0.3, y: 4.35, w: 3.0, h: 0.4, fontSize: 14 });
    if (i < 2) arrow({ x: x + 3.55, y: 3.35, w: 0.7, h: 0 });
  }
  code(s, ["double sum = Database.orderLines.stream()", "    .mapToDouble(OrderLine::total)", "    .sum();"].map((l, i) => l.padEnd(46) + ["// source", "// intermediate", "// terminal"][i]).join("\n"), MX, 5.3, W - 2 * MX, 1.35, 16, "pipeline-code");

  s = contentSlide("What is a Stream", "My first Stream: warehouse replenishment",
    "Task 2 goes beyond what they have seen so far, so this is the moment to let an AI assistant help. Paid orders are replenished with the same quantity of each article; unpaid orders are ignored. Quantities per article are added up. Map each part of the loop to a stream step.");
  code(s, "orders.stream()\n    .filter(Order::paid)\n    .flatMap(o -> o.orderLines().stream())\n    .collect(groupingBy(OrderLine::articleId,\n             summingInt(OrderLine::quantity)));", MX, 1.7, 7.2, 3.1, 15, "replenish-code");
  const map3 = [["`if (order.paid())`", "`filter`"], ["inner loop over order lines", "`flatMap`"], ["`Map` accumulator", "a collector"]];
  map3.forEach(([a, b], i) => {
    const y = 1.7 + i * 1.1;
    card(s, 8.1, y, 4.63, 0.9, "map-card-" + i);
    text(s, a, { x: 8.3, y, w: 2.5, h: 0.9, fontSize: 15, valign: "middle" });
    text(s, "→", { x: 10.7, y, w: 0.4, h: 0.9, fontSize: 22, bold: true, color: C.accent2, valign: "middle", align: "center" });
    text(s, b, { x: 11.2, y, w: 1.45, h: 0.9, fontSize: 16, bold: true, valign: "middle", color: C.accent1, codeColor: C.accent1 });
  });
  card(s, MX, 5.1, W - 2 * MX, 1.5, "example-card");
  text(s, "**Example** — Order 1 (paid): 2 Pizza + 1 Candy · Order 2 (paid): 1 Pizza + 1 Beer · Order 3 (unpaid): 5 Coffee", { x: MX + 0.3, y: 5.2, w: W - 2 * MX - 0.6, h: 0.5, fontSize: 16 });
  text(s, "**Delivery:** 3 Pizza, 1 Candy, 1 Beer", { x: MX + 0.3, y: 5.8, w: W - 2 * MX - 0.6, h: 0.5, fontSize: 18, color: C.accent1 });

  // ===== Stream Initialization
  sectionSlide("Stream Initialization", "A stream always starts from a source");

  s = contentSlide("Stream Initialization", "Ways to create a stream",
    "The demos in Main: collection.stream() (also for an empty list), Stream.of, Stream.concat, Stream.builder, IntStream range/rangeClosed, LongStream range/rangeClosed. One demo fails on purpose; we find out why together.");
  const inits = [
    ["`collection.stream()`", "from any collection, also an empty one"],
    ["`Stream.of(a, b, c)`", "from values"],
    ["`Stream.concat(s1, s2)`", "two streams become one"],
    ["`Stream.builder()`", "add elements one by one, then build"],
    ["`IntStream.range(a, b)`", "number range; also `rangeClosed`"],
    ["`LongStream.range(a, b)`", "same for `long`; also `rangeClosed`"],
  ];
  inits.forEach(([a, b], i) => {
    const x = MX + (i % 3) * 4.1, y = 1.7 + Math.floor(i / 3) * 1.75;
    card(s, x, y, 3.9, 1.5, "init-card-" + i);
    text(s, a, { x: x + 0.25, y: y + 0.25, w: 3.4, h: 0.4, fontSize: 17, bold: true });
    text(s, b, { x: x + 0.25, y: y + 0.8, w: 3.4, h: 0.6, fontSize: 15, color: C.text2 });
  });
  card(s, MX, 5.3, W - 2 * MX, 1.4, "init-more", C.text2);
  text(s, "**Also good to know**", { x: MX + 0.3, y: 5.4, w: 4, h: 0.35, fontSize: 16, color: C.accent3 });
  text(s, "`Stream.empty()` · `Arrays.stream(array)` · `\"text\".chars()` · `map.entrySet().stream()` · `Files.lines(path)`",
    { x: MX + 0.3, y: 5.85, w: W - 2 * MX - 0.6, h: 0.7, fontSize: 16, color: C.background1, codeColor: C.accent3 });

  s = contentSlide("Stream Initialization", "Ranges, infinite streams and empty sources",
    "range excludes the end value, rangeClosed includes it. generate and iterate are infinite: always combine them with limit, or use the three-argument iterate, which is finite. An empty source is fine; a null source throws a NullPointerException.");
  card(s, MX, 1.7, 5.9, 2.5, "range-card");
  text(s, "**range vs rangeClosed**", { x: MX + 0.3, y: 1.85, w: 5, h: 0.4, fontSize: 18 });
  code(s, "IntStream.range(1, 5)        // 1 2 3 4\nIntStream.rangeClosed(1, 5)  // 1 2 3 4 5", MX + 0.25, 2.4, 5.4, 1.5, 14, "range-code");
  card(s, 6.83, 1.7, 5.9, 2.5, "empty-card");
  text(s, "**Empty and null**", { x: 7.13, y: 1.85, w: 5, h: 0.4, fontSize: 18 });
  bullets(s, ["An **empty** list gives an empty stream: fine", "A `null` source throws `NullPointerException`"], { x: 7.13, y: 2.45, w: 5.3, h: 1.6, fontSize: 17 });
  card(s, MX, 4.5, W - 2 * MX, 2.1, "infinite-card", C.text2);
  await badge(s, "FaInfinity", MX + 0.3, 4.75, 0.75, C.accent2);
  text(s, "**Infinite sources: always combine with a limit**", { x: MX + 1.3, y: 4.7, w: 10, h: 0.4, fontSize: 18, color: C.background1 });
  text(s, "`Stream.generate(supplier)` and `Stream.iterate(seed, next)` never end.\nThe finite, for-like variant: `Stream.iterate(seed, hasNext, next)`",
    { x: MX + 1.3, y: 5.25, w: 10.8, h: 1.0, fontSize: 16, color: C.background1, codeColor: C.accent3 });

  // ===== Intermediate operations
  sectionSlide("Stream Intermediate operations", "Transform and select, lazily");

  s = contentSlide("Stream Intermediate operations", "The four core operations",
    "An intermediate operation returns a new stream, so you can chain them. Nothing runs until a terminal operation is called. filter: fewer elements, same type. map: same number, new type. flatMap: one-to-many, merged into one stream, e.g. order to its order lines. distinct: drops duplicates, its position in the chain changes how much work follows.");
  table(s, ["Operation", "Elements", "Type", "Example"], [
    ["`filter`", "fewer", "same", "keep the paid orders"],
    ["`map`", "same number", "new", "order → its total"],
    ["`flatMap`", "one-to-many, merged", "new", "order → its order lines"],
    ["`distinct`", "fewer", "same", "drop duplicates"],
  ], { y: 1.7, colW: [2.6, 3.4, 1.9, 4.23], rowH: 0.65, fontSize: 17 });
  card(s, MX, 5.2, W - 2 * MX, 1.4, "lazy-card", C.text2);
  await badge(s, "FaHourglassHalf", MX + 0.3, 5.5, 0.8, C.accent2);
  text(s, "**Returns a new stream, so you can chain.**\nNothing runs until a terminal operation is called.", { x: MX + 1.4, y: 5.2, w: 10.7, h: 1.4, fontSize: 20, color: C.background1, valign: "middle" });

  s = contentSlide("Stream Intermediate operations", "More operations to know",
    "Not demoed in Main but you will meet them: skip, limit, takeWhile, dropWhile, sorted, peek and the primitive mapTo variants.");
  const more = [
    ["skip(n)", "drops the first n elements"], ["limit(n)", "keeps at most n; makes an infinite stream finite"], ["takeWhile(p)", "keeps until the condition first fails, then stops"],
    ["dropWhile(p)", "drops until the condition first fails, keeps the rest"], ["sorted()", "new order; needs to see all elements first"], ["peek(action)", "runs an action on the way past; debugging only"],
    ["mapToInt", "→ `IntStream`, same count"], ["mapToDouble", "→ `DoubleStream`, same count"], ["mapToLong", "→ `LongStream`, same count"],
  ];
  more.forEach(([a, b], i) => {
    const x = MX + (i % 3) * 4.1, y = 1.65 + Math.floor(i / 3) * 1.7;
    card(s, x, y, 3.9, 1.5, "more-card-" + i);
    text(s, "**" + a + "**", { x: x + 0.25, y: y + 0.18, w: 3.4, h: 0.4, fontSize: 18, color: i === 5 ? C.accent4 : C.accent1, codeColor: i === 5 ? C.accent4 : C.accent1 });
    text(s, b, { x: x + 0.25, y: y + 0.7, w: 3.4, h: 0.7, fontSize: 15 });
  });

  s = contentSlide("Stream Intermediate operations", "One step, four shapes",
    "The first four demos in Main do the same work with a different kind of step: statement lambda, expression lambda, method reference, method. Introduce IntelliJ's suggestions here: it will propose the shorter form.");
  const shapes4 = [
    ["Statement lambda", ".filter(order -> {\n    return order.paid();\n})"],
    ["Expression lambda", ".filter(order -> order.paid())"],
    ["Method reference", ".filter(Order::paid)"],
    ["Method", ".filter(this::isPaid)"],
  ];
  shapes4.forEach(([a, b], i) => {
    const x = MX + (i % 2) * 6.2, y = 1.7 + Math.floor(i / 2) * 2.45;
    card(s, x, y, 5.93, 2.25, "shape-card-" + i);
    text(s, "**" + a + "**", { x: x + 0.25, y: y + 0.12, w: 4, h: 0.4, fontSize: 17 });
    code(s, b, x + 0.25, y + 0.6, 5.43, 1.45, 16, "shape-code-" + i);
  });
  text(s, "Same result in all four. The shorter the form, the easier to read.", { x: MX, y: 6.6, w: W - 2 * MX, h: 0.35, fontSize: 14, color: C.text2 });

  s = contentSlide("Stream Intermediate operations", "Lazy: elements flow one at a time",
    "A stream is lazy. Elements flow one at a time through all stages, which is why peek output is interleaved with later stages. A failure shows up at the terminal operation, not at the line where the faulty map or filter was written. The order of steps changes the result and the amount of work.");
  const stages = ["filter", "map", "terminal"];
  stages.forEach((st, i) => {
    const x = MX + i * 2.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.9, w: 2.1, h: 1.3, rectRadius: 0.12, fill: { color: i === 2 ? C.accent2 : C.accent1 }, line: { type: "none" }, objectName: "stage-" + st });
    text(s, st, { x, y: 1.9, w: 2.1, h: 1.3, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle" });
    if (i < 2) arrow({ x: x + 2.15, y: 2.55, w: 0.5, h: 0 });
  });
  text(s, "element 1 → all stages, then element 2 → all stages …", { x: MX, y: 3.4, w: 7.6, h: 0.4, fontSize: 15, color: C.text2 });
  bullets(s, [
    "No terminal operation? **Nothing runs.**",
    "Each element passes **all** stages before the next one starts",
    "A failing `map` surfaces at the **terminal** operation",
    "**Order matters**: it changes the result and the amount of work",
  ], { x: MX, y: 4.1, w: 7.6, h: 2.6, fontSize: 19, gap: 12 });
  card(s, 8.8, 1.7, 3.93, 4.9, "peek-card", C.text2);
  await badge(s, "FaEye", 9.1, 1.95, 0.75, C.accent4);
  text(s, "**peek**", { x: 9.1, y: 2.9, w: 3.3, h: 0.4, fontSize: 20, color: C.background1, codeColor: C.background1 });
  text(s, "Looks at each element without changing the stream.\n\n**For debugging only.** Not for production code, and never with an action that changes state.",
    { x: 9.1, y: 3.4, w: 3.35, h: 3.0, fontSize: 15, color: C.background1 });

  s = contentSlide("Stream Intermediate operations", "Debugging streams: four tools",
    "The presenter walks through these on the demos in Main. Nothing new to write. Rule of thumb: peek for a quick look, a lambda breakpoint to inspect one element, Trace Current Stream Chain to see the whole chain.");
  const dbg = [
    ["1  peek", "Quick, but you edit the code. Elements appear one at a time, interleaved with later stages. Remove it again.", "FaEye"],
    ["2  Lambda breakpoint", "Click the gutter next to the lambda and Debug. Hit once per element; inspect `order` in Variables.", "FaBug"],
    ["3  Trace Current Stream Chain", "In Debug: More → Trace Current Stream Chain. One tab per stage, plus Flat Mode. See where an element disappeared.", "FaProjectDiagram"],
    ["4  Read the stack trace", "Ignore the `java.util.stream` frames. Find the first frame in **your** code. The failure happens at the terminal operation.", "FaListUl"],
  ];
  for (let i = 0; i < 4; i++) {
    const x = MX + (i % 2) * 6.2, y = 1.65 + Math.floor(i / 2) * 2.15;
    card(s, x, y, 5.93, 1.95, "dbg-card-" + i);
    await badge(s, dbg[i][2], x + 0.25, y + 0.25, 0.7, C.accent1);
    text(s, "**" + dbg[i][0] + "**", { x: x + 1.15, y: y + 0.2, w: 4.6, h: 0.4, fontSize: 18 });
    text(s, dbg[i][1], { x: x + 1.15, y: y + 0.7, w: 4.6, h: 1.2, fontSize: 14 });
  }
  card(s, MX, 6.0, W - 2 * MX, 0.7, "rule-card", C.text2);
  text(s, "**Rule of thumb:** `peek` for a quick look · lambda breakpoint for one element · Trace Current Stream Chain for the whole chain",
    { x: MX + 0.3, y: 6.0, w: W - 2 * MX - 0.6, h: 0.7, fontSize: 15, color: C.background1, codeColor: C.accent3, valign: "middle" });

  // ===== Terminal operations
  sectionSlide("Stream Terminal operations", "Finish the pipeline and start it");

  s = contentSlide("Stream Terminal operations", "Terminal operations in the demo",
    "Walk through the table in the order Main calls them. The sets are sorted before printing: a Set has no guaranteed order. Prices are double to keep the code short; in real code use BigDecimal.");
  table(s, ["Operation", "What it does"], [
    ["`collect(Collectors.toList())` / `toSet()`", "Collect into a `List` or a `Set` (duplicates disappear, no order)"],
    ["`toUnmodifiableList()` / `toUnmodifiableSet()`", "Collect into a collection that cannot be changed afterwards"],
    ["`collect(Collectors.joining(\"|\"))`", "Glue the elements (`String`s) into one `String`"],
    ["`count()`", "Number of elements left in the stream"],
    ["`mapToDouble(...).sum()` / `average()` / `max()` / `min()`", "Totals on a primitive stream; the last three return an optional"],
    ["`summingDouble(...)` / `averagingDouble(...)`", "The same totals, as a `Collector`"],
    ["`max(Comparator)` / `min(Comparator)`", "Largest or smallest element, e.g. `comparingDouble`"],
    ["`findFirst()`", "First element, and stops the stream there"],
  ], { y: 1.55, colW: [5.6, 6.53], rowH: 0.5, fontSize: 14 });
  text(s, "**Money as double?** Fine for a demo. In real code use `BigDecimal`: `0.1` cannot be represented exactly.", { x: MX, y: 6.35, w: W - 2 * MX, h: 0.4, fontSize: 14, color: C.accent4, codeColor: C.accent4 });

  s = contentSlide("Stream Terminal operations", "Three ways to get a List",
    "IntelliJ suggests replacing collect(Collectors.toList()) with toList(). Fine, but not identical: toList() is unmodifiable. Code that calls add on the result breaks when you accept the suggestion, as collectingIntoCollection does.");
  table(s, ["Call", "Result list", "null elements", "Typical use"], [
    ["`collect(Collectors.toList())`", "`ArrayList` in practice, not guaranteed", "allowed", "legacy code"],
    ["`.toList()` (Java 16+)", "**unmodifiable**: `add` throws", "allowed", "**default choice**"],
    ["`collect(Collectors.toUnmodifiableList())`", "unmodifiable", "**rejected** (NPE)", "no nulls allowed"],
  ], { y: 1.7, colW: [5.2, 3.0, 2.2, 1.73], rowH: 0.8, fontSize: 14 });
  card(s, MX, 5.2, W - 2 * MX, 1.4, "toList-warning", C.text2);
  await badge(s, "FaExclamationTriangle", MX + 0.3, 5.5, 0.8, C.accent2);
  text(s, "Accepting IntelliJ's suggestion can **break** code that calls `add` on the result of `collect(Collectors.toList())`.",
    { x: MX + 1.4, y: 5.2, w: 10.7, h: 1.4, fontSize: 19, color: C.background1, valign: "middle", codeColor: C.accent3 });

  s = contentSlide("Stream Terminal operations", "Collectors: grouping",
    "collect can do much more than build a list. Results were produced by running each snippet on the course data (5 orders, 18 order lines). groupingBy makes a Map of key to list; add a downstream collector to count, sum or transform each group.");
  table(s, ["Collector", "What it does", "Result on the course data"], [
    ["`groupingBy(key)`", "`Map<key, List<…>>`", "customer id → list of their orders"],
    ["`groupingBy(key, counting())`", "group and count each group", "`{1=2, 2=2, 3=1}`"],
    ["`groupingBy(key, summingDouble(…))`", "group and sum a value per group", "`{1=20.5, 2=13.0, 3=5.5}`"],
    ["`groupingBy(key, mapping(f, toList()))`", "group and transform each element", "`{1=[1, 2], 2=[3, 4], 3=[5]}`"],
  ], { y: 1.65, colW: [5.2, 3.6, 3.33], rowH: 0.7, fontSize: 14 });
  code(s, "orders.stream().collect(\n    groupingBy(Order::customerId, summingDouble(Order::total)));   // {1=20.5, 2=13.0, 3=5.5}",
    MX, 5.4, W - 2 * MX, 1.1, 14, "grouping-code");

  s = contentSlide("Stream Terminal operations", "Collectors: more",
    "partitioningBy always has exactly two keys. toMap throws IllegalStateException on a duplicate key unless you pass a merge function; on the course data that happens for article 1. summarizingDouble gives count, sum, min, average and max in one pass. teeing runs two collectors over one stream.");
  table(s, ["Collector", "What it does", "Result on the course data"], [
    ["`partitioningBy(Order::paid, counting())`", "exactly two groups: `false` and `true`", "`{false=2, true=3}`"],
    ["`toMap(key, value, Integer::sum)`", "build a `Map`; merge function for duplicate keys", "quantity per article id"],
    ["`summarizingDouble(OrderLine::total)`", "count, sum, min, average, max in one pass", "`count=18, sum=39.0, …`"],
    ["`teeing(c1, c2, merger)`", "two collectors over one stream, combined", "`5 orders, 39.0`"],
  ], { y: 1.65, colW: [5.2, 3.8, 3.13], rowH: 0.7, fontSize: 14 });
  card(s, MX, 5.4, W - 2 * MX, 1.2, "tomap-warning", C.text2);
  text(s, "`toMap` without a merge function throws `IllegalStateException` on a duplicate key:\n`Duplicate key 1 (attempted merging values 1 and 1)`",
    { x: MX + 0.3, y: 5.4, w: W - 2 * MX - 0.6, h: 1.2, fontSize: 16, color: C.background1, codeColor: C.accent3, valign: "middle" });

  s = contentSlide("Stream Terminal operations", "Yes/no questions, sorting and reduce",
    "anyMatch stops at the first hit, allMatch and noneMatch at the first miss. On an empty stream they give false, true and true: all of nothing is vacuously true. Prefer findFirst over findAny. reduce is the general fold, but sum() is usually better.");
  const matches = [["anyMatch", "at least one?", "stops at first hit", "false"], ["allMatch", "all of them?", "stops at first miss", "true"], ["noneMatch", "none of them?", "stops at first miss", "true"]];
  matches.forEach(([a, b, c, e], i) => {
    const x = MX + i * 1.97;
    card(s, x, 1.7, 1.85, 2.5, "match-card-" + i);
    text(s, "**" + a + "**", { x: x + 0.2, y: 1.85, w: 1.6, h: 0.4, fontSize: 16, color: C.accent1, codeColor: C.accent1 });
    text(s, b, { x: x + 0.2, y: 2.35, w: 1.5, h: 0.4, fontSize: 15 });
    text(s, c, { x: x + 0.2, y: 2.8, w: 1.5, h: 0.7, fontSize: 14, color: C.text2 });
    text(s, "empty: **" + e + "**", { x: x + 0.2, y: 3.6, w: 1.5, h: 0.4, fontSize: 15 });
  });
  code(s, "orderLines.stream()\n  .sorted(comparingDouble(OrderLine::total)\n          .reversed()\n          .thenComparing(OrderLine::articleId))", 6.6, 1.7, 6.13, 2.5, 14, "sorted-code");
  code(s, "double total = orderLines.stream()\n    .map(OrderLine::total)\n    .reduce(0.0, Double::sum);   // 39.0", MX, 4.5, 7.1, 1.4, 15, "reduce-code");
  card(s, 7.9, 4.5, 4.83, 2.1, "reduce-note");
  text(s, "`reduce` is the general fold. Prefer `mapToDouble(…).sum()`: shorter, and no boxing.\n\nPrefer `findFirst()` over `findAny()`.", { x: 8.15, y: 4.65, w: 4.35, h: 1.8, fontSize: 15 });
  text(s, "Identity must be neutral (`0.0` for a sum).", { x: MX, y: 6.05, w: 7.1, h: 0.4, fontSize: 14, color: C.text2 });

  s = contentSlide("Stream Terminal operations", "Optional: decide what nothing means",
    "min, max, findFirst, findAny, average and reduce(accumulator) return an Optional because the stream may be empty. orElse(null) is a smell: it turns the explicit maybe back into a null that the next reader may forget to check.");
  table(s, ["Call", "Present", "Empty"], [
    ["`orElse(-1)`", "the value", "`-1` (argument always evaluated)"],
    ["`orElseGet(() -> -1)`", "the value", "`-1` (supplier only runs when empty)"],
    ["`orElseThrow(() -> new …)`", "the value", "throws your exception"],
    ["`orElseThrow()`", "the value", "`NoSuchElementException`"],
    ["`ifPresent(consumer)`", "runs the consumer", "does nothing"],
    ["`map(f)`", "`Optional` of the result", "stays empty"],
  ], { y: 1.55, colW: [4.2, 3.2, 4.73], rowH: 0.5, fontSize: 14 });
  card(s, MX, 5.5, W - 2 * MX, 1.1, "orelse-null", C.text2);
  text(s, "`orElse(null)` is a smell: it turns the explicit “maybe” back into a `null`. Choose a default, `orElseThrow`, or keep mapping.",
    { x: MX + 0.3, y: 5.5, w: W - 2 * MX - 0.6, h: 1.1, fontSize: 16, color: C.background1, codeColor: C.accent3, valign: "middle" });

  s = contentSlide("Stream Terminal operations", "What is new since Java 8",
    "The course code is written in Java 8 style on purpose, because that is what IntelliJ's suggestions start from, but the baseline is Java 25. Reference only, nothing to run. None of these needs a preview flag on JDK 25.");
  table(s, ["Feature", "Since", "What it does"], [
    ["`Stream.toList()`", "16", "shortcut for a list: unmodifiable, `null` allowed"],
    ["`Stream.ofNullable(x)`", "9", "one element, or empty when `x` is `null`"],
    ["`iterate(seed, hasNext, next)`", "9", "a finite, for-like stream"],
    ["`takeWhile` / `dropWhile`", "9", "keep or skip a prefix while a condition holds"],
    ["`Collectors.teeing`", "12", "two collectors over one pass"],
    ["`mapMulti`", "16", "zero, one or many elements downstream, without a temporary stream"],
    ["Unnamed parameter `_`", "22", "name for a parameter you do not use"],
    ["Gatherers", "24", "custom intermediate operations"],
  ], { y: 1.65, colW: [4.2, 1.2, 6.73], rowH: 0.56, fontSize: 15 });

  s = contentSlide("Stream Terminal operations", "Gatherers: custom intermediate operations",
    "Gatherers are final since Java 24 (preview in 22 and 23). A collector can only end a pipeline; a gatherer is an intermediate operation so the stream continues. They are the way to write operations that look at more than one element at a time: windows, running totals.");
  table(s, ["Gatherer", "What it does", "Result"], [
    ["`windowFixed(3)`", "consecutive lists of 3", "`[[Apple, Beer, Candy], [Chicken, …]]`"],
    ["`windowSliding(2)`", "overlapping windows", "`[[Apple, Beer], [Beer, Candy], …]`"],
    ["`scan(init, f)`", "running result after each element", "`[1, 3, 6, 10]`"],
    ["`fold(init, f)`", "like `reduce`, emits one element", "`[10]`"],
  ], { y: 1.6, colW: [2.8, 4.2, 5.13], rowH: 0.55, fontSize: 14 });
  code(s, "orders.stream()\n    .map(Order::total)\n    .gather(Gatherers.scan(() -> 0.0, Double::sum))\n    .toList();\n// [6.7, 20.5, 27.1, 33.5, 39.0]   running revenue", MX, 4.8, 8.2, 1.8, 14, "scan-code");
  card(s, 9.1, 4.8, 3.63, 1.8, "scan-note");
  text(s, "The last value is the `39.0` that `sum()` returns.", { x: 9.35, y: 4.8, w: 3.15, h: 1.8, fontSize: 16, valign: "middle" });

  // ===== Pitfalls
  sectionSlide("Pitfalls", "Broken on purpose. Do not fix it, watch it.");

  s = contentSlide("Pitfalls", "Pitfall: endless streams",
    "Press Stop in IntelliJ when you have seen enough: the program does not stop by itself. Only a short-circuiting operation (limit, findFirst, takeWhile, anyMatch) can end an infinite stream. distinct before limit(10) on a stream with only two distinct values never reaches ten elements. The timeout only stops waiting for the task, the pipeline keeps running.");
  code(s, "// 1: no short-circuiting operation\nIntStream.iterate(0, i -> 1 - i)  // 0 1 0 1 …\n    .forEach(System.out::println);\n\n// 2: looks safe, still hangs\nIntStream.iterate(0, i -> 1 - i)\n    .distinct()\n    .limit(10)   // waits for 10 elements\n    .forEach(System.out::println);", MX, 1.7, 6.6, 4.9, 15, "endless-code");
  card(s, 7.5, 1.7, 5.23, 2.3, "endless-why");
  await badge(s, "FaTimesCircle", 7.75, 1.95, 0.7, C.accent4);
  text(s, "**Why**", { x: 8.65, y: 1.95, w: 3, h: 0.4, fontSize: 18 });
  text(s, "`distinct()` only ever lets `0` and `1` through, so `limit(10)` waits for elements that never arrive.", { x: 7.75, y: 2.8, w: 4.75, h: 1.1, fontSize: 15 });
  card(s, 7.5, 4.3, 5.23, 2.3, "endless-fix");
  await badge(s, "FaCheckCircle", 7.75, 4.55, 0.7, C.accent5);
  text(s, "**Fix**", { x: 8.65, y: 4.55, w: 3, h: 0.4, fontSize: 18 });
  text(s, "`limit(10)` **before** `distinct()`, or give the stream an end: `iterate(0, i -> i < 10, i -> i + 1)`", { x: 7.75, y: 5.35, w: 4.75, h: 1.2, fontSize: 15 });

  s = contentSlide("Pitfalls", "Pitfall: the order of operations matters",
    "Before running, guess how many numbers it prints. limit(10).skip(5): take the first 10 (0 to 9), then drop 5: five numbers. skip(5).limit(10): drop 5, then take 10: five to fourteen. Each step only sees what the previous step passes on.");
  const rowOf = (label, y, kind) => {
    text(s, label, { x: MX, y, w: 8, h: 0.4, fontSize: 18, bold: true });
    for (let n = 0; n < 15; n++) {
      let fill = C.accent1, tc = C.background1, line = { type: "none" };
      const dropped = n < 5;
      if (dropped) { fill = C.background2; tc = C.text2; }
      if (kind === "limitskip" && n >= 10) { fill = C.background1; tc = C.text2; line = { color: C.background2, width: 1.5, dashType: "dash" }; }
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX + n * 0.81, y: y + 0.55, w: 0.71, h: 0.71, rectRadius: 0.08, fill: { color: fill }, line, objectName: "num-" + kind + "-" + n });
      text(s, String(n), { x: MX + n * 0.81, y: y + 0.55, w: 0.71, h: 0.71, fontSize: 16, bold: true, color: tc, align: "center", valign: "middle" });
    }
  };
  rowOf("`limit(10).skip(5)`  →  5 6 7 8 9  (only five numbers)", 1.65, "limitskip");
  rowOf("`skip(5).limit(10)`  →  5 6 7 … 14  (ten numbers)", 3.55, "skiplimit");
  const legend = [[C.background2, "dropped by `skip`"], [C.accent1, "printed"], [C.background1, "never produced (cut by `limit`)"]];
  legend.forEach(([f, l], i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX + i * 3.4, y: 5.6, w: 0.3, h: 0.3, rectRadius: 0.05, fill: { color: f }, line: { color: C.background2, width: 1.5 }, objectName: "legend-" + i });
    text(s, l, { x: MX + i * 3.4 + 0.45, y: 5.55, w: 2.9, h: 0.4, fontSize: 14, color: C.text2 });
  });
  text(s, "Each step only sees what the previous step passes on.", { x: MX, y: 6.2, w: W - 2 * MX, h: 0.45, fontSize: 18, bold: true, color: C.accent1 });

  s = contentSlide("Pitfalls", "Pitfall: a slow call inside a loop or stream",
    "This is the N+1 problem: one call to get the lines plus N calls to get the details. Database.getArticle(id) pretends to be a remote call of 100 ms; there are 18 order lines, so 18 calls per run. The bulk variants make one call (300 ms) and look articles up in a Map. A for loop and a stream behave the same here; the stream can hide the call inside a lambda. Timings measured on JDK 25, Apple silicon, 10 runs each; absolute numbers vary per machine, the ratio (about 6x) does not.");
  s.addChart(pres.charts.BAR, [{ name: "Time for 10 runs (seconds)", labels: ["for loop,\ncall per line", "stream,\ncall per line", "for loop,\nbulk fetch", "stream,\nbulk fetch"], values: [18.7, 18.7, 3.05, 3.05] }], {
    x: MX, y: 1.65, w: 6.8, h: 5.0, barDir: "col", chartColors: [HEX.accent4, HEX.accent4, HEX.accent1, HEX.accent1], barGapWidthPct: 60,
    showTitle: true, title: "Time for 10 runs (seconds, JDK 25)", titleFontSize: 14, titleColor: HEX.dk1, titleFontFace: "+mn-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0.0",
    catAxisLabelFontSize: 13, catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });
  card(s, 7.7, 1.65, 5.03, 2.35, "n1-why");
  text(s, "**The N+1 problem**", { x: 7.95, y: 1.8, w: 4.5, h: 0.4, fontSize: 18 });
  text(s, "1 call for the lines + N calls for the details: 18 calls per run at 100 ms each. The loop is **not** the problem, the call is. A stream just hides it inside a lambda.", { x: 7.95, y: 2.3, w: 4.55, h: 1.6, fontSize: 15 });
  card(s, 7.7, 4.25, 5.03, 2.4, "n1-fix", C.text2);
  text(s, "**Fix: fetch once, then work in memory**", { x: 7.95, y: 4.4, w: 4.55, h: 0.4, fontSize: 16, color: C.background1 });
  code(s, "Map<Integer, Article> articles =\n    Database.getArticles();\narticles.get(line.articleId())", 7.95, 4.9, 4.55, 1.55, 14, "n1-code");

  // ===== Exercises
  sectionSlide("Exercises", "Practice makes perfect: make the tests green");

  s = contentSlide("Exercises", "Three exercises, three skills",
    "Run CourseTests. Exercise 1: filter customers, case-insensitive. Exercise 2: names in one list, 44 entries (34 customers plus 10 articles). Exercise 3: unique article names in unpaid orders: Chicken, Ice Cream, Coffee and Taco.");
  const ex = [
    ["1", "Filter customers", "Last name contains `e`; and first name contains `l`; or any field contains `o`. Case-insensitive.", "`filter` · `&&` / `||` · `toLowerCase`", "FaFilter"],
    ["2", "Names in one list", "All customers as “firstname lastname” and all articles by name, in one list of 44 strings.", "`map` · `Stream.concat`", "FaListUl"],
    ["3", "Unique article names in unpaid orders", "Filter unpaid orders, flatten their lines, look up each article name by id.", "`filter` · `flatMap` · `map` · `distinct`", "FaSearch"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = MX + i * 4.1;
    card(s, x, 1.7, 3.9, 4.9, "ex-card-" + i);
    await badge(s, ex[i][4], x + 0.3, 1.95, 0.8, C.accent5);
    text(s, "Exercise " + ex[i][0], { x: x + 1.3, y: 2.1, w: 2.4, h: 0.5, fontSize: 14, color: C.text2 });
    text(s, ex[i][1], { x: x + 0.3, y: 3.05, w: 3.35, h: 0.9, fontSize: 20, bold: true });
    text(s, ex[i][2], { x: x + 0.3, y: 4.0, w: 3.35, h: 1.5, fontSize: 15 });
    text(s, ex[i][3], { x: x + 0.3, y: 5.75, w: 3.35, h: 0.6, fontSize: 14 });
  }

  // ===== Closing
  pres.addSection({ title: "Wrap-up" });
  s = pres.addSlide({ masterName: "CLOSING", sectionTitle: "Wrap-up" });
  title(s, "Key takeaways");
  s.addNotes("Summarise. Source, steps, result. Nothing runs without a terminal operation. Order matters. Apply IntelliJ's suggestions. Then: questions, and on to the exercises.");
  const take = [
    ["A pipeline has three parts", "source, zero or more intermediate steps, exactly one terminal operation", "FaStream"],
    ["Nothing runs without a terminal operation", "elements flow one at a time through all stages", "FaPlay"],
    ["Order changes the result", "and the amount of work: `filter` early, `limit` before `distinct`", "FaSortAmountDown"],
    ["Pick the right collector", "`groupingBy`, `partitioningBy`, `toMap` with a merge function", "FaLayerGroup"],
    ["An Optional says “maybe nothing”", "choose a default, throw, or keep mapping; avoid `orElse(null)`", "FaQuestionCircle"],
    ["Fetch in bulk, then stream", "never call a slow service per element", "FaDatabase"],
  ];
  for (let i = 0; i < 6; i++) {
    const x = MX + (i % 2) * 6.2, y = 1.55 + Math.floor(i / 2) * 1.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.93, h: 1.4, rectRadius: 0.12, fill: { color: C.text2 }, line: { type: "none" }, objectName: "take-card-" + i });
    await badge(s, take[i][2], x + 0.25, y + 0.35, 0.7, C.accent1);
    text(s, "**" + take[i][0] + "**", { x: x + 1.2, y: y + 0.2, w: 4.55, h: 0.4, fontSize: 18, color: C.background1 });
    text(s, take[i][1], { x: x + 1.2, y: y + 0.7, w: 4.55, h: 0.7, fontSize: 14, color: C.accent3, codeColor: C.background1 });
  }
  text(s, "Questions?", { x: MX, y: 6.5, w: 6, h: 0.5, fontSize: 22, bold: true, color: C.accent2 });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
}

build().catch(e => { console.error(e); process.exit(1); });
