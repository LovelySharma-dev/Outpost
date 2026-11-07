export const CHARACTER = {
  name: "Sable",
  are: "A baby ink roller. Graphite rubber, a honey-wood handle, and a brass bell that rings when the colors agree. Precise, a little vain, and quiet when a print smears.",
  does: "Junior printer at the Night Press. Pulls pocket editions of feelings that have not found their sentence yet.",
  story:
    "Born when a poster landed one hair out of register and the leftover dot refused to be a mistake. Sable is learning to put all four colors on the same feeling. The route is getting longer than the shop.",
  tagline: "I pull the color until the feeling lands.",
} as const;

export const PASSES = [
  {
    id: "cyan",
    index: 0,
    ink: "Cyan",
    color: "#0e8ea8",
    title: "The mistake",
    body: "A poster came off the press one hair out of register. The leftover dot did not want to be an error. It rolled itself into Sable.",
  },
  {
    id: "magenta",
    index: 1,
    ink: "Magenta",
    color: "#c43b72",
    title: "The handle",
    body: "The shop fitted a wooden handle so the dot could reach the bed. Sable still holds it a little too proudly.",
  },
  {
    id: "yellow",
    index: 2,
    ink: "Yellow",
    color: "#a07810",
    title: "The job",
    body: "Before a sheet dries, Sable pulls color until a feeling sits in one place. Private lines stay private. The edges get peeked at.",
  },
  {
    id: "key",
    index: 3,
    ink: "Key",
    color: "#1c1916",
    title: "The route",
    body: "The editions are small on purpose. A true line hangs on this browser’s drying rack until you take it down.",
  },
] as const;

export type PlateId = "c" | "m" | "y" | "k";

export const PLATES: { id: PlateId; name: string; hint: string }[] = [
  { id: "c", name: "Cyan", hint: "The cool plate. Windows and distance." },
  { id: "m", name: "Magenta", hint: "The warm plate. Apologies and cheeks." },
  { id: "y", name: "Yellow", hint: "The lamp plate. Things left on." },
  { id: "k", name: "Key", hint: "The drawing. What the feeling actually is." },
];

export const START_OFFSETS: Record<PlateId, { x: number; y: number }> = {
  c: { x: -78, y: -64 },
  m: { x: 86, y: -36 },
  y: { x: -48, y: 78 },
  k: { x: 64, y: 58 },
};

export const ZERO_OFFSETS: Record<PlateId, { x: number; y: number }> = {
  c: { x: 0, y: 0 },
  m: { x: 0, y: 0 },
  y: { x: 0, y: 0 },
  k: { x: 0, y: 0 },
};

export const EDITIONS = [
  {
    id: "window",
    title: "The Window Left Open",
    code: "NP-04",
    note: "A rectangle of night, printed for someone who could not say stay.",
  },
  {
    id: "cups",
    title: "Two Cups",
    code: "NP-11",
    note: "Two circles. One of them is still warm.",
  },
  {
    id: "route",
    title: "Route Home",
    code: "NP-18",
    note: "A path short enough to fit in a pocket.",
  },
] as const;

export type EditionId = (typeof EDITIONS)[number]["id"];

export const SHOP_SHEETS = [
  {
    id: "shop-window",
    to: "The green window",
    line: "I left the light on. That was the apology.",
  },
  {
    id: "shop-cups",
    to: "The night shift",
    line: "The second cup was yours.",
  },
  {
    id: "shop-sable",
    to: "Sable",
    line: "You were never just a misprint.",
  },
] as const;

export const SORTS = ["S", "A", "B", "L", "E", "N", "I", "G", "H", "T", "P", "R", "O", "U", "C", "D", "M", "Y", "K"] as const;

export const NAV = [
  { href: "#table", label: "Table" },
  { href: "#sheet", label: "Sheet" },
  { href: "#passes", label: "Passes" },
  { href: "#plates", label: "Plates" },
  { href: "#editions", label: "Editions" },
  { href: "#drawer", label: "Type" },
  { href: "#desk", label: "Desk" },
] as const;
