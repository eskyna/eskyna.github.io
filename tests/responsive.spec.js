const { test, expect } = require("@playwright/test");

const pages = ["/", "/about/", "/estyle/", "/impressum/", "/datenschutz/", "/ru/"];

const viewports = [
  { name: "phone-360", width: 360, height: 740 },
  { name: "phone-375", width: 375, height: 812 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "phone-430", width: 430, height: 932 },
  { name: "ipad-768x1024", width: 768, height: 1024 },
  { name: "ipad-air-820x1180", width: 820, height: 1180 },
  { name: "ipad-1024x768", width: 1024, height: 768 },
  { name: "ipad-air-1180x820", width: 1180, height: 820 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

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

      const safePath = path === "/" ? "home" : path.replaceAll("/", "-").replace(/^-|-$/g, "");
      await page.screenshot({
        path: `test-results/responsive-screenshots/${safePath}-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }
}
