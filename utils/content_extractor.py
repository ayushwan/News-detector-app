import requests
from urllib.parse import urlparse
import re
from bs4 import BeautifulSoup

def extract_from_url(url):
    """Extract title and content from a news URL"""
    try:
        # Add http if not present
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Set headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Make request with timeout
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title = extract_title(soup)
        
        # Extract content
        content = extract_content(soup)
        
        return title, content
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return None, None
    except Exception as e:
        print(f"Error parsing content: {e}")
        return None, None

def extract_title(soup):
    """Extract article title from HTML"""
    # Try different title selectors
    title_selectors = [
        'h1',
        '.headline',
        '.title',
        '[data-testid="headline"]',
        '.entry-title',
        '.post-title',
        '.article-title'
    ]
    
    for selector in title_selectors:
        title_elem = soup.select_one(selector)
        if title_elem:
            title = title_elem.get_text().strip()
            if title and len(title) > 10:  # Reasonable title length
                return title
    
    # Fallback to page title
    title_tag = soup.find('title')
    if title_tag:
        return title_tag.get_text().strip()
    
    return "Untitled Article"

def extract_content(soup):
    """Extract article content from HTML"""
    # Remove unwanted elements
    for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']):
        element.decompose()
    
    # Try different content selectors
    content_selectors = [
        '.article-content',
        '.entry-content',
        '.post-content',
        '.content',
        '[data-testid="article-body"]',
        '.story-body',
        '.article-body',
        'main'
    ]
    
    for selector in content_selectors:
        content_elem = soup.select_one(selector)
        if content_elem:
            content = extract_text_from_element(content_elem)
            if content and len(content) > 100:  # Reasonable content length
                return content
    
    # Fallback: extract from paragraphs
    paragraphs = soup.find_all('p')
    if paragraphs:
        content = '\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        if len(content) > 100:
            return content
    
    # Last resort: get all text
    return soup.get_text()

def extract_text_from_element(element):
    """Extract clean text from a BeautifulSoup element"""
    # Get all paragraphs within the element
    paragraphs = element.find_all('p')
    
    if paragraphs:
        # Join paragraph text
        text = '\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
    else:
        # If no paragraphs, get all text
        text = element.get_text()
    
    # Clean up the text
    text = re.sub(r'\s+', ' ', text)  # Replace multiple whitespace with single space
    text = re.sub(r'\n\s*\n', '\n', text)  # Replace multiple newlines with single newline
    
    return text.strip()

def is_valid_news_url(url):
    """Check if URL appears to be from a news source"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Common news domains patterns
        news_indicators = [
            'news', 'times', 'post', 'herald', 'tribune',
            'guardian', 'reuters', 'associated', 'press',
            'bbc', 'cnn', 'fox', 'nbc', 'abc', 'cbs'
        ]
        
        return any(indicator in domain for indicator in news_indicators)
    except:
        return False
