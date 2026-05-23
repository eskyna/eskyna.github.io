const { test, expect } = require("@playwright/test");

const pages = ["/", "/about/", "/estyle/", "/impressum/", "/datenschutz/", "/ru/"];
const heroOnlyPage = "/";

const viewports = [
  // iPhone / iOS (portrait + landscape)
  { name: "iphone-se-375x667", width: 375, height: 667 },
  { name: "iphone-se-667x375", width: 667, height: 375 },
  { name: "iphone-12-390x844", width: 390, height: 844 },
  { name: "iphone-12-844x390", width: 844, height: 390 },
  { name: "iphone-15-pro-max-430x932", width: 430, height: 932 },
  { name: "iphone-15-pro-max-932x430", width: 932, height: 430 },

  // Android phones (portrait + landscape)
  { name: "android-small-360x800", width: 360, height: 800 },
  { name: "android-small-800x360", width: 800, height: 360 },
  { name: "android-pixel7-412x915", width: 412, height: 915 },
  { name: "android-pixel7-915x412", width: 915, height: 412 },
  { name: "android-galaxy-s20-360x760", width: 360, height: 760 },
  { name: "android-galaxy-s20-760x360", width: 760, height: 360 },

  // iPad / tablets (portrait + landscape)
  { name: "ipad-768x1024", width: 768, height: 1024 },
  { name: "ipad-1024x768", width: 1024, height: 768 },
  { name: "ipad-air-820x1180", width: 820, height: 1180 },
  { name: "ipad-air-1180x820", width: 1180, height: 820 },
  { name: "ipad-mini-744x1133", width: 744, height: 1133 },
  { name: "ipad-mini-1133x744", width: 1133, height: 744 },

  // Desktop / laptops
  { name: "desktop-1280x720", width: 1280, height: 720 },
  { name: "desktop-1280x800", width: 1280, height: 800 },
  { name: "laptop-1366x768", width: 1366, height: 768 },
  { name: "desktop-1536x864", width: 1536, height: 864 },
  { name: "desktop-1600x900", width: 1600, height: 900 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "desktop-1920x1080", width: 1920, height: 1080 },
  { name: "desktop-1920x1200", width: 1920, height: 1200 },
  { name: "desktop-2560x1440", width: 2560, height: 1440 },
  { name: "desktop-1080x1920", width: 1080, height: 1920 },
];

const phonePadViewports = viewports.filter((viewport) => /iphone|android|ipad/.test(viewport.name));
const screenshotRootDir = "test-results";

function toSafePath(path) {
  return path === "/" ? "home" : path.replaceAll("/", "-").replace(/^-|-$/g, "");
}

function screenshotPath({ pagePath, bucket, viewportName, sectionName }) {
  const safePagePath = toSafePath(pagePath);
  const safeSectionName = sectionName || "";

  if (safeSectionName) {
    return `${screenshotRootDir}/${safePagePath}/${bucket}/${safeSectionName}/${viewportName}.png`;
  }

  return `${screenshotRootDir}/${safePagePath}/${bucket}/${viewportName}.png`;
}

for (const path of pages) {
  for (const viewport of viewports) {
    test(`${path} ${viewport.name} has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto(path, { waitUntil: "networkidle" });

      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth > root.clientWidth;
      });

      expect(overflow).toBe(false);

      const safePath = toSafePath(path);
      await page.screenshot({
        path: screenshotPath({
          pagePath: safePath,
          bucket: "full",
          viewportName: viewport.name,
        }),
        fullPage: true,
      });
    });
  }
}

for (const viewport of viewports) {
  test(`${heroOnlyPage} ${viewport.name} renders hero only`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await page.goto(heroOnlyPage, { waitUntil: "networkidle" });

    const hero = page.locator("main.home-main > section.hero");
    await expect(hero).toBeVisible();

    await hero.screenshot({
      path: screenshotPath({
        pagePath: heroOnlyPage,
        bucket: "hero",
        viewportName: viewport.name,
      }),
    });
  });
}

for (const viewport of phonePadViewports) {
  test(`${heroOnlyPage} ${viewport.name} renders all sections separately`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await page.goto(heroOnlyPage, { waitUntil: "networkidle" });

    const sections = page.locator("main.home-main > section");
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);

    for (let index = 0; index < sectionCount; index += 1) {
      const section = sections.nth(index);
      const sectionName = await section.evaluate((element, idx) => {
        const slug = (value) =>
          (value || "")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9_-]/g, "")
            .replace(/-{2,}/g, "-")
            .replace(/^-|-$/g, "");

        const idPart = slug(element.id);
        const classPart = slug(element.className);
        return idPart || classPart || `section-${idx + 1}`;
      }, index);

      await expect(section).toBeVisible();
      await section.screenshot({
        path: screenshotPath({
          pagePath: heroOnlyPage,
          bucket: "sections",
          sectionName,
          viewportName: viewport.name,
        }),
      });
    }
  });
}
