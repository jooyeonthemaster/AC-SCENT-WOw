from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 500, "height": 900})

    # Navigate to analyzing page
    page.goto('http://localhost:3000/analyzing/test-123')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path='c:/Users/jayit/OneDrive/바탕 화면/roqkf/acsent woow/scripts/analyzing_screenshot.png', full_page=False)
    print("Screenshot saved.")

    # Get all direct children of body
    body_children = page.evaluate('''() => {
        const body = document.body;
        const children = [];
        for (let i = 0; i < body.children.length; i++) {
            const el = body.children[i];
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            children.push({
                tag: el.tagName,
                id: el.id,
                className: el.className?.toString?.() || '',
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                color: style.color,
                backgroundColor: style.backgroundColor,
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                innerHTML_length: el.innerHTML.length,
                textContent_short: el.textContent?.substring(0, 100) || ''
            });
        }
        return children;
    }''')

    print("\n=== Body direct children ===")
    for child in body_children:
        print(json.dumps(child, indent=2, ensure_ascii=False))

    # Find ALL visible elements near the left edge (x < 20px)
    left_elements = page.evaluate('''() => {
        const all = document.querySelectorAll('*');
        const results = [];
        for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && rect.x < 20 && rect.width < 50 && rect.height < 50) {
                const style = window.getComputedStyle(el);
                if (style.visibility !== 'hidden' && style.opacity !== '0' && style.display !== 'none') {
                    results.push({
                        tag: el.tagName,
                        id: el.id,
                        className: el.className?.toString?.() || '',
                        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
                        color: style.color,
                        backgroundColor: style.backgroundColor,
                        borderColor: style.borderColor,
                        content: el.textContent?.substring(0, 50) || '',
                        outerHTML_short: el.outerHTML.substring(0, 200)
                    });
                }
            }
        }
        return results;
    }''')

    print("\n=== Small visible elements near left edge (x < 20, size < 50) ===")
    for el in left_elements:
        print(json.dumps(el, indent=2, ensure_ascii=False))

    # Also check for any elements with green-ish computed colors
    green_elements = page.evaluate('''() => {
        const all = document.querySelectorAll('*');
        const results = [];
        for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = style.backgroundColor;
            // Check for green-ish colors
            const isGreen = (c) => {
                const m = c.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
                if (!m) return false;
                const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
                return g > r * 1.2 && g > b * 1.2 && g > 50;
            };
            if ((isGreen(color) || isGreen(bgColor)) && rect.x < 30) {
                results.push({
                    tag: el.tagName,
                    id: el.id,
                    className: el.className?.toString?.()?.substring(0, 100) || '',
                    rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
                    color: color,
                    bgColor: bgColor,
                    outerHTML_short: el.outerHTML.substring(0, 300)
                });
            }
        }
        return results;
    }''')

    print("\n=== Green-colored elements near left edge ===")
    for el in green_elements:
        print(json.dumps(el, indent=2, ensure_ascii=False))

    browser.close()
