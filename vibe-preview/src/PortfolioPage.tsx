import { useEffect, useMemo, useRef, useState } from "react";

/* 作品集图片使用 public 路径，避免 Vite 压缩；将 .webp 放入 public/work/ 后改为 .webp 扩展名即可 */
const WORK_IMAGES = {
  uuWallet1: "/work/uu-wallet-1.webp",
  uuWallet2: "/work/uu-wallet-2.webp",
  aispeech1: "/work/aispeech-1.webp",
  aispeech2: "/work/aispeech-2.webp",
  aispeech3: "/work/aispeech-3.webp",
} as const;

const SECTION_IDS = ["home", "work", "about", "contact"] as const;

/* Home 打字机：仅对 Scalable / crafted / Delightful 三词逐字显示，每步 120ms，完整展示后暂停 5 秒 */
const HERO_STEP_MS = 120;
const HERO_RESET_AT = 68; // 0-25 打字，26-67 暂停 5s 后重置
const LOGO_PATH = "/work/logo.svg";

function useActiveSectionId() {
  const [activeId, setActiveId] = useState<(typeof SECTION_IDS)[number]>("home");

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]"),
    ).filter((s) => SECTION_IDS.includes(s.id as (typeof SECTION_IDS)[number]));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("id");
          if (!id) continue;
          if (SECTION_IDS.includes(id as (typeof SECTION_IDS)[number])) {
            setActiveId(id as (typeof SECTION_IDS)[number]);
          }
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0,
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return activeId;
}

const CONTACT_EMAIL = "echotommy8@gmail.com";

function ContactEmailButton() {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    const t = window.setTimeout(() => {
      setCopied(false);
      window.clearTimeout(t);
    }, 2000);
  };

  const isPressed = copied;
  const isHover = hover && !copied;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="contact-email-btn inline-flex items-center justify-center gap-2 rounded-full border border-[length:1px] bg-white px-6 py-3 text-base font-medium transition-colors focus:outline-none"
      style={{
        borderWidth: 1,
        borderColor: isPressed ? "#00D50C" : isHover ? "#00D50C" : "var(--dark-navy)",
        color: isPressed ? "#00D50C" : isHover ? "#00D50C" : "var(--dark-navy)",
        backgroundColor: isPressed ? "white" : "white",
      }}
    >
      {isPressed ? (
        <>
          <iconify-icon icon="lucide:check" className="text-lg text-[#00D50C]" aria-hidden />
          <span>Email copied</span>
        </>
      ) : isHover ? (
        <span>Copy Email</span>
      ) : (
        <span>{CONTACT_EMAIL}</span>
      )}
    </button>
  );
}

