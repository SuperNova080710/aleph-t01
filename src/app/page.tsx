"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const strengths = [
  {
    title: "문제의 원인을 끝까지 추적합니다",
    situation:
      "Node.js와 Next.js를 활용한 풀스택 프로젝트에서 프론트엔드와 백엔드 사이의 문제를 확인해야 했습니다.",
    action:
      "단순히 증상을 우회하지 않고 요청과 응답의 흐름을 확인하면서 문제가 발생한 원인을 단계적으로 추적했습니다.",
    result:
      "원인을 확인한 뒤 필요한 부분을 수정하고 정상 동작을 확인했습니다.",
    evidence: {
      label: "관련 구현: Blog-frontend",
      href: "https://github.com/SuperNova080710/Blog-frontend",
    },
  },
  {
    title: "작업을 작은 단위로 나누어 관리합니다",
    situation:
      "여러 기능과 수정 사항이 함께 진행되는 프로젝트에서 변경 내용을 명확하게 구분할 필요가 있었습니다.",
    action:
      "GitHub Issue를 기준으로 작업 범위를 나누고 Commit과 Pull Request를 독립적인 작업 단위로 관리했습니다.",
    result:
      "각 작업의 목적과 변경 내용을 구분하여 프로젝트 진행 상황과 변경 이력을 확인할 수 있도록 했습니다.",
    evidence: {
      label: "Issue·PR 이력: Blog-frontend",
      href: "https://github.com/SuperNova080710/Blog-frontend/pulls",
    },
  },
  {
    title: "오류가 발생하면 원리부터 이해합니다",
    situation:
      "Nginx Reverse Proxy를 구성하면서 외부 요청이 내부 애플리케이션으로 전달되는 구조를 이해할 필요가 있었습니다.",
    action:
      "Nginx의 Reverse Proxy 역할과 요청 전달 구조를 확인하고 설정을 직접 구성했습니다.",
    result:
      "Reverse Proxy를 이용한 외부 요청과 내부 애플리케이션 사이의 요청 전달 구조를 구성했습니다.",
    evidence: {
      label: "관련 설정: Nginx-proxy",
      href: "https://github.com/SuperNova080710/Nginx-proxy",
    },
  },
];

const projects = [
  {
    title: "메타버스 Digital Twin",
    description:
      "Unreal Engine을 활용하여 메타버스 Digital Twin을 구현한 경험입니다.",
    evidence: {
      label: "관련 공개 자료",
      href: "http://journal.dcs.or.kr/xml/47684/47684.pdf",
    },
  },
  {
    title: "Node.js / Next.js 풀스택 개발",
    description:
      "Node.js와 Next.js를 활용하여 프론트엔드와 백엔드를 함께 개발하고 있습니다.",
    evidence: [
      {
        label: "Blog-frontend",
        href: "https://github.com/SuperNova080710/Blog-frontend",
      },
      {
        label: "Blog-backend",
        href: "https://github.com/SuperNova080710/Blog-backend",
      },
    ],
  },
  {
    title: "Nginx Reverse Proxy",
    description:
      "Nginx를 활용하여 Reverse Proxy를 구성하고 요청 전달 구조를 이해한 경험입니다.",
    evidence: {
      label: "Nginx-proxy",
      href: "https://github.com/SuperNova080710/Nginx-proxy",
    },
  },
];

const interests = [
  "Full-stack Web Development",
  "Node.js / Next.js",
  "Nginx / Reverse Proxy",
  "Unreal Engine / Digital Twin",
];

const evidenceLinks = [
  {
    label: "Digital Twin 자료",
    href: "http://journal.dcs.or.kr/xml/47684/47684.pdf",
  },
  {
    label: "Blog-backend",
    href: "https://github.com/SuperNova080710/Blog-backend",
  },
  {
    label: "Blog-frontend",
    href: "https://github.com/SuperNova080710/Blog-frontend",
  },
  {
    label: "Nginx-proxy",
    href: "https://github.com/SuperNova080710/Nginx-proxy",
  },
];

