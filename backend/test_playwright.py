from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(java_script_enabled=False, user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36")
    page = context.new_page()
    page.goto("https://www.zara.com/es/en/zw-collection-ruffled-shirt-p09479040.html?v1=441075492")
    print(page.locator("img").nth(1).get_attribute("src"))
    browser.close()