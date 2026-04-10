import {
  Document,
  Image as PdfImage,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { getDynamicExperienceDescription } from "./resume-experience";

type ResumePdfDocumentProps = {
  photoSrc?: string;
};

type PdfContactItem = {
  label: string;
  value: string;
  iconPath?: string;
  iconText?: string;
  url?: string;
};

const profileLinkIconPath =
  "M15 7h3a5 5 0 010 10h-3v-2h3a3 3 0 100-6h-3V7zM9 17H6A5 5 0 016 7h3v2H6a3 3 0 000 6h3v2zm-2-6h10v2H7v-2z";

const summary =
  "Full-stack developer who turns business workflows into web products people can actually use. I build React and Next.js frontends with Node.js, Express, MongoDB, and TypeScript backends for operations platforms, Shopify storefronts, and AI products, with a strong focus on APIs, auth, dashboards, integrations, documents, and reducing manual work for clients.";

const currentEmployment = {
  title: "Full-Stack Developer - Full Time",
  company: "Asha Tech (Asha Learnology)",
  date: "03/2025",
  location: "Delhi, India",
  companyDescription: "A company focused on education and technology solutions",
  bullets: [getDynamicExperienceDescription()],
};

const projects = [
  {
    name: "TGES Travel Operations Platform",
    links: [
      { label: "Vendor Panel", url: "https://vendor.tgestravel.com/login" },
      { label: "Admin Panel", url: "https://admin.tgestravel.com/login" },
    ],
    description:
      "Built a travel operations platform that helps the client manage vendors, bookings, quotations, rate cards, invoices, duty slips, notifications, and review flows in one place.",
    bullets: [
      "Built Express and MongoDB APIs for vendor login and profile flows, bookings, quotations, invoices, duty slips, cab rates, notifications, and WhatsApp messaging, so the main business workflows run from one backend",
      "Built vendor-panel screens for booking requests, MIS tables with filters and Excel export, profile and document handling, rate cards, agreements, invoices, and duty slips, so vendors can complete work without depending on the ops team for every step",
      "Built admin tools for booking handling, quotation sending, vendor assignment, vendor filtering and status control, invoice review, duty-slip downloads, and rate-card search, giving the client better control over daily operations",
      "Added Socket.IO notifications plus PDF and file handling for invoices, documents, and slips, helping teams spend less time on manual coordination",
    ],
  },
  {
    name: "Sowhot",
    links: [{ label: "Live App", url: "https://sowhot.in" }],
    description:
      "Built a headless Shopify storefront so the client could control the shopping experience beyond a standard Shopify theme, especially around discovery, reviews, cart flows, and checkout behavior.",
    bullets: [
      "Built home, collection, search, cart, and product pages using Shopify Storefront data, filters, sorting, pagination, and lazy-loaded sections, helping shoppers find products more easily",
      "Built product pages with size and color selection, add-to-cart actions, reviews, and optional review image uploads stored through Shopify metafields, helping customers make better buying decisions",
      "Built server routes for Shopify checkout links and private-access-gated Razorpay buy-now flows, giving the client more control over checkout and payment handling",
      "Added cookie and HMAC based access checks for protected review and operational actions inside the storefront, so sensitive actions stay limited to approved sessions",
    ],
  },
  {
    name: "LoviqueAiBot",
    links: [{ label: "Live App", url: "https://lovique-ai-bot.vercel.app/" }],
    description:
      "Built an AI chat product that gives users a more personal and continuous experience through saved sessions, memories, companion settings, and synced frontend/backend state.",
    bullets: [
      "Built the Next.js frontend for login, dashboard, settings, and chat workspace, giving users a dedicated place to manage and continue conversations",
      "Built Express account flows for sign-up, login, logout, password reset, preferences, and memory handling, so users can securely manage their accounts",
      "Built Gemini-powered chat services with saved chat history, session management, custom companion prompts, and memories stored in MongoDB, making replies feel more consistent and personal",
      "Built protected chat and auth APIs for replies, chat history, session summaries, memories, and companion settings, supporting a more tailored user experience",
    ],
  },
];

const skills = [
  {
    title: "Frontend",
    value:
      "JavaScript, TypeScript, React.js, Next.js App Router, React Router, Vite, Tailwind CSS, Redux Toolkit, Redux Saga, Zustand",
  },
  {
    title: "Backend",
    value:
      "Node.js, Express.js, MongoDB, Mongoose, Socket.IO, REST APIs, JWT Auth, Cookie/Session Auth",
  },
  {
    title: "Integrations",
    value: "Shopify Headless with Next.js, Razorpay, Cloudinary, Gemini API",
  },
  {
    title: "Tools",
    value: "Git, GitHub, VS Code, Postman, Vercel, Render",
  },
];

const education = [
  {
    degree: "Bachelor of Computer Applications (BCA)",
    school: "IGNOU, Delhi",
    date: "Pursuing",
  },
  {
    degree: "12th Grade",
    school: "C.B.S.E",
    date: "Completed",
  },
];

const strengths = [
  {
    title: "Problem Solving",
    description:
      "Break complex business workflows into clear frontend, backend, and API solutions.",
  },
  {
    title: "Full-Stack Ownership",
    description:
      "Comfortable building end-to-end features across UI, state, APIs, auth, and database layers.",
  },
  {
    title: "Integration Focus",
    description:
      "Hands-on with Shopify, Razorpay, Gemini, PDF/document flows, and other real-world integrations.",
  },
  {
    title: "Client-Focused Delivery",
    description:
      "Build features that reduce manual work and make daily operations easier for teams and users.",
  },
];

const contactItems: PdfContactItem[] = [
  {
    label: "Phone",
    value: "8799791143",
    iconPath:
      "M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z",
    url: "tel:8799791143",
  },
  {
    label: "Email",
    value: "amankanojiya.dev@gmail.com",
    iconText: "@",
    url: "mailto:amankanojiya.dev@gmail.com",
  },
  {
    label: "Location",
    value: "Saket, Delhi, India",
    iconPath:
      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  },
];

const profileContactItems: PdfContactItem[] = [
  {
    label: "LinkedIn",
    value: "linkedin",
    iconPath: profileLinkIconPath,
    url: "http://www.linkedin.com/in/Amankanojiya27",
  },
  {
    label: "GitHub",
    value: "github",
    iconPath: profileLinkIconPath,
    url: "https://github.com/Amankanojiya27",
  },
  {
    label: "Portfolio",
    value: "Portfolio",
    iconPath: profileLinkIconPath,
    url: "https://amankanojiya27.vercel.app/",
  },
];

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 18,
    paddingLeft: 20,
    fontFamily: "Helvetica",
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 9,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  title: {
    marginTop: 2,
    marginBottom: 7,
    fontSize: 10,
    color: "#4f4f4f",
  },
  contactWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 3,
  },
  contactIcon: {
    width: 8,
    height: 8,
    marginRight: 4,
    flexShrink: 0,
  },
  contactSymbol: {
    marginRight: 4,
    color: "#008cff",
    fontSize: 8.6,
    fontWeight: 700,
    lineHeight: 1,
  },
  contactText: {
    fontSize: 8.1,
    lineHeight: 1.25,
    color: "#111111",
  },
  contactLink: {
    color: "#111111",
    textDecoration: "none",
    fontSize: 8.1,
    lineHeight: 1.25,
  },
  profileLinksGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  profileLinkSegment: {
    flexDirection: "row",
    alignItems: "center",
  },
  photo: {
    width: 74,
    height: 74,
    borderRadius: 37,
    objectFit: "cover",
  },
  columns: {
    flexDirection: "row",
  },
  leftColumn: {
    width: "62%",
    paddingRight: 7,
  },
  rightColumn: {
    width: "38%",
    paddingLeft: 7,
  },
  section: {
    marginBottom: 7,
  },
  sectionTitle: {
    paddingBottom: 2,
    marginBottom: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    fontSize: 10.2,
    fontWeight: 700,
  },
  bodyText: {
    fontSize: 7.8,
    lineHeight: 1.35,
  },
  itemBlock: {
    marginBottom: 5,
  },
  companyName: {
    fontSize: 8.2,
    color: "#0b57d0",
    fontWeight: 700,
  },
  jobTitle: {
    fontSize: 8.2,
    fontWeight: 700,
    marginTop: 1,
  },
  jobDate: {
    marginTop: 1,
    fontSize: 7.1,
    color: "#666666",
  },
  description: {
    marginTop: 2,
    fontSize: 7.8,
    lineHeight: 1.35,
  },
  separator: {
    height: 1,
    marginTop: 3,
    marginBottom: 4,
    backgroundColor: "#e5e5e5",
  },
  inlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  inlineHeaderLeft: {
    flex: 1,
    paddingRight: 6,
  },
  inlineLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    maxWidth: 150,
  },
  inlineLink: {
    marginLeft: 8,
    marginBottom: 2,
    fontSize: 7.1,
    color: "#0b57d0",
    textDecoration: "none",
  },
  bulletList: {
    marginTop: 3,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  bullet: {
    width: 8,
    fontSize: 7.8,
    lineHeight: 1.35,
  },
  bulletText: {
    flex: 1,
    fontSize: 7.6,
    lineHeight: 1.35,
  },
  skillCategory: {
    marginBottom: 5,
  },
  skillTitle: {
    fontSize: 8.2,
    fontWeight: 700,
    marginBottom: 1,
  },
  skillValue: {
    fontSize: 7.8,
    lineHeight: 1.35,
    color: "#111111",
  },
  educationBlock: {
    marginBottom: 5,
  },
  educationDegree: {
    fontSize: 8.2,
    fontWeight: 700,
  },
  educationSchool: {
    marginTop: 1,
    fontSize: 7.8,
    color: "#0b57d0",
  },
  strengthBlock: {
    marginBottom: 5,
  },
  strengthTitle: {
    fontSize: 8.2,
    fontWeight: 700,
  },
  strengthDescription: {
    marginTop: 1,
    fontSize: 7.8,
    lineHeight: 1.3,
    color: "#111111",
  },
});