export default function Home() {
  const [expandedStrength, setExpandedStrength] = useState<number | null>(null);
  const readingProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progressBar = readingProgressRef.current;
    if (!progressBar) return;

    let animationFrame = 0;

    const updateProgress = () => {
      animationFrame = 0;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const fraction = maxScroll === 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / maxScroll));
      progressBar.style.transform = `scaleX(${fraction})`;
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    // Keep the gauge accurate while accordion height animates.
    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(scheduleUpdate)
      : null;
    resizeObserver?.observe(document.body);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Tab and Shift+Tab retain the browser's native focus order.
  // Arrow keys and Home/End provide optional navigation within the accordion.
  function handleStrengthKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    let nextIndex: number;
    switch (event.key) {
      case "ArrowDown":
        nextIndex = (index + 1) % strengths.length;
        break;
      case "ArrowUp":
        nextIndex = (index - 1 + strengths.length) % strengths.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = strengths.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const buttons = event.currentTarget
      .closest(".portfolio-strength-grid")
      ?.querySelectorAll<HTMLButtonElement>(".portfolio-strength-trigger");
    buttons?.[nextIndex]?.focus();
  }

  return (
    <main id="top" className="portfolio-page">
      <div ref={readingProgressRef} className="portfolio-reading-progress" aria-hidden="true" />
      <a className="portfolio-skip" href="#profile">본문 바로가기</a>

      <header className="portfolio-header">
        <div className="portfolio-container portfolio-nav">
          <a href="#top" className="portfolio-logo" aria-label="SuperNova 포트폴리오 처음으로">
            <span className="portfolio-logo-mark" aria-hidden="true">S<span>.</span></span>
            <span className="portfolio-logo-type">SUPERNOVA <small>DEVELOPER PORTFOLIO</small></span>
          </a>
          <nav aria-label="주요 메뉴">
            <a href="#profile">소개</a>
            <a href="#projects">프로젝트</a>
            <a href="#skills">기술</a>
            <a href="#strengths">강점</a>
          </nav>
          <a className="portfolio-nav-link" href="https://github.com/SuperNova080710" target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
            <span className="portfolio-sr-only"> (새 탭)</span>
          </a>
        </div>
      </header>

      <section className="portfolio-hero" aria-labelledby="hero-heading">
        <div className="portfolio-hero-glow" aria-hidden="true" />
        <div className="portfolio-container portfolio-hero-inner">
          <div className="portfolio-hero-copy">
            <span className="portfolio-kicker portfolio-kicker-light">
              <span className="portfolio-kicker-line" aria-hidden="true" />
              FULL-STACK DEVELOPER · PORTFOLIO
            </span>
            <h1 id="hero-heading">문제의 원인을 추적하고,<span>원리를 이해하며 해결합니다.</span></h1>
            <p>
              개발 과정에서 발생하는 문제를 단순히 우회하기보다 원인을 확인하고,
              작업을 작은 단위로 나누어 관리하는 개발자입니다.
            </p>
            <p className="portfolio-hero-audience">
              개발 경험과 문제 해결 과정을 확인하려는 채용 담당자와 협업 동료를 위한 공개 포트폴리오입니다.
            </p>
            <div className="portfolio-hero-activity">
              <span className="portfolio-hero-activity-label">대표 활동 · PROJECT</span>
              <strong>Node.js / Next.js 풀스택 웹 개발</strong>
              <span>프론트엔드·백엔드 구현과 GitHub Issue/PR 기반 변경 관리</span>
            </div>
            <div className="portfolio-hero-actions">
              <a className="portfolio-button portfolio-button-primary" href="#projects">
                프로젝트 살펴보기 <span aria-hidden="true">↗</span>
              </a>
              <a className="portfolio-button portfolio-button-glass" href="#profile">
                저에 대해 알아보기 <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="portfolio-hero-labels" aria-label="주요 기술">
              <span>Next.js</span><span>Node.js</span><span>Nginx</span><span>Unreal Engine</span>
            </div>
          </div>

          <div className="portfolio-hero-visual" aria-label="프론트엔드와 백엔드, 인프라 및 시각화 기술을 보여주는 그래픽">
            <div className="portfolio-orbit portfolio-orbit-one" aria-hidden="true" />
            <div className="portfolio-orbit portfolio-orbit-two" aria-hidden="true" />
            <div className="portfolio-editor">
              <div className="portfolio-editor-top">
                <span className="portfolio-editor-dots" aria-hidden="true"><i /><i /><i /></span>
                <span>developer.ts</span>
                <span>● ACTIVE</span>
              </div>
              <div className="portfolio-editor-body">
                <p><span className="portfolio-line-no">01</span><span className="portfolio-code-purple">const</span> developer = {"{"}</p>
                <p><span className="portfolio-line-no">02</span>  focus: <span className="portfolio-code-green">&quot;Root Cause&quot;</span>,</p>
                <p><span className="portfolio-line-no">03</span>  approach: [</p>
                <p><span className="portfolio-line-no">04</span>    <span className="portfolio-code-green">&quot;Understand&quot;</span>,</p>
                <p><span className="portfolio-line-no">05</span>    <span className="portfolio-code-green">&quot;Build&quot;</span>,</p>
                <p><span className="portfolio-line-no">06</span>    <span className="portfolio-code-green">&quot;Verify&quot;</span></p>
                <p><span className="portfolio-line-no">07</span>  ]</p>
                <p><span className="portfolio-line-no">08</span>{"};"}</p>
              </div>
              <div className="portfolio-editor-bottom"><span className="portfolio-led" /> DEVELOP · DEBUG · DOCUMENT <span>TSX / API</span></div>
            </div>
            <div className="portfolio-floating-tag portfolio-tag-one"><span aria-hidden="true">◇</span> Frontend <strong>Next.js</strong></div>
            <div className="portfolio-floating-tag portfolio-tag-two"><span aria-hidden="true">⌁</span> Backend <strong>Node.js</strong></div>
            <div className="portfolio-hero-proof">
              <div>
                <span>확인 가능한 공개 근거 · EVIDENCE</span>
                <strong>프로젝트 결과를 직접 확인하세요.</strong>
              </div>
              <div className="portfolio-hero-proof-links">
                <a href="https://github.com/SuperNova080710/Blog-frontend" target="_blank" rel="noopener noreferrer">
                  Blog-frontend <span aria-hidden="true">↗</span><span className="portfolio-sr-only"> (새 탭)</span>
                </a>
                <a href="https://github.com/SuperNova080710/Blog-backend" target="_blank" rel="noopener noreferrer">
                  Blog-backend <span aria-hidden="true">↗</span><span className="portfolio-sr-only"> (새 탭)</span>
                </a>
                <a href="http://journal.dcs.or.kr/xml/47684/47684.pdf" target="_blank" rel="noopener noreferrer">
                  Digital Twin 논문 <span aria-hidden="true">↗</span><span className="portfolio-sr-only"> (새 탭)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="portfolio-container portfolio-hero-bottom">
          <span><span aria-hidden="true">↙</span> SCROLL TO EXPLORE</span>
          <span>BUILDING WITH CURIOSITY &amp; STRUCTURE</span>
        </div>
      </section>

      <section id="profile" className="portfolio-section portfolio-intro" aria-labelledby="profile-heading">
        <div className="portfolio-container portfolio-intro-grid">
          <div className="portfolio-section-side">
            <span className="portfolio-section-index">01 / ABOUT ME</span>
            <div className="portfolio-section-rule" />
            <span className="portfolio-decor-square" aria-hidden="true" />
          </div>
          <div className="portfolio-intro-content">
            <span className="portfolio-kicker">WHO I AM</span>
            <h2 id="profile-heading">문제를 이해하는 과정까지,<br /><span>개발의 일부라고 생각합니다.</span></h2>
            <p>저는 문제의 증상만 해결하는 것보다 문제가 발생한 이유를 이해하는 과정을 중요하게 생각합니다. 개발 작업은 작은 단위로 나누어 관리하고, 각 변경 사항을 추적할 수 있는 형태로 남기는 것을 선호합니다.</p>
            <div className="portfolio-intro-points">
              <div><span aria-hidden="true">01</span><strong>원인 분석</strong><p>현상과 요청 흐름을 구분하고 문제의 근본 원인을 추적합니다.</p></div>
              <div><span aria-hidden="true">02</span><strong>체계적인 협업</strong><p>Issue, Commit, Pull Request로 변경 이력을 관리합니다.</p></div>
              <div><span aria-hidden="true">03</span><strong>원리 중심 학습</strong><p>구현 결과와 함께 작동하는 구조를 이해합니다.</p></div>
            </div>
            <div className="portfolio-public-scope" aria-label="공개 및 비공개 정보 범위">
              <div>
                <h3>공개하는 정보</h3>
                <ul>
                  <li>프로젝트 설명과 기술 스택</li>
                  <li>GitHub 공개 저장소와 개발 이력</li>
                  <li>공개된 논문 및 확인 가능한 결과</li>
                </ul>
              </div>
              <div>
                <h3>공개하지 않는 정보</h3>
                <ul>
                  <li>비공개 자료와 개인 식별 정보</li>
                  <li>개인 연락처 및 인증 계정 정보</li>
                  <li>Passkey 자격 증명과 세션·비밀값</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="portfolio-section portfolio-projects" aria-labelledby="projects-heading">
        <div className="portfolio-container">
          <div className="portfolio-section-heading">
            <div>
              <span className="portfolio-kicker">SELECTED WORK / 02</span>
              <h2 id="projects-heading">직접 만들고, <span>검증한 프로젝트</span></h2>
            </div>
            <p>기술을 적용한 경험과 실제 확인할 수 있는 공개 근거를 함께 정리했습니다.</p>
          </div>
          <div className="portfolio-project-grid">
            {[projects[1], projects[0], projects[2]].map((project, index) => (
              <article key={project.title} className={"portfolio-project-card portfolio-project-card-" + (index + 1)}>
                <div className="portfolio-card-top">
                  <span className="portfolio-card-number">0{index + 1} / PROJECT</span>
                  <span aria-hidden="true" className="portfolio-card-glyph">{index === 0 ? "</>" : index === 1 ? "◈" : "⌘"}</span>
                </div>
                <div className="portfolio-project-art" aria-hidden="true">
                  {index === 0 ? (
                    <div className="portfolio-art-stack"><span>CLIENT</span><span className="portfolio-art-connector" /><span>API</span><span className="portfolio-art-connector" /><span>DATABASE</span></div>
                  ) : index === 1 ? (
                    <div className="portfolio-art-orbit"><i /><i /><i /><strong>DT</strong></div>
                  ) : (
                    <div className="portfolio-art-network"><span>WEB</span><i /><span>PROXY</span><i /><span>APP</span></div>
                  )}
                </div>
                <div className="portfolio-card-content">
                  <span className="portfolio-card-category">{index === 0 ? "WEB / FULL-STACK" : index === 1 ? "UNREAL ENGINE / DIGITAL TWIN" : "INFRASTRUCTURE / REVERSE PROXY"}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="portfolio-card-tags">
                    {(index === 0 ? ["Node.js", "Next.js", "TypeScript"] : index === 1 ? ["Unreal Engine", "Digital Twin"] : ["Nginx", "Networking"]).map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <div className="portfolio-project-links" aria-label={project.title + " 관련 자료"}>
                    {(Array.isArray(project.evidence) ? project.evidence : [project.evidence]).map((item) => (
                      <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.label} <span aria-hidden="true">↗</span>
                        <span className="portfolio-sr-only"> (새 탭)</span>
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="portfolio-section portfolio-skills-section" aria-labelledby="skills-heading">
        <div className="portfolio-container portfolio-skills-layout">
          <div>
            <span className="portfolio-kicker portfolio-kicker-light">TECHNOLOGY / 03</span>
            <h2 id="skills-heading">기술은 도구이고,<br /><span>목표는 문제 해결입니다.</span></h2>
            <p>프로젝트에서 사용해 온 기술과 현재 관심 분야입니다.</p>
          </div>
          <ul className="portfolio-skill-list">
            {interests.map((interest, index) => (
              <li key={interest}><span className="portfolio-skill-index">0{index + 1}</span><span>{interest}</span><span aria-hidden="true">↗</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section id="strengths" className="portfolio-section portfolio-strengths-section" aria-labelledby="strengths-heading">
        <div className="portfolio-container">
          <div className="portfolio-section-heading">
            <div>
              <span className="portfolio-kicker">HOW I WORK / 04</span>
              <h2 id="strengths-heading">결과뿐 아니라 <span>과정도 중요합니다.</span></h2>
            </div>
            <p>각 강점을 선택하면 실제 경험의 상황, 행동, 결과를 확인할 수 있습니다.</p>
          </div>
          <p id="strengths-keyboard-help" className="portfolio-keyboard-hint">
            <span aria-hidden="true" className="portfolio-keyboard-symbol">⌨</span>
            <kbd>Tab</kbd>으로 선택, <kbd>Enter</kbd> 또는 <kbd>Space</kbd>로 펼치기 · <kbd>↑</kbd> / <kbd>↓</kbd>로 항목 이동
          </p>
          <div className="portfolio-strength-grid" role="group" aria-label="작업 방식과 강점" aria-describedby="strengths-keyboard-help">
            {strengths.map((strength, index) => {
              const isOpen = expandedStrength === index;
              return (
                <article className={"portfolio-strength-card" + (isOpen ? " is-open" : "")} key={strength.title}>
                  <button
                    id={"strength-trigger-" + index}
                    type="button"
                    className="portfolio-strength-trigger"
                    aria-expanded={isOpen}
                    aria-controls={"strength-detail-" + index}
                    onClick={() => setExpandedStrength(isOpen ? null : index)}
                    onKeyDown={(event) => handleStrengthKeyDown(event, index)}
                  >
                    <span className="portfolio-strength-num">0{index + 1}</span>
                    <span className="portfolio-strength-title">{strength.title}</span>
                    <span aria-hidden="true" className="portfolio-strength-toggle">+</span>
                  </button>
                  <div
                    id={"strength-detail-" + index}
                    role="region"
                    aria-labelledby={"strength-trigger-" + index}
                    className="portfolio-strength-detail"
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                  >
                    <div className="portfolio-strength-detail-inner">
                      <div className="portfolio-strength-detail-content">
                        <dl>
                          <div><dt>Situation</dt><dd>{strength.situation}</dd></div>
                          <div><dt>Action</dt><dd>{strength.action}</dd></div>
                          <div><dt>Result</dt><dd>{strength.result}</dd></div>
                        </dl>
                        <a
                          className="portfolio-strength-evidence"
                          href={strength.evidence.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          공개 근거 확인: {strength.evidence.label}
                          <span aria-hidden="true">↗</span>
                          <span className="portfolio-sr-only"> (새 탭)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="evidence" className="portfolio-section portfolio-evidence" aria-labelledby="evidence-heading">
        <div className="portfolio-container">
          <div className="portfolio-section-heading">
            <div><span className="portfolio-kicker">PROOF & SOURCES / 05</span><h2 id="evidence-heading">경험을 확인할 수 있는 <span>공개 자료</span></h2></div>
            <p>프로젝트 저장소와 자료 링크를 직접 확인할 수 있습니다.</p>
          </div>
          <div className="portfolio-evidence-grid">
            {evidenceLinks.map((link, index) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="portfolio-evidence-item">
                <span>0{index + 1}</span>
                <strong>{link.label}</strong>
                <span aria-hidden="true">↗</span>
                <span className="portfolio-sr-only"> (새 탭)</span>
              </a>
            ))}
          </div>
          <div className="portfolio-final-cta">
            <div><span className="portfolio-kicker">NEXT STEP</span><h3>더 많은 개발 기록은<br />GitHub에서 확인할 수 있습니다.</h3></div>
            <a href="https://github.com/SuperNova080710" target="_blank" rel="noopener noreferrer" className="portfolio-button portfolio-button-primary">
              GitHub 방문하기 <span aria-hidden="true">↗</span><span className="portfolio-sr-only"> (새 탭)</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="portfolio-footer">
        <div className="portfolio-container">
          <span className="portfolio-footer-logo">S<span>.</span> <small>DEVELOPER PORTFOLIO</small></span>
          <p>T01 · 공개 자기소개 페이지</p>
          <a href="#top">맨 위로 ↑</a>
        </div>
      </footer>
    </main>
  );
}
