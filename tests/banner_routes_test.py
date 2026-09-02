"""Automated banner check: every Assist Manager screen must render the
reference gradient banner (hero-surface), with the danger variant only on
Emergency Stop. Also asserts basic banner accessibility:
labelled section, single h1, aria-hidden decorative layers.

Run: python3 tests/banner_routes_test.py  (dev server on :8080)
"""

import asyncio
import os
import sys

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")

SECTIONS = [
    ("assist_dashboard", "Assist Dashboard", "default"),
    ("active_sessions", "Active Sessions", "default"),
    ("create_assist", "Create Assist", "default"),
    ("session_requests", "Session Requests", "default"),
    ("pending_approval", "Pending Approval", "default"),
    ("live_assist", "Live Assist", "default"),
    ("screen_control", "Screen Control", "default"),
    ("file_transfer", "File Transfer", "default"),
    ("chat_voice", "Chat / Voice", "default"),
    ("privacy_controls", "Privacy Controls", "default"),
    ("device_access", "Device Access", "default"),
    ("session_logs", "Session Logs", "default"),
    ("ai_assist_layer", "AI Assist Layer", "default"),
    ("emergency_stop", "Emergency Stop", "danger"),
    ("settings", "Settings", "default"),
]

results = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS " if ok else "FAIL ") + name + (f" — {detail}" if detail and not ok else ""))


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_selector("[data-am-banner]", timeout=30000)

        for section, label, tone in SECTIONS:
            await page.evaluate(
                "s => window.localStorage.setItem('am.section', JSON.stringify(s))", section
            )
            btn = page.get_by_role("button", name=label, exact=False).first
            try:
                await btn.click(timeout=5000)
            except Exception as exc:  # navigation via sidebar failed
                check(f"{section}: navigable", False, str(exc)[:120])
                continue

            banner = page.locator("[data-am-banner]")
            try:
                await banner.first.wait_for(state="visible", timeout=5000)
            except Exception:
                check(f"{section}: banner renders", False, "no [data-am-banner]")
                continue

            count = await banner.count()
            check(f"{section}: exactly one banner", count == 1, f"found {count}")

            info = await banner.first.evaluate(
                """el => ({
                    tone: el.dataset.bannerTone,
                    hero: el.classList.contains('hero-surface'),
                    danger: el.classList.contains('hero-surface--danger'),
                    labelled: !!el.getAttribute('aria-labelledby'),
                    heading: el.querySelector('h1')?.textContent?.trim() || '',
                    h1s: el.querySelectorAll('h1').length,
                    gradient: getComputedStyle(el).backgroundImage,
                    decor: [...el.querySelectorAll('.blur-3xl')].every(d => d.getAttribute('aria-hidden') === 'true'),
                    hiddenIcons: [...el.querySelectorAll('svg')].every(s => s.getAttribute('aria-hidden') === 'true' || s.closest('button,a')),
                })"""
            )
            check(f"{section}: gradient hero surface", info["hero"] and "gradient" in info["gradient"])
            check(f"{section}: tone={tone}", info["tone"] == tone and info["danger"] == (tone == "danger"))
            check(f"{section}: banner has heading", info["h1s"] == 1 and len(info["heading"]) > 0, info["heading"])
            check(f"{section}: banner labelled by heading", info["labelled"])
            check(f"{section}: decorative layers aria-hidden", info["decor"])
            check(f"{section}: banner icons aria-hidden", info["hiddenIcons"])

        check("no runtime errors", not errors, "; ".join(errors)[:200])
        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)} passed, {len(failed)} failed")
    sys.exit(1 if failed else 0)


asyncio.run(main())
