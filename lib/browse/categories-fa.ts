/** Persian labels for English `BrowseItem.category` values. */
export const CATEGORY_LABEL_FA: Record<string, string> = {
  All: "همه",
  Display: "نمایش",
  Navigation: "ناوبری",
  Input: "ورودی",
  Button: "دکمه",
  List: "لیست",
  Layout: "چیدمان",
};

export function categoryLabelFa(category: string) {
  return CATEGORY_LABEL_FA[category] ?? category;
}
