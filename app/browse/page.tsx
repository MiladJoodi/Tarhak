import { BrowseExperience } from "@/components/browse/browse-experience";
import { loadComponentTags } from "@/lib/admin/components-fs";
import { browseItems } from "@/lib/browse/items";
import { getGithubStarCount } from "@/lib/github";

export default async function BrowsePage() {
  const [tags, stars] = await Promise.all([
    loadComponentTags(),
    getGithubStarCount(),
  ]);
  const items = browseItems.map((item) => ({
    ...item,
    tags: tags[item.slug] ?? [],
  }));
  return <BrowseExperience items={items} stars={stars} />;
}
