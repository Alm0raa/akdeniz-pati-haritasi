export const LEVELS = [
  { name: "Yeni Pati", min: 0, max: 99 },
  { name: "Pati Dostu", min: 100, max: 299 },
  { name: "Mama Destekçisi", min: 300, max: 699 },
  { name: "Kampüs Gönüllüsü", min: 700, max: 1499 },
  { name: "Pati Koruyucusu", min: 1500, max: 2999 },
  { name: "HaySev Elçisi", min: 3000, max: Infinity },
];

export const AVATARS = [
  { id: "avatar-04", page: 4, minPoints: 0, level: "Yeni Pati" },
  { id: "avatar-03", page: 3, minPoints: 100, level: "Pati Dostu" },
  { id: "avatar-05", page: 5, minPoints: 100, level: "Pati Dostu" },
  { id: "avatar-07", page: 7, minPoints: 300, level: "Mama Destekçisi" },
  { id: "avatar-10", page: 10, minPoints: 700, level: "Kampüs Gönüllüsü" },
  { id: "avatar-11", page: 11, minPoints: 1500, level: "Pati Koruyucusu" },
  { id: "avatar-08", page: 8, minPoints: 1500, level: "Pati Koruyucusu" },
  { id: "avatar-06", page: 6, minPoints: 1500, level: "Pati Koruyucusu" },
  { id: "avatar-01", page: 1, minPoints: 3000, level: "HaySev Elçisi" },
  { id: "avatar-02", page: 2, minPoints: 3000, level: "HaySev Elçisi" },
  { id: "avatar-09", page: 9, minPoints: 3000, level: "HaySev Elçisi" },
].map((avatar) => ({ ...avatar, src: `/avatars/avatar-${String(avatar.page).padStart(2, "0")}.png` }));

export function getLevel(points = 0) {
  const safePoints = Math.max(0, Number(points) || 0);
  return LEVELS.find((level) => safePoints >= level.min && safePoints <= level.max) || LEVELS[0];
}

export function isAvatarUnlocked(avatar, points = 0) {
  return Math.max(0, Number(points) || 0) >= avatar.minPoints;
}

export function getUnlockedAvatars(points = 0) {
  return AVATARS.filter((avatar) => isAvatarUnlocked(avatar, points));
}
