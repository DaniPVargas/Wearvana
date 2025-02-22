from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://www.zara.com/es/en/zw-collection-ruffled-shirt-p09479040.html?v1=441075492")
    first_image = page.locator('img').first()

    # Optionally, get the src attribute or other properties of the image
    src = first_image.get_attribute('src')
    print(src)

    browser.close()