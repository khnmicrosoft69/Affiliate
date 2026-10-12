"""
Updates product links (and real prices) from scripts/product-links.csv.

How to use:
  1. Open scripts/product-links.csv in Excel or Google Sheets.
  2. For any product you've checked, fill in:
       "Real product link (paste here)"  the product page (or your affiliate link)
       "Real price (PHP)"                what the store shows today, e.g. 27499
       "Date checked"                    e.g. 2026-10-20 (leave empty to use today)
  3. Save it as CSV (same file name), then run:
       python scripts/import_links.py

What it does for each row:
  - Real link filled in  -> uses it, plus the real price and date.
  - Real link empty      -> uses the store search link (Shopee or Lazada,
                            whichever store the product is listed under).
"""

import csv
import datetime
import difflib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # the project folder
CSV_FILE = ROOT / "scripts" / "product-links.csv"
DATA_DIR = ROOT / "src" / "data" / "products"

# Category names in the spreadsheet -> data file names.
CATEGORY_FILES = {
    "Laptops": "laptop",
    "Tablets": "tablet",
    "Headphones & earbuds": "audio",
    "Monitors": "monitor",
    "Keyboards": "keyboard",
    "Mice": "mouse",
    "Power banks": "powerbank",
    "Chargers": "charger",
    "Smartwatches & bands": "smartwatch",
    "Bluetooth speakers": "speaker",
    "USB hubs & adapters": "hub",
    "Flash drives & storage": "portable",
    "Flash drives & portable storage": "portable",
    "Laptop bags & sleeves": "bag",
}


def simplify(name):
    """'Xiaomi Power Bank 20,000mAh (33W)' -> 'xiaomipowerbank20000mah33w' (for matching)."""
    return re.sub(r"[^a-z0-9]", "", name.lower())


def find_product(products, name):
    """Finds the product with this name, allowing small differences like missing commas."""
    wanted = simplify(name)
    by_simple = {simplify(p["name"]): p for p in products}
    if wanted in by_simple:
        return by_simple[wanted]
    close = difflib.get_close_matches(wanted, by_simple.keys(), n=1, cutoff=0.75)
    return by_simple[close[0]] if close else None


def main():
    today = datetime.date.today().isoformat()
    # utf-8-sig: ignores the invisible marker Excel puts at the start of CSV files
    rows = list(csv.DictReader(open(CSV_FILE, encoding="utf-8-sig", newline="")))

    files = {}  # data file name -> list of products (loaded once, saved at the end)
    real, search, problems = 0, 0, []

    for row in rows:
        cat = CATEGORY_FILES.get(row["Category"].strip())
        if not cat:
            problems.append(f"Unknown category: {row['Category']!r} ({row['Product']})")
            continue
        if cat not in files:
            files[cat] = json.load(open(DATA_DIR / f"{cat}.json", encoding="utf-8"))
        product = find_product(files[cat], row["Product"])
        if product is None:
            problems.append(f"No product named {row['Product']!r} in {cat}.json")
            continue

        real_link = row.get("Real product link (paste here)", "").strip()
        if real_link:
            product["link"] = real_link
            price = re.sub(r"[^0-9.]", "", row.get("Real price (PHP)", ""))  # "₱27,499" -> "27499"
            if price:
                product["price"] = round(float(price))
            product["lastChecked"] = row.get("Date checked", "").strip() or today
            real += 1
        else:
            column = "Shopee search" if product["store"] == "Shopee" else "Lazada search"
            product["link"] = row[column].strip()
            search += 1

    for cat, products in files.items():
        with open(DATA_DIR / f"{cat}.json", "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
            f.write("\n")

    print(f"Real product links: {real}")
    print(f"Store search links: {search}")
    for p in problems:
        print("PROBLEM:", p)


if __name__ == "__main__":
    main()
