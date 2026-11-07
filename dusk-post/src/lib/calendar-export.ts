import type { Scholarship } from "@/data/scholarships";

export function generateGoogleCalendarUrl(scholarship: Scholarship): string {
  const title = encodeURIComponent(`[GRANTLY Deadline] ${scholarship.title}`);
  const details = encodeURIComponent(
    `Scholarship: ${scholarship.title}\nProvider: ${scholarship.provider}\nAmount: ${scholarship.amountFormatted}\nApply: ${scholarship.applyUrl}\n\nManaged with Grantly.`
  );
  // Parse YYYY-MM-DD
  const dateFormatted = scholarship.deadline.replace(/-/g, "");
  const dates = `${dateFormatted}T180000Z/${dateFormatted}T190000Z`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

export function downloadIcsFile(scholarship: Scholarship) {
  const dateFormatted = scholarship.deadline.replace(/-/g, "");
  const uid = `${scholarship.id}-${Date.now()}@grantly.org`;
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grantly//Scholarship Management//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:[GRANTLY Deadline] ${scholarship.title}`,
    `DESCRIPTION:Scholarship: ${scholarship.title}\\nAmount: ${scholarship.amountFormatted}\\nProvider: ${scholarship.provider}\\nLink: ${scholarship.applyUrl}`,
    `DTSTART;VALUE=DATE:${dateFormatted}`,
    `DTEND;VALUE=DATE:${dateFormatted}`,
    "STATUS:CONFIRMED",
    "PRIORITY:1",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${scholarship.id}-deadline.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
