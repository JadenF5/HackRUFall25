// services/courseService.js
import axios from "axios";
import collections from "../config/mongoCollections.js";

/**
 * Fetch course offerings from Rutgers SOC API
 */
export async function fetchFromSOC(opts) {
  const { year, term, campus, subjectCode, level } = opts;

  const url = new URL("https://sis.rutgers.edu/soc/api/courses.json");
  url.searchParams.set("year", year);
  url.searchParams.set("term", term);     // e.g. 9 for Fall
  url.searchParams.set("campus", campus); // NB, NK, CM
  if (subjectCode) url.searchParams.set("subject", subjectCode);
  if (level) url.searchParams.set("level", level);

  try {
    const resp = await axios.get(url.toString());
    return resp.data;
  } catch (e) {
    console.error("SOC fetch error:", e.toString());
    return null;
  }
}

/**
 * Update a class document with professors from SOC
 */
export async function updateClassWithSOC(classId, socOpts) {
  const classesCol = await collections.classes();
  const cls = await classesCol.findOne({ _id: classId });
  if (!cls) throw new Error("Class not found");

  const socSections = await fetchFromSOC({
    ...socOpts,
    subjectCode: cls.subject // ensure we pass subject like "198"
  });

  if (!socSections) return;

  // ✅ Filter by BOTH subject and courseNumber
  const matches = socSections.filter(
    (c) =>
      c.subject === cls.subject && // e.g. "198" for Comp Sci
      c.courseNumber === cls.number // e.g. "111"
  );

  // Collect instructors only from this course
  const instructors = new Set();
  for (const course of matches) {
    if (course.sections) {
      for (const section of course.sections) {
        if (Array.isArray(section.instructors)) {
          section.instructors.forEach((i) => {
            if (i.name) instructors.add(i.name);
          });
        }
      }
    }
  }

  const profList = Array.from(instructors);

  await classesCol.updateOne(
    { _id: classId },
    { $set: { professors: profList } }
  );

  console.log(`Class ${classId} (${cls.subject}:${cls.number}) updated with professors:`, profList);
}
