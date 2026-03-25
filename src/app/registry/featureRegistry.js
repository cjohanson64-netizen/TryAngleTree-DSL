import { battleFeature } from "../features/battle/battleFeature";
import { curriculumFeature } from "../features/curriculum/curriculumFeature";

export const featureRegistry = {
  [battleFeature.id]: battleFeature,
  [curriculumFeature.id]: curriculumFeature,
};

export const featureOptions = Object.values(featureRegistry).map((feature) => ({
  id: feature.id,
  label: feature.label,
}));

export const defaultFeatureId = battleFeature.id;
