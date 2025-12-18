import { ingestGuides } from "../backend/services/readinessEngine";

ingestGuides().then((result) => {
  console.log("Seeded guides", result);
});
