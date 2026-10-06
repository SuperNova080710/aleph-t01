"use client";

import { useState } from "react";

const strengths = [
  {
    title: "문제의 원인을 끝까지 추적합니다",
    situation:
      "Node.js와 Next.js를 활용한 풀스택 프로젝트에서 프론트엔드와 백엔드 사이의 문제를 확인해야 했습니다.",
    action:
      "단순히 증상을 우회하지 않고 요청과 응답의 흐름을 확인하면서 문제가 발생한 원인을 단계적으로 추적했습니다.",
    result:
      "원인을 확인한 뒤 필요한 부분을 수정하고 정상 동작을 확인했습니다.",
  },
  {
    title: "작업을 작은 단위로 나누어 관리합니다",
    situation:
      "여러 기능과 수정 사항이 함께 진행되는 프로젝트에서 변경 내용을 명확하게 구분할 필요가 있었습니다.",
    action:
      "GitHub Issue를 기준으로 작업 범위를 나누고 Commit과 Pull Request를 독립적인 작업 단위로 관리했습니다.",
    result:
      "각 작업의 목적과 변경 내용을 구분하여 프로젝트 진행 상황과 변경 이력을 확인할 수 있도록 했습니다.",
  },
  {
    title: "오류가 발생하면 원리부터 이해합니다",
    situation:
      "Nginx Reverse Proxy를 구성하면서 외부 요청이 내부 애플리케이션으로 전달되는 구조를 이해할 필요가 있었습니다.",
    action:
      "Nginx의 Reverse Proxy 역할과 요청 전달 구조를 확인하고 설정을 직접 구성했습니다.",
    result:
      "Reverse Proxy를 이용한 외부 요청과 내부 애플리케이션 사이의 요청 전달 구조를 구성했습니다.",
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
  const [openStrength, setOpenStrength] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#DDD8CE] text-[#172033]">
      <header className="border-b border-[#C3BDB2] bg-[#ECE8E0]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <a
            href="#top"
            className="text-sm font-bold tracking-[0.2em] text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2 focus:ring-offset-[#ECE8E0]"
          >
            DEVELOPER PROFILE
          </a>

          <nav aria-label="주요 메뉴">
            <ul className="flex items-center gap-5 text-sm text-[#4F5868]">
              <li>
                <a
                  href="#profile"
                  className="transition-colors hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2 focus:ring-offset-[#ECE8E0]"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="transition-colors hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2 focus:ring-offset-[#ECE8E0]"
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="#strengths"
                  className="transition-colors hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2 focus:ring-offset-[#ECE8E0]"
                >
                  Strengths
                </a>
              </li>
              <li>
                <a
                  href="#evidence"
                  className="transition-colors hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2 focus:ring-offset-[#ECE8E0]"
                >
                  Evidence
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div id="top" />

      <section className="border-b border-[#C3BDB2] bg-[#ECE8E0]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#4F5868]">
              Developer Profile
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] text-[#172033] sm:text-5xl lg:text-5xl">
              문제의 원인을 추적하고,
              <br />
              원리를 이해하며 해결합니다.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#4F5868] sm:text-lg">
              개발 과정에서 발생하는 문제를 단순히 우회하기보다 원인을
              확인하고, 작업을 작은 단위로 나누어 관리하는 개발자입니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["# Node.js", "# Next.js", "# Nginx", "# Unreal Engine"].map(
                (technology) => (
                  <span
                    key={technology}
                    className="border border-[#C3BDB2] bg-[#E3D7B6] px-3 py-1.5 text-sm font-medium text-[#263B5E]"
                  >
                    {technology}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-5 self-end">
            <div className="border-l-2 border-[#263B5E] pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4F5868]">
                주요 활동
              </p>
              <p className="mt-3 text-sm leading-7 text-[#4F5868]">
                Node.js / Next.js 풀스택 개발, Nginx Reverse Proxy 구성과
                Unreal Engine Digital Twin 프로젝트를 포함한 개발 경험이
                있습니다.
              </p>
            </div>

            <div className="border-l-2 border-[#C3BDB2] pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4F5868]">
                공개 근거
              </p>
              <p className="mt-3 text-sm leading-7 text-[#4F5868]">
                실제 프로젝트 저장소와 Digital Twin 관련 공개 자료를
                연결하여 직접 확인할 수 있도록 구성했습니다.
              </p>
            </div>
          </div>
          
        </div>
      </section>

      <section
        id="profile"
        aria-labelledby="profile-heading"
        className="border-b border-[#C3BDB2] bg-[#DDD8CE]"
      >
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-20">
          <div>
            <p className="section-label">Profile</p>
            <h2 id="profile-heading" className="section-title">
              어떤 개발자인가
            </h2>
          </div>

          <div>
            <p className="max-w-3xl text-base leading-8 text-[#4F5868] sm:text-lg">
              저는 문제의 증상만 해결하는 것보다 문제가 발생한 이유를
              이해하는 과정을 중요하게 생각합니다. 개발 작업은 작은
              단위로 나누어 관리하고, 각 변경 사항을 추적할 수 있는
              형태로 남기는 것을 선호합니다.
            </p>

            <div className="mt-10 border-y border-[#C3BDB2]">
              <p className="border-b border-[#C3BDB2] py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#4F5868]">
                관심 분야
              </p>

              <ul className="divide-y divide-[#C3BDB2]">
                {interests.map((interest) => (
                  <li
                    key={interest}
                    className="py-4 text-base font-medium text-[#263B5E]"
                  >
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="experience"
        aria-labelledby="experience-heading"
        className="border-b border-[#C3BDB2] bg-[#ECE8E0]"
      >
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="section-label">Experience</p>
            <h2 id="experience-heading" className="section-title">
              프로젝트 경험
            </h2>
          </div>

          <div className="mt-10 border-y border-[#C3BDB2]">
            {projects.map((project, index) => (
              <article
                key={project.title}
                className="grid gap-5 border-b border-[#C3BDB2] py-7 last:border-b-0 lg:grid-cols-[5rem_1fr_auto] lg:items-start"
              >
                <p className="text-sm font-bold text-[#4F5868]">
                  0{index + 1}
                </p>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#172033]">
                    {project.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4F5868]">
                    {project.description}
                  </p>
                </div>

                <div className="lg:text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4F5868]">
                    Evidence
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3 lg:justify-end">
                    {Array.isArray(project.evidence) ? (
                      project.evidence.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-[#263B5E] underline decoration-[#C3BDB2] underline-offset-4 transition-colors hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2 focus:ring-offset-[#ECE8E0]"
                        >
                          {item.label}
                        </a>
                      ))
                    ) : (
                      <a
                        href={project.evidence.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-[#263B5E] underline decoration-[#C3BDB2] underline-offset-4 transition-colors hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2 focus:ring-offset-[#ECE8E0]"
                      >
                        {project.evidence.label}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="strengths"
        aria-labelledby="strengths-heading"
        className="border-b border-[#C3BDB2] bg-[#DDD8CE]"
      >
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="section-label">Strengths</p>
            <h2 id="strengths-heading" className="section-title">
              작업 방식과 강점
            </h2>
          </div>

          <div className="mt-10 border-y border-[#C3BDB2]">
            {strengths.map((strength, index) => {
              const isOpen = openStrength === index;

              return (
                <article
                  key={strength.title}
                  className="border-b border-[#C3BDB2] last:border-b-0"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`strength-detail-${index}`}
                    onClick={() =>
                      setOpenStrength(isOpen ? null : index)
                    }
                    className="grid w-full gap-4 py-6 text-left transition-colors hover:bg-[#D5D0C7] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#263B5E] lg:grid-cols-[5rem_1fr_auto] lg:items-center"
                  >
                    <span className="text-sm font-bold text-[#4F5868]">
                      0{index + 1}
                    </span>

                    <span className="text-lg font-bold tracking-tight text-[#172033] sm:text-xl">
                      {strength.title}
                    </span>

                    <span
                      aria-hidden="true"
                      className="text-xl font-light text-[#263B5E]"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`strength-detail-${index}`}
                      className="border-t border-[#C3BDB2] py-7 lg:ml-20"
                    >
                      <div className="grid gap-7 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4F5868]">
                            Situation
                          </p>
                          <p className="mt-3 text-sm leading-7 text-[#4F5868]">
                            {strength.situation}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4F5868]">
                            Action
                          </p>
                          <p className="mt-3 text-sm leading-7 text-[#4F5868]">
                            {strength.action}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4F5868]">
                            Result
                          </p>
                          <p className="mt-3 text-sm leading-7 text-[#4F5868]">
                            {strength.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="evidence"
        aria-labelledby="evidence-heading"
        className="border-b border-[#172033] bg-[#172033] text-[#ECE8E0]"
      >
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C3BDB2]">
              Evidence
            </p>

            <h2
              id="evidence-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-[#ECE8E0] sm:text-4xl"
            >
              직접 확인할 수 있는 공개 근거
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#C3BDB2] sm:text-base">
              페이지에서 설명한 프로젝트와 경험을 실제 공개 자료와
              저장소에서 확인할 수 있습니다.
            </p>
          </div>

          <div className="mt-10 grid border-y border-[#4F5868] md:grid-cols-2">
            {evidenceLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group border-b border-[#4F5868] p-6 transition-colors hover:bg-[#263B5E] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#ECE8E0] md:nth-[2n]:border-l md:nth-last-[1]:border-b-0 md:nth-last-[2]:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-bold text-[#4F5868]">
                    0{index + 1}
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-lg text-[#C3BDB2] transition-transform group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </div>

                <p className="mt-10 text-lg font-bold text-[#ECE8E0]">
                  {link.label}
                </p>

                <p className="mt-2 break-all text-xs leading-6 text-[#C3BDB2]">
                  {link.href}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#172033] text-[#4F5868]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>T01 · 공개 자기소개 페이지</p>
          <p>Developer Profile</p>
        </div>
      </footer>
    </main>
  );
}