export default function ResumePdfDocument({
  photoSrc,
}: ResumePdfDocumentProps) {
  return (
    <Document
      author="Aman Kanojiya"
      title="Aman Kanojiya Resume"
      subject="Resume"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} wrap={false}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>Aman Kanojiya</Text>
            <Text style={styles.title}>Full-Stack Web Developer</Text>
            <View style={styles.contactWrap}>
              {contactItems.map((item) => (
                <View key={`${item.label}-${item.value}`} style={styles.contactItem}>
                  {item.iconText ? (
                    <Text style={styles.contactSymbol}>{item.iconText}</Text>
                  ) : (
                    <Svg viewBox="0 0 24 24" style={styles.contactIcon}>
                      <Path d={item.iconPath ?? ""} fill="#008cff" />
                    </Svg>
                  )}
                  {item.url ? (
                    <Link src={item.url} style={styles.contactLink}>
                      {item.value}
                    </Link>
                  ) : (
                    <Text style={styles.contactText}>{item.value}</Text>
                  )}
                </View>
              ))}
              <View style={styles.contactItem}>
                <Svg viewBox="0 0 24 24" style={styles.contactIcon}>
                  <Path d={profileLinkIconPath} fill="#008cff" />
                </Svg>
                <View style={styles.profileLinksGroup}>
                  {profileContactItems.map((item, index) => (
                    <View key={item.label} style={styles.profileLinkSegment}>
                      {index > 0 ? <Text style={styles.contactText}>, </Text> : null}
                      <Link src={item.url ?? ""} style={styles.contactLink}>
                        {item.value}
                      </Link>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
          {photoSrc ? <PdfImage src={photoSrc} style={styles.photo} /> : null}
        </View>

        <View style={styles.columns}>
          <View style={styles.leftColumn}>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.bodyText}>{summary}</Text>
            </View>

            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={styles.itemBlock}>
                <Text style={styles.jobTitle}>{currentEmployment.title}</Text>
                <Text style={styles.companyName}>{currentEmployment.company}</Text>
                <Text style={styles.jobDate}>{currentEmployment.date}</Text>
                <Text style={styles.jobDate}>{currentEmployment.location}</Text>
                <Text style={styles.description}>
                  {currentEmployment.companyDescription}
                </Text>
                <View style={styles.bulletList}>
                  {currentEmployment.bullets.map((bullet) => (
                    <View key={bullet} style={styles.bulletRow}>
                      <Text style={styles.bullet}>-</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {projects.map((project, index) => (
                <View key={project.name} style={styles.itemBlock}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <View style={styles.inlineHeader}>
                    <View style={styles.inlineHeaderLeft}>
                      <Text style={styles.companyName}>{project.name}</Text>
                    </View>
                    <View style={styles.inlineLinks}>
                      {project.links.map((link) => (
                        <Link
                          key={link.url}
                          src={link.url}
                          style={styles.inlineLink}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.description}>{project.description}</Text>
                  <View style={styles.bulletList}>
                    {project.bullets.map((bullet) => (
                      <View key={bullet} style={styles.bulletRow}>
                        <Text style={styles.bullet}>-</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Technical Skills</Text>
              {skills.map((skill, index) => (
                <View key={skill.title} style={styles.skillCategory}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <Text style={styles.skillTitle}>{skill.title}</Text>
                  <Text style={styles.skillValue}>{skill.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Education</Text>
              {education.map((item, index) => (
                <View key={item.degree} style={styles.educationBlock}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <Text style={styles.educationDegree}>{item.degree}</Text>
                  <Text style={styles.educationSchool}>{item.school}</Text>
                  <Text style={styles.jobDate}>{item.date}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Strengths</Text>
              {strengths.map((strength, index) => (
                <View key={strength.title} style={styles.strengthBlock}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <Text style={styles.strengthTitle}>{strength.title}</Text>
                  <Text style={styles.strengthDescription}>
                    {strength.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
