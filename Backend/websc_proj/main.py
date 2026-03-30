
import pandas as pd
from scraper import scrape_url

def load_urls(file_path):
    """Load URLs from file, filtering empty lines."""
    with open(file_path, "r") as f:
        urls = [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]
    return urls

def main():
    print("Loading URLs...")
    urls = load_urls("urls.txt")
    
    if not urls:
        print("No URLs found in urls.txt")
        return
    
    print(f"Found {len(urls)} URLs to scrape\n")
    results = []
    failed_count = 0
    success_count = 0

    for i, url in enumerate(urls, 1):
        # Validate URL format
        if not url.startswith("http"):
            url = "https://" + url
            
        print(f"[{i}/{len(urls)}] Scraping: {url}")
        
        # Increase delay between requests to avoid rate limiting (2 seconds)
        data = scrape_url(url, delay=2)
        results.append(data)
        
        if "Error" in data["title"] or "Failed" in data["title"] or "Connection" in data["title"]:
            failed_count += 1
        else:
            success_count += 1
        
        print(f"  Status: {data['title']}\n")

    df = pd.DataFrame(results)
    df.to_csv("scraped_output.csv", index=False)

    print("\n" + "="*50)
    print("Scraping complete!")
    print(f"Success: {success_count}/{len(urls)}")
    print(f"Failed: {failed_count}/{len(urls)}")
    print("Results saved to scraped_output.csv")
    print("="*50)

if __name__ == "__main__":
    main()
