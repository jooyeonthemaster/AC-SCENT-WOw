from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 500, "height": 900})

    # First go to home to set sessionStorage
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')

    # Set up fake sessionStorage data for analyzing page
    page.evaluate('''() => {
        const fakeData = JSON.stringify({
            uploadedImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        });
        sessionStorage.setItem("analysis-pending-test-dot", fakeData);
    }''')

    # Navigate to analyzing page
    page.goto('http://localhost:3000/analyzing/test-dot')
    page.wait_for_timeout(3000)  # Wait for page to render

    # Screenshot
    page.screenshot(path='c:/Users/jayit/OneDrive/바탕 화면/roqkf/acsent woow/scripts/analyzing_page.png', full_page=False)
    print("Analyzing page screenshot saved.")

    # Find ALL elements, including very small ones, anywhere on the page
    all_small = page.evaluate('''() => {
        const all = document.querySelectorAll('*');
        const results = [];
        for (const el of all) {
            const rect = el.getBoundingClientRect();
            // Look for small elements (under 30px in both dimensions) that are visible
            if (rect.width > 0 && rect.width < 30 && rect.height > 0 && rect.height < 30) {
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    results.push({
                        tag: el.tagName,
                        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
                        color: style.color,
                        bgColor: style.backgroundColor,
                        border: style.border,
                        opacity: style.opacity,
                        outerHTML: el.outerHTML.substring(0, 300)
                    });
                }
            }
        }
        return results;
    }''')

    print(f"\n=== All small visible elements (< 30px) === ({len(all_small)} found)")
    for el in all_small:
        print(json.dumps(el, indent=2, ensure_ascii=False))

    # Check SVG circles specifically
    svg_circles = page.evaluate('''() => {
        const circles = document.querySelectorAll('circle');
        return Array.from(circles).map(c => {
            const rect = c.getBoundingClientRect();
            return {
                cx: c.getAttribute('cx'),
                cy: c.getAttribute('cy'),
                r: c.getAttribute('r'),
                fill: c.getAttribute('fill'),
                rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
            };
        });
    }''')

    print("\n=== SVG circles ===")
    for c in svg_circles:
        print(json.dumps(c, indent=2))

    # Check body > * for non-main elements
    body_children = page.evaluate('''() => {
        return Array.from(document.body.children).map(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return {
                tag: el.tagName,
                id: el.id,
                display: style.display,
                rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
                visible: rect.width > 0 && rect.height > 0 && style.display !== 'none'
            };
        });
    }''')

    print("\n=== Body children visibility ===")
    for child in body_children:
        print(json.dumps(child, indent=2))

    browser.close()
