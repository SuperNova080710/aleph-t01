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

export default function Home() {
  const [expandedStrength, setExpandedStrength] = useState<number | null>(null);

  return (
    <main>
      <section
        aria-labelledby="intro-heading"
        className="border-b border-slate-200 bg-slate-950 text-white"
      >
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-16 sm:px-8 lg:px-12">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Developer Profile
          </p>

          <h1
            id="intro-heading"
            className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            문제의 원인을 추적하고,
            <br />
            원리를 이해하며 해결합니다.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            개발 과정에서 발생하는 문제를 단순히 우회하기보다 원인을 확인하고,
            작업을 작은 단위로 나누어 관리하는 개발자입니다.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                주요 활동
              </p>
              <p className="mt-2 font-semibold text-white">
                Node.js / Next.js 풀스택 개발
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Nginx Reverse Proxy 구성과 Unreal Engine Digital Twin 프로젝트를
                포함한 개발 경험이 있습니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                공개 근거
              </p>
              <p className="mt-2 font-semibold text-white">
                공개 프로젝트와 관련 자료
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Blog-frontend, Blog-backend, Nginx-proxy 및 Digital Twin 관련
                공개 자료를 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#strengths"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              강점 살펴보기
            </a>
            <a
              href="#evidence"
              className="rounded-full border border-slate-500 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              공개 근거 보기
            </a>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="about-heading"
        className="bg-white px-6 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              About
            </p>
            <h2
              id="about-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
            >
              어떤 개발자인가
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              저는 문제의 증상만 해결하는 것보다 문제가 발생한 이유를 이해하는
              과정을 중요하게 생각합니다. 개발 작업은 작은 단위로 나누어
              관리하고, 각 변경 사항을 추적할 수 있는 형태로 남기는 것을
              선호합니다.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
            <p className="text-sm font-semibold text-slate-500">관심 분야</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                "Full-stack Web Development",
                "Node.js / Next.js",
                "Nginx / Reverse Proxy",
                "Unreal Engine / Digital Twin",
              ].map((interest) => (
                <li
                  key={interest}
                  className="rounded-2xl bg-white px-4 py-3 font-medium text-slate-800 shadow-sm ring-1 ring-slate-200"
                >
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="strengths"
        aria-labelledby="strengths-heading"
        className="bg-slate-50 px-6 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Strengths
          </p>
          <h2
            id="strengths-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            작업에서 중요하게 생각하는 것
          </h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {strengths.map((strength, index) => {
              const isExpanded = expandedStrength === index;

              return (
                <article
                  key={strength.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-500">
                    0{index + 1}
                  </p>

                  <h3 className="mt-4 text-xl font-bold leading-8 text-slate-950">
                    {strength.title}
                  </h3>

                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`strength-detail-${index}`}
                    onClick={() =>
                      setExpandedStrength(isExpanded ? null : index)
                    }
                    className="mt-6 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                  >
                    {isExpanded ? "상세 내용 닫기" : "상황과 결과 보기"}
                  </button>

                  {isExpanded && (
                    <div
                      id={`strength-detail-${index}`}
                      className="mt-6 space-y-5 border-t border-slate-200 pt-6"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-950">상황</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {strength.situation}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-950">행동</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {strength.action}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-950">결과</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {strength.result}
                        </p>
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
        aria-labelledby="experience-heading"
        className="bg-white px-6 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Experience
          </p>
          <h2
            id="experience-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            프로젝트 경험
          </h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.title}
                className="flex flex-col rounded-3xl border border-slate-200 p-6"
              >
                <h3 className="text-xl font-bold text-slate-950">
                  {project.title}
                </h3>

                <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                  {project.description}
                </p>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Evidence
                  </p>

                  {"href" in project.evidence ? (
                    <a
                      href={project.evidence.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    >
                      {project.evidence.label}
                      <span aria-hidden="true" className="ml-1">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <div className="mt-3 flex flex-col items-start gap-2">
                      {project.evidence.map((evidence) => (
                        <a
                          key={evidence.href}
                          href={evidence.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                        >
                          {evidence.label}
                          <span aria-hidden="true" className="ml-1">
                            ↗
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="evidence"
        aria-labelledby="evidence-heading"
        className="bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Public Evidence
          </p>
          <h2
            id="evidence-heading"
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            직접 확인할 수 있는 공개 근거
          </h2>

          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            소개 내용과 연결된 공개 자료와 프로젝트 저장소입니다. 별도의 로그인
            없이 공개된 자료를 확인할 수 있는 링크만 사용합니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
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
            ].map((evidence) => (
              <a
                key={evidence.href}
                href={evidence.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-slate-700 px-5 py-4 font-semibold text-white transition hover:border-slate-400 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                {evidence.label}
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 pb-10 text-sm text-slate-400 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl border-t border-slate-800 pt-6">
          T01 · 공개 자기소개 페이지
        </div>
      </footer>
    </main>
  );
}
