import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        print("Navigating...")
        await page.goto("https://www.iexindia.com/market-data/green-market/")
        print("Waiting for network idle...")
        await page.wait_for_load_state("networkidle")
        content = await page.content()
        print(f"Loaded length: {len(content)}")
        
        # Look for table or specific text
        if "Something went wrong" in content:
            print("Page failed to load correctly")
        
        # Let's take a screenshot to see what's going on
        await page.screenshot(path="iex_green_market.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