export default function PortfolioPage() {
  const activeId = useActiveSectionId();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const uuWalletCarouselRef = useRef<HTMLDivElement | null>(null);
  const [heroStep, setHeroStep] = useState(0);

  const marqueeWords = useMemo(
    () =>
      [
        { word: "Innovative", icon: "star" as const },
        { word: "Strategic", icon: "flower" as const },
        { word: "Leadership", icon: "star" as const },
        { word: "Versatile", icon: "flower" as const },
        { word: "Systematic", icon: "star" as const },
      ] as const,
    [],
  );
  const marqueeItems = useMemo(() => [...marqueeWords, ...marqueeWords], [marqueeWords]);

  useEffect(() => {
    const root = carouselRef.current;
    if (!root) return;

    const slides = Array.from(root.querySelectorAll<HTMLElement>(".carousel-slide"));
    if (slides.length <= 1) return;

    let currentSlide = 0;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === 0));

    const id = window.setInterval(() => {
      slides[currentSlide]?.classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide]?.classList.add("active");
    }, 3000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const root = uuWalletCarouselRef.current;
    if (!root) return;

    const slides = Array.from(root.querySelectorAll<HTMLElement>(".carousel-slide"));
    if (slides.length <= 1) return;

    let currentSlide = 0;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === 0));

    const id = window.setInterval(() => {
      slides[currentSlide]?.classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide]?.classList.add("active");
    }, 3000);

    return () => window.clearInterval(id);
  }, []);

  // 基于时间的动画：用 requestAnimationFrame 驱动，避免 setInterval 被节流导致“看不到”
  const heroStepRef = useRef(0);
  useEffect(() => {
    const start = Date.now();
    let rafId: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const step = Math.floor(elapsed / HERO_STEP_MS) % HERO_RESET_AT;
      if (step !== heroStepRef.current) {
        heroStepRef.current = step;
        setHeroStep(step);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const scrollToId = (id: (typeof SECTION_IDS)[number]) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 20, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Figma: 1440×880, pt 120px, gap 40px；右上角 logo + 自我介绍 + 常用链接；核心文案绿色词打字效果 */}
      <section
        id="home"
        className="hero-clean flex min-h-[100dvh] w-full flex-col items-center gap-6 pt-8 text-center mobile-padding md:min-h-[880px] md:gap-10 md:pt-[58px]"
      >
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1440px] flex-col items-center px-4 md:min-h-0 md:gap-10">
          {/* 顶部：logo + Echo Xu 位置不变；第二行桌面端显示 */}
          <div className="flex w-full shrink-0 flex-col">
            <div className="flex items-center gap-2">
              <img
                src={LOGO_PATH}
                alt="Portfolio logo"
                className="h-8 w-auto md:h-9"
              />
              <span className="text-2xl font-bold text-[var(--dark-navy)] md:text-[24px]">
                Echo Xu
              </span>
            </div>
            <div className="mt-10 hidden w-full flex-col items-start gap-4 border-b border-[#E0E5F3] pb-4 md:flex md:flex-row md:flex-wrap md:items-center md:justify-between">
              <p className="text-base font-light text-[var(--dark-navy)]/90">
                A senior product designer with 10 years of experience
              </p>
              <div className="flex items-center gap-6 md:gap-8">
                <a
                  href="https://www.linkedin.com/in/luan-echo-753689278/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-light text-[var(--dark-navy)] hover:text-[#00D50C] hover:underline md:text-base"
                >
                  LinkedIn
                  <iconify-icon icon="lucide:arrow-up-right" className="text-base" />
                </a>
                <a
                  href="https://drive.google.com/file/d/1c2o7p0nSVQpqg3WWqIhBMRey4tHnfTN9/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-light text-[var(--dark-navy)] hover:text-[#00D50C] hover:underline md:text-base"
                >
                  Download CV
                  <iconify-icon icon="lucide:arrow-up-right" className="text-base" />
                </a>
              </div>
            </div>
          </div>

          {/* 核心文案：移动端一屏内居中；桌面端 940px 居中、距上 160px */}
          <div className="flex flex-1 flex-col items-center justify-center md:flex-initial md:justify-start">
            <h1 className="mx-auto w-full max-w-[940px] font-playfair text-[32px] font-bold leading-[1.5] tracking-tight text-[var(--dark-navy)] md:mt-[120px] md:text-[36px] lg:text-[48px]">
              <span className="block text-center">
                I design{" "}
                <span className="hero-green-word selection-navy italic text-[#00D50C]">
                  {"Scalable".slice(0, Math.min(8, heroStep))}
                </span>
                {" "}products with Highly{" "}
                <span className="hero-green-word selection-navy italic text-[#00D50C]">
                  {"crafted".slice(0, Math.max(0, Math.min(7, heroStep - 9)))}
                </span>
                {" "}UI and{" "}
                <span className="hero-green-word selection-navy italic text-[#00D50C]">
                  {"Delightful".slice(0, Math.max(0, Math.min(10, heroStep - 16)))}
                </span>
                {" "}Experiences
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Work Section - 与 hero/about/contact 一致的左右留白（padding 在内容容器上保证生效） */}
      <section id="work" className="bg-white py-12 md:py-16 lg:py-24">
        <div className="work-section-inner mx-auto w-full max-w-7xl px-4 sm:px-5 md:px-10">
          <h2 className="font-abril mb-8 text-4xl italic tracking-tight md:mb-12 md:text-5xl lg:mb-16">
            Selected works
          </h2>

          <div className="flex flex-col gap-12 md:gap-16 lg:gap-24">
            {/* Project 1 – 移动端轮播 / 桌面端双栏；配图与文字间距与 AISPEECH 完全一致 */}
            <div className="work-project-card group hover-lift">
              <div className="work-project-banner mx-auto flex w-full max-w-7xl shrink-0 flex-col gap-3 md:flex-row md:gap-4 lg:gap-5">
                {/* 移动端：轮播 */}
                <div
                  ref={uuWalletCarouselRef}
                  className="mx-auto flex w-full max-w-7xl md:hidden"
                >
                  <div
                    className="relative w-full aspect-[1440/1248] work-img-clip work-img-hover"
                    style={{ borderRadius: "32px", overflow: "hidden" }}
                  >
                    <div className="carousel-slide active">
                      <img
                        src={WORK_IMAGES.uuWallet1}
                        alt="UU Wallet 1"
                        className="work-img antialiased pointer-events-none size-full"
                        style={{ imageRendering: "-webkit-optimize-contrast" }}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="carousel-slide">
                      <img
                        src={WORK_IMAGES.uuWallet2}
                        alt="UU Wallet 2"
                        className="work-img antialiased pointer-events-none size-full"
                        style={{ imageRendering: "-webkit-optimize-contrast" }}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
                {/* 桌面端：左侧图片 */}
                <div className="relative hidden flex-[1_0_0] md:block work-image-container">
                  <div
                    className="aspect-[1440/1248] w-full work-img-clip work-img-hover"
                    style={{ borderRadius: "32px", overflow: "hidden" }}
                  >
                    <img
                      src={WORK_IMAGES.uuWallet1}
                      alt="UU Wallet 1"
                      className="work-img antialiased pointer-events-none size-full"
                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1024px) 50vw, 512px"
                    />
                  </div>
                </div>

                {/* 桌面端：右侧图片 */}
                <div className="relative hidden flex-[1_0_0] md:block work-image-container">
                  <div
                    className="aspect-[1440/1248] w-full work-img-clip work-img-hover"
                    style={{ borderRadius: "32px", overflow: "hidden" }}
                  >
                    <img
                      src={WORK_IMAGES.uuWallet2}
                      alt="UU Wallet 2"
                      className="work-img antialiased pointer-events-none size-full"
                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1024px) 50vw, 512px"
                    />
                  </div>
                </div>
              </div>

              <div className="work-project-text flex flex-col">
                <h3 className="text-xl font-medium text-[var(--dark-navy)] md:text-2xl">UU Wallet</h3>
                <p className="work-desc text-sm font-normal leading-relaxed text-gray-500 max-w-full">
                  Led the 0-to-1 Web3 wallet design (App/Web), establishing
                  standardized transaction systems that drove secure trading and
                  user growth.
                </p>
              </div>
            </div>

            {/* Project 2 – 全宽单图容器 + 轮播；配图与文字间距与 UU Wallet 完全一致 */}
            <div className="work-project-card group hover-lift">
              <div
                ref={carouselRef}
                className="work-project-banner mx-auto w-full max-w-7xl shrink-0"
              >
                <div className="relative w-full work-image-container aspect-[1280/610]">
                  {/* 与 UU Wallet 一致：单独裁剪层；随屏幕宽度等比例缩放 */}
                  <div
                    className="work-banner-cover absolute inset-0 work-img-clip work-img-hover"
                    style={{ borderRadius: "32px", overflow: "hidden" }}
                  >
                    <div className="carousel-slide active">
                    <img
                      src={WORK_IMAGES.aispeech1}
                      alt="AISPEECH 1"
                      className="work-img antialiased pointer-events-none size-full"
                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1280px) 100vw, 1280px"
                    />
                  </div>
                  <div className="carousel-slide">
                    <img
                      src={WORK_IMAGES.aispeech2}
                      alt="AISPEECH 2"
                      className="work-img antialiased pointer-events-none size-full"
                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1280px) 100vw, 1280px"
                    />
                  </div>
                  <div className="carousel-slide">
                    <img
                      src={WORK_IMAGES.aispeech3}
                      alt="AISPEECH 3"
                      className="work-img antialiased pointer-events-none size-full"
                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1280px) 100vw, 1280px"
                    />
                  </div>
                  </div>
                </div>
              </div>

              <div className="work-project-text flex flex-col">
                <h3 className="text-xl font-medium text-[var(--dark-navy)] md:text-2xl">AISPEECH</h3>
                <p className="work-desc text-sm font-normal leading-relaxed text-gray-500 max-w-full">
                  Led a design team to standardize design systems and AI
                  interactions, improving usability and commercialization
                  efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-[#F9FBFA] py-24 mobile-padding">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 md:grid-cols-2">
          <h2 className="font-abril text-5xl italic md:text-7xl">About</h2>
          <div className="flex flex-col gap-8 text-sm font-light leading-relaxed text-gray-700 md:text-base">
            <p>
              I&apos;m Echo Xu, a product designer with over 10 years of
              experience designing complex digital products across AI platforms,
              SaaS systems, and Web3 App.
            </p>
            <p>
              My work often sits at the intersection of UX strategy, design
              systems, and user growth, helping teams move from early concepts
              to products used at scale.
            </p>
            <p>
              Previously, I led a design team at AISPEECH, delivering 10+
              platform-level projects and bringing AI applications from 0—1
              into real enterprise service environments. More recently, I worked
              on Web3 wallet products, building a standardized transaction
              system and optimizing growth loops to improve the end-to-end user
              experience.
            </p>
            <p>
              I care deeply about craft and systems—how thoughtful UI, clear
              interaction models, and strong design foundations create products
              people trust and enjoy using.
            </p>

            <ul className="mt-4 flex flex-col gap-3 font-medium text-[var(--dark-navy)]">
              {[
                "Strategic thinker",
                "Insight-Driven",
                "Growth Focused",
                "Collaborative",
                "Design is in my DNA",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--dark-navy)]"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Marquee：高度 100px，字号 26px，一词一图（star/Flower 32px），整体向左连续滚动 */}
      <div className="marquee flex h-[100px] w-full items-center overflow-hidden bg-[#00D50C] text-white">
        <div className="marquee-content font-playfair flex shrink-0 items-center gap-6 text-[28px] font-extrabold italic">
          {marqueeItems.map((item, idx) => (
            <span key={`${item.word}-${idx}`} className="flex items-center gap-6">
              {item.word}
              <img
                src={item.icon === "star" ? "/work/star.svg" : "/work/Flower.svg"}
                alt=""
                className="h-7 w-7 shrink-0"
                width={28}
                height={28}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Experience (Dark) */}
      <section className="bg-[#050B04] py-24 text-white mobile-padding">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 md:grid-cols-2">
          <h2 className="selection-navy font-playfair text-5xl font-bold italic text-[#00D50C] md:text-7xl">
            Experience
          </h2>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
            {[
              {
                company: "UU Wallet",
                role: "Senior UX/UI Designer",
                date: "Apr 15, 2024 – Oct 24, 2025",
              },
              {
                company: "Yonyou",
                role: "UX/UI Designer",
                date: "Dec 30, 2017 – Aug 15, 2018",
              },
              {
                company: "AISPEECH",
                role: "Designer Leader",
                date: "Aug 15, 2018 – Dec 30, 2023",
              },
              {
                company: "Early Career",
                role: "Visual Designer",
                date: "2014-2017",
              },
            ].map((x) => (
              <div key={x.company} className="border-l border-gray-800 pl-6">
                <h4 className="font-abril mb-1 text-[28px] italic leading-tight">
                  {x.company}
                </h4>
                <p className="mb-2 text-[16px] font-normal text-gray-400">
                  {x.role}
                </p>
                <p className="text-[10px] text-gray-500">{x.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact：上下布局 — 上模块 logo+文案，下模块 参考 Home 的「A senior product designer…」行：邮箱占左、LinkedIn/CV 同行右对齐，样式与 Home 一致 */}
      <section id="contact" className="contact-section bg-white">
        <div className="contact-inner">
          <div className="contact-top">
            <img src="/work/about.webp" alt="" className="contact-logo" width={98} height={98} />
            <h2 className="contact-heading">
              Think we&apos;re a good fit?
              <br />
              <span className="contact-heading-accent">Get in touch with me !</span>
            </h2>
          </div>
          <div className="contact-bottom w-full flex flex-col items-start gap-10 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
            <ContactEmailButton />
            <div className="flex items-center gap-6 md:gap-8">
              <a
                href="https://www.linkedin.com/in/luan-echo-753689278/"
                target="_blank"
                rel="noopener noreferrer"
                id="contact-linkedin-link"
                className="inline-flex items-center gap-1.5 text-sm font-light text-[var(--dark-navy)] hover:text-[#00D50C] hover:underline md:text-base"
              >
                LinkedIn
                <iconify-icon icon="lucide:arrow-up-right" className="text-base" />
              </a>
              <a
                href="https://drive.google.com/file/d/1c2o7p0nSVQpqg3WWqIhBMRey4tHnfTN9/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                id="contact-download-cv-link"
                className="inline-flex items-center gap-1.5 text-sm font-light text-[var(--dark-navy)] hover:text-[#00D50C] hover:underline md:text-base"
              >
                Download CV
                <iconify-icon icon="lucide:arrow-up-right" className="text-base" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex h-12 min-h-12 items-center border-t border-gray-100 mobile-padding">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 text-[10px] font-medium uppercase tracking-widest text-gray-400 md:flex-row">
          <span>Luanluan Xu</span>
          <span>© 2025 All rights reserved.</span>
        </div>
      </footer>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-[40px] left-1/2 z-50 -translate-x-1/2">
        <nav className="hover-lift flex h-[72px] items-center gap-4 rounded-[24px] border border-white bg-[rgba(255,255,255,0.8)] p-[12px] shadow-[0_18px_45px_rgba(0,0,0,0.04)] backdrop-blur-[20px]">
          {SECTION_IDS.map((id) => {
            const label = id[0].toUpperCase() + id.slice(1);
            const isActive = activeId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollToId(id)}
                id={`nav-${id}-link`}
                className={[
                  "h-[48px] rounded-[16px] px-4 text-base font-normal transition-all duration-300 flex items-center justify-center",
                  "bg-transparent hover:text-[#00D50C]",
                  isActive
                    ? "bg-white text-[#00D50C] shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                    : "text-[var(--dark-navy)]",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

