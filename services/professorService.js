// services/professorService.js
import { 
  searchSchool, 
  searchProfessorsAtSchoolId, 
  getProfessorRatingAtSchoolId 
} from "ratemyprofessor-api";

let rutgersSchoolIdCache = null;

/**
 * Find the Rutgers school ID (once) to avoid repeating the search.
 */
async function getRutgersSchoolId() {
  if (rutgersSchoolIdCache) return rutgersSchoolIdCache;

  const schools = await searchSchool("Rutgers");
  if (!schools || schools.length === 0) {
    throw new Error("Rutgers school not found in RMP API");
  }
  // Choose the first match (you may filter by campus if needed)
  rutgersSchoolIdCache = schools[0].node.id;
  return rutgersSchoolIdCache;
}

/**
 * Search for professors by name in Rutgers, return matching ratings.
 * @param {string} name - e.g. "John Smith"
 */
export async function getProfessorRatings(name) {
  const schoolId = await getRutgersSchoolId();

  // search professors with name in Rutgers
  const profSearch = await searchProfessorsAtSchoolId(name, schoolId);
  if (!profSearch || profSearch.length === 0) {
    return null;
  }

  // Get the “teacher” node
  const teacher = profSearch[0].node;

  // You can also fetch more detailed info (if available)
  const ratingInfo = await getProfessorRatingAtSchoolId(name, schoolId);

  return {
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    department: teacher.department,
    rating: teacher.avgRating,
    difficulty: teacher.avgDifficulty,
    wouldTakeAgain: teacher.wouldTakeAgainPercent,
    numRatings: teacher.numRatings,
    legacyId: teacher.legacyId,
    rmpLink: `https://www.ratemyprofessors.com/professor/${teacher.legacyId}`
  };
}
