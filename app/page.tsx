"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ResumeLink = {
  label: string;
  url: string;
};

type ResumeContact = {
  text: string;
  url?: string;
};

type ResumeEmployment = {
  company: string;
  title: string;
  date: string;
  description: string;
};

type ResumeProject = {
  name: string;
  links: ResumeLink[];
  description: string;
  bullets: string[];
};

type ResumeSkill = {
  title: string;
  value: string;
};

type ResumeEducation = {
  degree: string;
  school: string;
  date: string;
};

type ResumeStrength = {
  title: string;
  description: string;
};

type ResumeDocData = {
  name: string;
  title: string;
  contacts: ResumeContact[];
  summary: string;
  currentEmployment: ResumeEmployment;
  projects: ResumeProject[];
  skills: ResumeSkill[];
  education: ResumeEducation[];
  strengths: ResumeStrength[];
};

type DocxParagraphChild = import("docx").ParagraphChild;
type DocxRunOptions = import("docx").IRunOptions;

const normalizeText = (value: string | null | undefined) =>
  value?.replace(/\s+/g, " ").trim() ?? "";

const formatDocUrl = (href: string) => {
  if (!href) {
    return "";
  }

  try {
    const url = new URL(href, "https://example.com");

    if (!/^https?:$/.test(url.protocol)) {
      return href;
    }

    const path = url.pathname === "/" ? "" : url.pathname;
    return `${url.hostname}${path}${url.search}`;
  } catch {
    return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
};

const getSectionByTitle = (root: ParentNode, title: string) =>
  (
    Array.from(root.querySelectorAll<HTMLElement>(".section-container")).find(
      (section) =>
        normalizeText(section.querySelector(".section-title")?.textContent) ===
        title,
    ) ?? null
  );

const getDirectChildrenByClass = (
  parent: Element | null,
  className: string,
): HTMLElement[] => {
  if (!parent) {
    return [];
  }

  return Array.from(parent.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.classList.contains(className),
  );
};

const extractResumeDocData = (
  resumeElement: HTMLDivElement,
): ResumeDocData | null => {
  const name = normalizeText(
    resumeElement.querySelector(".name-field")?.textContent,
  );
  const title = normalizeText(
    resumeElement.querySelector(".title-field")?.textContent,
  );

  const contacts = Array.from(
    resumeElement.querySelectorAll<HTMLElement>(
      ".contact-info-single-line .contact-item",
    ),
  )
    .map((item): ResumeContact | null => {
      const anchor = item.querySelector<HTMLAnchorElement>("a");

      if (anchor) {
        const href = anchor.href || anchor.getAttribute("href") || "";

        if (!href) {
          return null;
        }

        return {
          text: formatDocUrl(href),
          url: href,
        };
      }

      const text = normalizeText(
        item.querySelector(".contact-text")?.textContent ?? item.textContent,
      );

      if (!text) {
        return null;
      }

      if (text.includes("@")) {
        return {
          text,
          url: `mailto:${text}`,
        };
      }

      const digits = text.replace(/[^\d+]/g, "");

      if (/^\+?\d{10,}$/.test(digits)) {
        return {
          text,
          url: `tel:${digits}`,
        };
      }

      return { text };
    })
    .filter((item): item is ResumeContact => item !== null);

  const summarySection = getSectionByTitle(resumeElement, "Summary");
  const currentEmploymentSection = getSectionByTitle(
    resumeElement,
    "Current Employment",
  );
  const projectsSection = getSectionByTitle(resumeElement, "Projects");
  const skillsSection = getSectionByTitle(resumeElement, "Technical Skills");
  const educationSection = getSectionByTitle(resumeElement, "Education");
  const strengthsSection = getSectionByTitle(resumeElement, "Strengths");

  const summary = normalizeText(
    summarySection?.querySelector(".summary-text")?.textContent,
  );

  const currentEmploymentItem =
    currentEmploymentSection?.querySelector<HTMLElement>(".resume-item") ?? null;

  const currentEmployment = currentEmploymentItem
    ? {
        company: normalizeText(
          currentEmploymentItem.querySelector(".company-name")?.textContent,
        ),
        title: normalizeText(
          currentEmploymentItem.querySelector(".job-title")?.textContent,
        ),
        date: normalizeText(
          currentEmploymentItem.querySelector(".job-date")?.textContent,
        ),
        description: normalizeText(
          currentEmploymentItem.querySelector(".job-description")?.textContent,
        ),
      }
    : null;

  const projects = getDirectChildrenByClass(
    projectsSection?.querySelector(".section-content") ?? null,
    "resume-item",
  ).map((item) => ({
    name: normalizeText(item.querySelector(".company-name")?.textContent),
    links: Array.from(
      item.querySelectorAll<HTMLAnchorElement>(
        ".project-link-inline a, .project-links-inline a",
      ),
    )
      .map((link) => ({
        label: normalizeText(link.textContent) || formatDocUrl(link.href),
        url: link.href || link.getAttribute("href") || "",
      }))
      .filter((link) => link.url),
    description: normalizeText(item.querySelector(".job-description")?.textContent),
    bullets: Array.from(item.querySelectorAll<HTMLElement>(".bullet-item"))
      .map((bulletItem) =>
        normalizeText(
          bulletItem.lastElementChild?.textContent ?? bulletItem.textContent,
        ),
      )
      .filter(Boolean),
  }));

  const skills = getDirectChildrenByClass(
    skillsSection?.querySelector(".section-content") ?? null,
    "skills-item",
  ).map((item) => ({
    title: normalizeText(item.querySelector(".skill-category-title")?.textContent),
    value: normalizeText(item.querySelector(".skill-list")?.textContent),
  }));

  const education = getDirectChildrenByClass(
    educationSection?.querySelector(".section-content") ?? null,
    "education-item",
  ).map((item) => ({
    degree: normalizeText(item.querySelector(".education-degree")?.textContent),
    school: normalizeText(item.querySelector(".education-school")?.textContent),
    date: normalizeText(item.querySelector(".education-date")?.textContent),
  }));

  const strengths = getDirectChildrenByClass(
    strengthsSection?.querySelector(".section-content") ?? null,
    "strength-item",
  ).map((item) => ({
    title: normalizeText(item.querySelector(".strength-title")?.textContent),
    description: normalizeText(
      item.querySelector(".strength-description")?.textContent,
    ),
  }));

  if (
    !name ||
    !title ||
    !summary ||
    !currentEmployment ||
    !currentEmployment.company ||
    projects.length === 0
  ) {
    return null;
  }

  return {
    name,
    title,
    contacts,
    summary,
    currentEmployment,
    projects,
    skills,
    education,
    strengths,
  };
};

const createDocxBlob = async (resumeData: ResumeDocData) => {
  const docx = await import("docx");
  const {
    AlignmentType,
    BorderStyle,
    Document,
    ExternalHyperlink,
    Packer,
    Paragraph,
    TextRun,
    UnderlineType,
  } = docx;

  const pageWidth = 11906;
  const pageHeight = 16838;
  const pageMargin = 300;
  const linkColor = "0563C1";
  const bodySize = 14;
  const metaSize = 13;
  const sectionTitleSize = 16;

  const createRun = (text: string, options: DocxRunOptions = {}) =>
    new TextRun({
      text,
      font: "Arial",
      ...options,
    });

  const createLinkChild = (
    text: string,
    url: string,
    size = 15,
  ): DocxParagraphChild =>
    new ExternalHyperlink({
      link: url,
      children: [
        createRun(text, {
          size,
          color: linkColor,
          underline: { type: UnderlineType.SINGLE, color: linkColor },
        }),
      ],
    });

  const createSectionTitle = (text: string) =>
    new Paragraph({
      keepNext: true,
      spacing: { before: 18, after: 10 },
      border: {
        bottom: {
          color: "000000",
          style: BorderStyle.SINGLE,
          size: 4,
          space: 1,
        },
      },
      children: [
        createRun(text.toUpperCase(), {
          bold: true,
          size: sectionTitleSize,
        }),
      ],
    });

  const createTextParagraph = (text: string, size = bodySize) =>
    new Paragraph({
      keepLines: true,
      spacing: { after: 8, line: 185 },
      children: [
        createRun(text, {
          size,
        }),
      ],
    });

  const createBulletParagraph = (text: string) =>
    new Paragraph({
      bullet: { level: 0 },
      keepLines: true,
      indent: {
        left: 240,
        hanging: 120,
      },
      spacing: { after: 4, line: 185 },
      children: [
        createRun(text, {
          size: bodySize,
        }),
      ],
    });

  const createCompactParagraph = (
    children: DocxParagraphChild[],
    spacingAfter = 10,
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType],
  ) =>
    new Paragraph({
      keepLines: true,
      spacing: { after: spacingAfter, line: 180 },
      ...(alignment ? { alignment } : {}),
      children,
    });

  const isPhoneOrEmail = (contact: ResumeContact) =>
    !!contact.url &&
    (contact.url.startsWith("tel:") || contact.url.startsWith("mailto:"));

  const contactInfo = resumeData.contacts.filter(isPhoneOrEmail);
  const locationInfo = resumeData.contacts.filter((contact) => !contact.url);
  const profileLinks = resumeData.contacts.filter(
    (contact) => contact.url && !isPhoneOrEmail(contact),
  );

  const getProfileLabel = (url: string) => {
    if (url.includes("linkedin.com")) {
      return "LinkedIn";
    }

    if (url.includes("github.com")) {
      return "GitHub";
    }

    return "Portfolio";
  };

  const contactChildren: DocxParagraphChild[] = [];
  [...contactInfo, ...locationInfo].forEach((contact, index) => {
    if (index > 0) {
      contactChildren.push(
        createRun(" | ", {
          size: metaSize,
        }),
      );
    }

    if (contact.url) {
      contactChildren.push(createLinkChild(contact.text, contact.url, metaSize));
    } else {
      contactChildren.push(
        createRun(contact.text, {
          size: metaSize,
        }),
      );
    }
  });

  const profileLinkChildren: DocxParagraphChild[] = [];
  profileLinks.forEach((contact, index) => {
    if (!contact.url) {
      return;
    }

    if (index > 0) {
      profileLinkChildren.push(
        createRun(" | ", {
          size: metaSize,
        }),
      );
    }

    profileLinkChildren.push(
      createRun(`${getProfileLabel(contact.url)}: `, {
        bold: true,
        size: metaSize,
      }),
    );
    profileLinkChildren.push(
      createLinkChild(formatDocUrl(contact.url), contact.url, metaSize),
    );
  });

  const docChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 3 },
      children: [
        createRun(resumeData.name, {
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 6 },
      children: [
        createRun(resumeData.title, {
          size: 16,
          color: "555555",
        }),
      ],
    }),
    createCompactParagraph(contactChildren, 6, AlignmentType.CENTER),
    ...(profileLinkChildren.length > 0
      ? [createCompactParagraph(profileLinkChildren, 10, AlignmentType.CENTER)]
      : []),
    createSectionTitle("Summary"),
    createTextParagraph(resumeData.summary),
    createSectionTitle("Current Employment"),
    createCompactParagraph(
      [
        createRun(resumeData.currentEmployment.company, {
          bold: true,
          size: bodySize,
        }),
      ],
      3,
    ),
    createCompactParagraph(
      [
        createRun(resumeData.currentEmployment.title, {
          bold: true,
          size: bodySize,
        }),
        createRun(" | ", { size: metaSize }),
        createRun(resumeData.currentEmployment.date, {
          size: metaSize,
          color: "666666",
        }),
      ],
      6,
    ),
    createTextParagraph(resumeData.currentEmployment.description),
    createSectionTitle("Projects"),
  ];

  resumeData.projects.forEach((project) => {
    docChildren.push(
      createCompactParagraph(
        [
          createRun(project.name, {
            bold: true,
            size: bodySize,
          }),
        ],
        3,
      ),
    );

    if (project.links.length > 0) {
      const projectLinkChildren: DocxParagraphChild[] = [];

      project.links.forEach((link, index) => {
        if (index > 0) {
          projectLinkChildren.push(
            createRun(" | ", {
              size: metaSize,
            }),
          );
        }

        projectLinkChildren.push(
          createRun(`${link.label}: `, {
            bold: true,
            size: metaSize,
          }),
        );
        projectLinkChildren.push(
          createLinkChild(formatDocUrl(link.url), link.url, metaSize),
        );
      });

      docChildren.push(createCompactParagraph(projectLinkChildren, 5));
    }

    if (project.description) {
      docChildren.push(createTextParagraph(project.description));
    }

    project.bullets.forEach((bullet) => {
      docChildren.push(createBulletParagraph(bullet));
    });
  });

  docChildren.push(createSectionTitle("Technical Skills"));

  resumeData.skills.forEach((skill) => {
    docChildren.push(
      createCompactParagraph(
        [
          createRun(`${skill.title}: `, {
            bold: true,
            size: bodySize,
          }),
          createRun(skill.value, {
            size: bodySize,
          }),
        ],
        5,
      ),
    );
  });

  docChildren.push(createSectionTitle("Education"));

  resumeData.education.forEach((item) => {
    docChildren.push(
      createCompactParagraph(
        [
          createRun(item.degree, {
            bold: true,
            size: bodySize,
          }),
          createRun(" | ", { size: metaSize }),
          createRun(item.school, {
            size: bodySize,
          }),
          createRun(" | ", { size: metaSize }),
          createRun(item.date, {
            size: metaSize,
            color: "666666",
          }),
        ],
        5,
      ),
    );
  });

  docChildren.push(createSectionTitle("Strengths"));

  resumeData.strengths.forEach((strength) => {
    docChildren.push(
      createCompactParagraph(
        [
          createRun(`${strength.title}: `, {
            bold: true,
            size: bodySize,
          }),
          createRun(strength.description, {
            size: bodySize,
          }),
        ],
        5,
      ),
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageWidth,
              height: pageHeight,
            },
            margin: {
              top: pageMargin,
              right: pageMargin,
              bottom: pageMargin,
              left: pageMargin,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return Packer.toBlob(doc);
};

export default function Home() {
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [activeDownload, setActiveDownload] = useState<"pdf" | "docx" | null>(
    null,
  );
  const resumeRef = useRef<HTMLDivElement>(null);
  const fileBaseName = "aman-kanojiya-resume";

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 320) {
        setShowMobilePopup(true);
      }
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const waitForFonts = async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  };

  const downloadBlob = (filename: string, blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    if (typeof link.download === "string") {
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const handlePdfDownload = async () => {
    if (activeDownload) {
      return;
    }

    setActiveDownload("pdf");

    try {
      await waitForFonts();

      const [{ pdf }, { default: ResumePdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./resume-pdf-document"),
      ]);
      const photoSrc = new URL(
        "/aman-profile.jpg",
        window.location.origin,
      ).toString();
      const blob = await pdf(
        <ResumePdfDocument photoSrc={photoSrc} />,
      ).toBlob();

      downloadBlob(`${fileBaseName}.pdf`, blob);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setActiveDownload(null);
    }
  };

  const handleDocDownload = async () => {
    if (activeDownload) {
      return;
    }

    setActiveDownload("docx");

    try {
      await waitForFonts();

      const resumeElement = resumeRef.current;

      if (!resumeElement) {
        return;
      }

      const resumeData = extractResumeDocData(resumeElement);

      if (!resumeData) {
        return;
      }

      const blob = await createDocxBlob(resumeData);

      downloadBlob(`${fileBaseName}.docx`, blob);
    } catch (error) {
      console.error("Failed to download DOCX:", error);
    } finally {
      setActiveDownload(null);
    }
  };

  return (
    <div className="resume-page-wrapper ">
      {/* Download Buttons */}
      <div className="download-button-container">
        <button
          onClick={handlePdfDownload}
          className="download-btn"
          disabled={activeDownload !== null}
        >
          {activeDownload === "pdf" ? "Generating PDF..." : "Download PDF"}
        </button>
        <button
          onClick={handleDocDownload}
          className="download-btn docx-btn"
          disabled={activeDownload !== null}
        >
          {activeDownload === "docx" ? "Generating DOCX..." : "Download DOCX"}
        </button>
      </div>

      {false && (
        <div className="download-button-container">
          <button
            onClick={() => {
              // Store original title
              const originalTitle = document.title;

              // Remove title temporarily
              document.title = "";

              // Hide scrollbars before printing
              document.body.style.overflow = "hidden";
              document.documentElement.style.overflow = "hidden";

              // Add meta tags to prevent headers/footers
              const metaNoHeader = document.createElement("meta");
              metaNoHeader.name = "print-no-header";
              metaNoHeader.content = "true";
              document.head.appendChild(metaNoHeader);

              const metaNoFooter = document.createElement("meta");
              metaNoFooter.name = "print-no-footer";
              metaNoFooter.content = "true";
              document.head.appendChild(metaNoFooter);

              // Try to open print dialog with custom settings
              try {
                window.print();
              } catch {
                // Fallback to regular print
                window.print();
              }

              // Restore everything after printing
              setTimeout(() => {
                document.title = originalTitle;
                document.body.style.overflow = "auto";
                document.documentElement.style.overflow = "auto";

                // Remove meta tags
                if (metaNoHeader.parentNode) {
                  metaNoHeader.parentNode.removeChild(metaNoHeader);
                }
                if (metaNoFooter.parentNode) {
                  metaNoFooter.parentNode.removeChild(metaNoFooter);
                }
              }, 100);
            }}
            className="download-btn"
          >
            📄 Download PDF
          </button>
        </div>
      )}

      {/* Mobile Popup */}
      {showMobilePopup && (
        <div className="mobile-popup-overlay">
          <div className="mobile-popup">
            <div className="mobile-popup-content">
              <h3>Better Experience Available!</h3>
              <p>
                This resume is optimized for desktop viewing.
                <br /> On mobile, please enable desktop mode in your browser
                for the best experience.
              </p>
              <div className="mobile-popup-buttons">
                <button
                  onClick={() => setShowMobilePopup(false)}
                  className="mobile-popup-btn view-anyway-btn"
                >
                  View Anyway
                </button>
                <button
                  onClick={() => {
                    handlePdfDownload();
                    setShowMobilePopup(false);
                  }}
                  className="mobile-popup-btn download-btn-mobile"
                  disabled={activeDownload !== null}
                >
                  {activeDownload === "pdf"
                    ? "Generating PDF..."
                    : "Download PDF"}
                </button>
                <button
                  onClick={() => {
                    handleDocDownload();
                    setShowMobilePopup(false);
                  }}
                  className="mobile-popup-btn download-btn-mobile docx-btn"
                  disabled={activeDownload !== null}
                >
                  {activeDownload === "docx"
                    ? "Generating DOCX..."
                    : "Download DOCX"}
                </button>
                {false && (
                  <button
                    onClick={() => {
                      // Store original title
                      const originalTitle = document.title;
                      document.title = "";
                      document.body.style.overflow = "hidden";
                      document.documentElement.style.overflow = "hidden";

                      const metaNoHeader = document.createElement("meta");
                      metaNoHeader.name = "print-no-header";
                      metaNoHeader.content = "true";
                      document.head.appendChild(metaNoHeader);

                      const metaNoFooter = document.createElement("meta");
                      metaNoFooter.name = "print-no-footer";
                      metaNoFooter.content = "true";
                      document.head.appendChild(metaNoFooter);

                      try {
                        window.print();
                      } catch {
                        window.print();
                      }

                      setTimeout(() => {
                        document.title = originalTitle;
                        document.body.style.overflow = "auto";
                        document.documentElement.style.overflow = "auto";
                        if (metaNoHeader.parentNode) {
                          metaNoHeader.parentNode.removeChild(metaNoHeader);
                        }
                        if (metaNoFooter.parentNode) {
                          metaNoFooter.parentNode.removeChild(metaNoFooter);
                        }
                      }, 100);

                      setShowMobilePopup(false);
                    }}
                    className="mobile-popup-btn download-btn-mobile"
                  >
                    📄 Download PDF
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowMobilePopup(false)}
                className="mobile-popup-close"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={resumeRef}
        className="max-w-5xl mx-auto bg-white resume-container"
      >
        {/* Header Section */}
        <div className="resume-header">
          <div className="resume-header-left">
            <div className="name-field">Aman Kanojiya</div>
            <div className="title-field">Full-Stack Web Developer</div>

            <div className="contact-info-single-line">
              <div className="contact-item">
                <svg
                  className="contact-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
                <span className="contact-text">8799791143</span>
              </div>
              <div className="contact-item">
                <svg
                  className="contact-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span className="contact-text">amankanojiya.dev@gmail.com</span>
              </div>
              <div className="contact-item">
                <svg
                  className="contact-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <a
                  href="http://www.linkedin.com/in/Amankanojiya27"
                  className="contact-link contact-text"
                  title="LinkedIn Profile"
                >
                  linkedin
                </a>
              </div>
              <div className="contact-item">
                <svg
                  className="contact-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <a
                  href="https://github.com/Amankanojiya27"
                  className="contact-link contact-text"
                  title="GitHub Profile"
                >
                  github
                </a>
              </div>
              <div className="contact-item">
                <svg
                  className="contact-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <a
                  href="https://amankanojiya27.vercel.app/"
                  className="contact-link contact-text"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Portfolio Website"
                >
                  Portfolio
                </a>
              </div>
              <div className="contact-item">
                <svg
                  className="contact-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="contact-text">Saket, Delhi, India</span>
              </div>
            </div>
          </div>

          <div className="photo-container">
            <Image
              src="/aman-profile.jpg"
              alt="Aman Kanojiya"
              width={110}
              height={110}
              className="profile-image"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="resume-columns">
          {/* Left Column */}
          <div>
            {/* Summary Section */}
            <div className="section-container">
              <div className="section-header">
                <div className="section-title">Summary</div>
              </div>
              <div className="summary-text">
                Full-stack developer who turns business workflows into web
                products people can actually use. I build React and Next.js
                frontends with Node.js, Express, MongoDB, and TypeScript
                backends for operations platforms, Shopify storefronts, and AI
                products, with a strong focus on APIs, auth, dashboards,
                integrations, documents, and reducing manual work for clients.
              </div>
            </div>

            {/* Current Employment Section */}
            <div className="section-container">
              <div className="section-header">
                <div className="section-title">Current Employment</div>
              </div>
              <div className="section-content">
                <div className="resume-item">
                  <div className="company-name">
                    Asha Tech (Asha Learnology)
                  </div>
                  <div className="job-title">
                    Full-Stack Developer - Full Time
                  </div>
                  <div className="job-date">March 2025 - Present</div>
                  <div className="job-description">
                    Successfully completed 6-month internship and transitioned
                    to full-time Full-Stack Developer.
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="section-container">
              <div className="section-header">
                <div className="section-title">Projects</div>
              </div>
              <div className="section-content">
                <div className="resume-item">
                  <div className="company-name-with-link">
                    <div className="company-name">
                      TGES Travel Operations Platform
                    </div>
                    <div className="project-links-inline">
                      <a
                        href="https://vendor.tgestravel.com/login"
                        className="contact-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Vendor Portal"
                      >
                        Vendor Panel
                      </a>
                      <a
                        href="https://admin.tgestravel.com/login"
                        className="contact-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Admin Portal"
                      >
                        Admin Panel
                      </a>
                    </div>
                  </div>
                  <div className="job-description">
                    Built a travel operations platform that helps the client
                    manage vendors, bookings, quotations, rate cards, invoices,
                    duty slips, notifications, and review flows in one place.
                  </div>
                  <ul className="bullet-list">
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built Express and MongoDB APIs for vendor login and
                        profile flows, bookings, quotations, invoices, duty
                        slips, cab rates, notifications, and WhatsApp messaging,
                        so the main business workflows run from one backend
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built vendor-panel screens for booking requests, MIS
                        tables with filters and Excel export, profile and
                        document handling, rate cards, agreements, invoices, and
                        duty slips, so vendors can complete work without
                        depending on the ops team for every step
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built admin tools for booking handling, quotation
                        sending, vendor assignment, vendor filtering and status
                        control, invoice review, duty-slip downloads, and
                        rate-card search, giving the client better control over
                        daily operations
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Added Socket.IO notifications plus PDF and file handling
                        for invoices, documents, and slips, helping teams spend
                        less time on manual coordination
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="item-separator"></div>

                <div className="resume-item">
                  <div className="company-name-with-link">
                    <div className="company-name">
                      So Whot Shopify Storefront
                    </div>
                    <div className="project-link-inline">
                      <a
                        href="https://sowhot.in"
                        className="contact-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Visit So Whot Website"
                      >
                        Storefront
                      </a>
                    </div>
                  </div>
                  <div className="job-description">
                    Built a headless Shopify storefront so the client could
                    control the shopping experience beyond a standard Shopify
                    theme, especially around discovery, reviews, cart flows, and
                    checkout behavior.
                  </div>
                  <ul className="bullet-list">
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built home, collection, search, cart, and product pages
                        with Shopify Storefront data, filters, sorting,
                        pagination, and lazy-loaded sections
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built product pages with size and color selection,
                        add-to-cart actions, reviews, and optional review image
                        uploads stored through Shopify metafields, helping
                        customers make better buying decisions
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built server routes for Shopify checkout links and
                        private-access-gated Razorpay buy-now flows, giving the
                        client more control over checkout and payment handling
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Added cookie and HMAC based access checks for protected
                        review and operational actions inside the storefront, so
                        sensitive actions stay limited to approved sessions
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="item-separator"></div>

                <div className="resume-item">
                  <div className="company-name-with-link">
                    <div className="company-name">LoviqueAiBot</div>
                    <div className="project-link-inline">
                      <a
                        href="https://lovique-ai-bot.vercel.app/"
                        className="contact-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Visit LoviqueAiBot"
                      >
                        Live App
                      </a>
                    </div>
                  </div>
                  <div className="job-description">
                    Built an AI chat product that gives users a more personal
                    and continuous experience through saved sessions, memories,
                    companion settings, and synced frontend/backend state.
                  </div>
                  <ul className="bullet-list">
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built the Next.js frontend for login, dashboard,
                        settings, and chat workspace, giving users a dedicated
                        place to manage and continue conversations
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built Express account flows for sign-up, login, logout,
                        password reset, preferences, and memory handling, so
                        users can securely manage their accounts
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built Gemini-powered chat services with saved chat
                        history, session management, custom companion prompts,
                        and memories stored in MongoDB, making replies feel more
                        consistent and personal
                      </span>
                    </li>
                    <li className="bullet-item">
                      <span className="bullet-dot">-</span>
                      <span>
                        Built protected chat and auth APIs for replies, chat
                        history, session summaries, memories, and companion
                        settings, supporting a more tailored user experience
                      </span>
                    </li>
                  </ul>
                </div>

                {false && (
                  <>
                    {/* Job 1 */}
                    <div className="resume-item">
                      <div className="job-title">Full-Stack</div>
                      <div className="company-name-with-link">
                        <div className="company-name">
                          SoWhot - Shopify E-commerce Platform
                        </div>
                        <div className="project-link-inline">
                          <a
                            href="https://sowhot.in"
                            className="contact-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Visit SoWhat Website"
                          >
                            🔗 https://sowhot.in
                          </a>
                        </div>
                      </div>
                      <div className="job-date">Aug 2025 - Oct 2025</div>
                      <div className="job-description">
                        Sustainable Women&apos;s Activewear Brand - Headless
                        Shopify Solution (Live & Complete)
                      </div>
                      <ul className="bullet-list">
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Built high-performance headless e-commerce platform
                            using Next.js 15 & React 19 with Shopify integration
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Implemented advanced animations with Framer Motion &
                            GSAP, increasing user engagement by 40%
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Developed microservices API architecture for cart,
                            checkout, and payment processing with Razorpay
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Optimized performance with SSR, Redux Saga, and CDN
                            integration for enhanced user experience
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="item-separator"></div>
                    {/* Job 2 */}
                    <div className="resume-item">
                      <div className="job-title">Full-Stack</div>
                      <div className="company-name-with-link">
                        <div className="company-name">
                          TGES Travel & Transport Management
                        </div>
                        <div className="project-links-inline">
                          <a
                            href="https://vendor.tgestravel.com/login"
                            className="contact-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Vendor Portal"
                          >
                            🔗 Vendor
                          </a>
                          <a
                            href="https://admin.tgestravel.com/login"
                            className="contact-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Admin Portal"
                          >
                            🔗 Admin
                          </a>
                        </div>
                      </div>
                      <div className="job-date">May 2025 - Present</div>
                      <div className="job-description">
                        B2B Travel Marketplace with Multi-Vendor Architecture
                        (In Progress)
                      </div>
                      <ul className="bullet-list">
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Architected comprehensive B2B travel platform
                            managing 5+ service categories (Cab, Flight, Train,
                            Hotel, Bus)
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Built microservices architecture with
                            Node.js/Express and MongoDB for scalable booking
                            management system
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Developed vendor & admin panels with React Router
                            v7, Redux Saga & Toolkit for invoice generation
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Implemented real-time quotation system between
                            vendors and clients with automated reminders
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="item-separator"></div>
                    {/* Job 3 */}
                    <div className="resume-item">
                      <div className="job-title">Full-Stack</div>
                      <div className="company-name-with-link">
                        <div className="company-name">
                          Asha Learnology - EdTech Platform
                        </div>
                        <div className="project-link-inline">
                          <a
                            href="https://ashalearnology.vercel.app/"
                            className="contact-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Visit Asha Learnology Platform"
                          >
                            🔗 Live Demo
                          </a>
                        </div>
                      </div>
                      <div className="job-date">Mar 2025 - May 2025</div>
                      <div className="job-description">
                        Comprehensive Learning Management System
                      </div>
                      <ul className="bullet-list">
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Developed comprehensive LMS platform with 10+
                            technical course categories (Data Science, Python,
                            Java, etc.)
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Built course management system with curriculum
                            structure, prerequisites, and certification tracking
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Implemented JWT authentication, user roles, and
                            progress tracking system for student management
                          </span>
                        </li>
                        <li className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>
                            Designed responsive user interface with modern
                            course catalog and enrollment system
                          </span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Skills Section */}
            <div className="section-container">
              <div className="section-header">
                <div className="section-title">Technical Skills</div>
              </div>
              <div className="section-content">
                <div className="skills-item">
                  <div className="skill-category">
                    <div className="skill-category-title">Frontend</div>
                    <div className="skill-list">
                      JavaScript, TypeScript, React.js, Next.js App Router,
                      React Router, Vite, Tailwind CSS, Redux Toolkit, Redux
                      Saga, Zustand
                    </div>
                  </div>
                </div>

                <div className="item-separator"></div>

                <div className="skills-item">
                  <div className="skill-category">
                    <div className="skill-category-title">Backend</div>
                    <div className="skill-list">
                      Node.js, Express.js, MongoDB, Mongoose, Socket.IO, REST
                      APIs, JWT Auth, Cookie/Session Auth
                    </div>
                  </div>
                </div>

                <div className="item-separator"></div>

                <div className="skills-item">
                  <div className="skill-category">
                    <div className="skill-category-title">Integrations</div>
                    <div className="skill-list">
                      Shopify Headless with Next.js, Razorpay, Cloudinary,
                      Gemini API
                    </div>
                  </div>
                </div>

                <div className="item-separator"></div>

                <div className="skills-item">
                  <div className="skill-category">
                    <div className="skill-category-title">Tools</div>
                    <div className="skill-list">
                      Git, GitHub, VS Code, Postman, Vercel, Render
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="section-container">
              <div className="section-header">
                <div className="section-title">Education</div>
              </div>
              <div className="section-content">
                <div className="education-item">
                  <div className="education-degree">
                    Bachelor of Computer Applications (BCA)
                  </div>
                  <div className="education-school">IGNOU, Delhi</div>
                  <div className="education-date">Pursuing</div>
                </div>
                {/* <div className="education-item">
                  <div className="education-degree">
                    Bachelor of Political Science (Hons.)
                  </div>
                  <div className="education-school">DU Sol, Delhi</div>
                  <div className="education-date">Last Semester</div>
                </div> */}

                <div className="item-separator"></div>

                <div className="education-item">
                  <div className="education-degree">12th Grade</div>
                  <div className="education-school">C.B.S.E</div>
                  <div className="education-date">Completed</div>
                </div>
              </div>
            </div>

            {/* Strengths Section */}
            <div className="section-container">
              <div className="section-header">
                <div className="section-title">Strengths</div>
              </div>
              <div className="section-content">
                <div className="strength-item">
                  <svg
                    className="strength-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <div className="strength-content">
                    <div className="strength-title">Problem Solving</div>
                    <div className="strength-description">
                      Break complex business workflows into clear frontend,
                      backend, and API solutions.
                    </div>
                  </div>
                </div>

                <div className="item-separator"></div>

                <div className="strength-item">
                  <svg
                    className="strength-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
                  </svg>
                  <div className="strength-content">
                    <div className="strength-title">Full-Stack Ownership</div>
                    <div className="strength-description">
                      Comfortable building end-to-end features across UI, state,
                      APIs, auth, and database layers.
                    </div>
                  </div>
                </div>

                <div className="item-separator"></div>

                <div className="strength-item">
                  <svg
                    className="strength-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V17H8.82L9.8,14.63C10.33,13.45 10.33,12.55 9.8,11.37L8.69,8.87C8.16,7.69 7.21,7.24 6.27,7.87L4.69,8.87C4.16,9.69 4.21,10.24 4.27,10.87L5.44,13.12C5.78,13.81 6.22,14.42 6.82,14.88L7.58,15.47C7.74,15.59 7.9,15.71 8.06,15.83L6.82,19.15C6.5,20.05 6.84,21 7.71,21.35C8.58,21.7 9.5,21.36 9.85,20.49L11.06,17.34C11.22,16.9 11.06,16.44 10.75,16.15L10.44,15.91C10.25,15.76 10.07,15.6 9.91,15.43L9.15,14.84C8.5,14.34 8,13.65 7.71,12.87L6.54,10.62C6.5,10.55 6.46,10.42 6.5,10.34L8.08,9.34C8.22,9.26 8.46,9.3 8.6,9.5L9.71,12C10.05,12.85 10.05,13.65 9.71,14.5L8.5,17.5H14V5A1,1 0 0,1 15,4H22V6H17V7M19,8V6H20V8H19M19,9H20V15H19V9Z" />
                  </svg>
                  <div className="strength-content">
                    <div className="strength-title">Integration Focus</div>
                    <div className="strength-description">
                      Hands-on with Shopify, Razorpay, Gemini, PDF/document
                      flows, and other real-world integrations.
                    </div>
                  </div>
                </div>

                <div className="item-separator"></div>

                <div className="strength-item">
                  <svg
                    className="strength-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2 1l-3 4v2l3-3v8h5zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 2h-2C3.57 8 2.5 9.57 2.5 11.5V22h2v-3.5h3V22h2v-6.5c0-1.93-1.07-3.5-2.5-3.5zm6.5 4L12 18h2l1.5-6H15z" />
                  </svg>
                  <div className="strength-content">
                    <div className="strength-title">
                      Client-Focused Delivery
                    </div>
                    <div className="strength-description">
                      Build features that reduce manual work and make daily
                      operations easier for teams and users.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
