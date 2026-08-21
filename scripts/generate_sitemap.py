#!/usr/bin/env python3
"""
Nart Gaz - Otomatik sitemap.xml üretici.

Repo kökündeki ve products/ altındaki tüm .html sayfalarını tarar,
blog-posts.json'dan blog yazılarının yayın tarihini, diğer sayfalar için
git commit geçmişinden son değişiklik tarihini alır ve standart
sitemap.xml (https://www.sitemaps.org/protocol.html) formatında yazar.

Elle çalıştırma: python3 scripts/generate_sitemap.py
Normalde .github/workflows/sitemap.yml tarafından otomatik çalıştırılır.
"""
import json
import os
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

DOMAIN = "https://nartgaz.com"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Sitemap'e dahil edilmeyecek dosya adları (tam eşleşme)
EXCLUDE_FILES = {
    "nart-blog-yayinlayici.html",  # herkese açık olmayan iç araç
    "404.html",
}

# Sitemap'e dahil edilmeyecek klasörler
EXCLUDE_DIRS = {
    "assets", "components", ".git", ".github", "node_modules", "sitemap-otomasyon",
}

# Her sayfa türü için varsayılan changefreq / priority
def page_meta(rel_path):
    if rel_path == "index.html":
        return "weekly", "1.0"
    if rel_path == "blog.html":
        return "daily", "0.8"
    if rel_path.startswith("blog/") and rel_path.endswith(".html"):
        return "monthly", "0.7"
    if rel_path.startswith("products/"):
        return "monthly", "0.7"
    if rel_path == "products.html":
        return "weekly", "0.8"
    return "monthly", "0.6"


def find_html_files():
    files = []
    for root, dirs, filenames in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
        for fn in filenames:
            if not fn.endswith(".html") or fn in EXCLUDE_FILES:
                continue
            rel = os.path.relpath(os.path.join(root, fn), REPO_ROOT).replace(os.sep, "/")
            files.append(rel)
    return sorted(files)


def git_lastmod(rel_path):
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI", "--", rel_path],
            cwd=REPO_ROOT, stderr=subprocess.DEVNULL,
        ).decode().strip()
        return out[:10] if out else None
    except Exception:
        return None


def load_blog_dates():
    dates = {}
    path = os.path.join(REPO_ROOT, "blog-posts.json")
    if not os.path.exists(path):
        return dates
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    try:
        with open(path, encoding="utf-8") as f:
            posts = json.load(f)
        for p in posts:
            slug = p.get("slug")
            date = p.get("date")
            if slug and date:
                dates["blog/" + slug + ".html"] = {"date": date[:10], "scheduled": date[:10] > today}
    except Exception:
        pass
    return dates


def build_sitemap():
    blog_dates = load_blog_dates()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for rel_path in find_html_files():
        blog_info = blog_dates.get(rel_path)
        if blog_info and blog_info["scheduled"]:
            # İleri tarihli (henüz yayın zamanı gelmemiş) yazı: arama motorlarına
            # şimdiden gösterme, tarih gelince bir sonraki çalıştırmada otomatik eklenir.
            continue

        loc = DOMAIN + "/" + ("" if rel_path == "index.html" else rel_path)
        lastmod = (blog_info["date"] if blog_info else None) or git_lastmod(rel_path) or today
        changefreq, priority = page_meta(rel_path)

        url_el = ET.SubElement(urlset, "url")
        ET.SubElement(url_el, "loc").text = loc
        ET.SubElement(url_el, "lastmod").text = lastmod
        ET.SubElement(url_el, "changefreq").text = changefreq
        ET.SubElement(url_el, "priority").text = priority

    tree = ET.ElementTree(urlset)
    try:
        ET.indent(tree, space="  ")  # Python 3.9+
    except AttributeError:
        pass
    out_path = os.path.join(REPO_ROOT, "sitemap.xml")
    tree.write(out_path, encoding="UTF-8", xml_declaration=True)
    print(f"sitemap.xml yazıldı: {out_path} ({len(urlset)} URL)")


if __name__ == "__main__":
    build_sitemap()
