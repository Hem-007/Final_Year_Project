import pandas as pd

df = pd.read_csv('scraped_output.csv')

print("="*80)
print("SCRAPED RESULTS")
print("="*80)
print(f"\nTotal URLs scrapped: {len(df)}\n")

for i, row in df.iterrows():
    print(f"\n{'='*80}")
    print(f"URL {i+1}: {row['url']}")
    print(f"Title: {row['title']}")
    print(f"\nText Content:\n{row['text'][:500]}...")
    print(f"{'='*80}")

# Save to Excel
df.to_excel('scraped_output.xlsx', index=False, engine='openpyxl')
print("\n✅ Excel file updated: scraped_output.xlsx")
