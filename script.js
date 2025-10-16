// Helper function to parse data URLs
function parseDataUrl(url) {
  if (!url.startsWith('data:')) {
    return null;
  }
  
  const parts = url.substring(5).split(',');
  const header = parts[0];
  const payload = parts[1] || '';
  
  const mimeParts = header.split(';');
  const mime = mimeParts[0] || 'text/plain';
  const isBase64 = mimeParts.includes('base64');
  
  let text = '';
  if (isBase64) {
    try {
      text = atob(payload);
    } catch (e) {
      console.error('Failed to decode base64:', e);
    }
  } else {
    text = decodeURIComponent(payload);
  }
  
  return { mime, isBase64, text };
}

// Helper function to decode base64 to text
function decodeBase64ToText(b64) {
  try {
    return atob(b64);
  } catch (e) {
    console.error('Base64 decoding error:', e);
    return '';
  }
}

// Tab switching functionality
function setupTabs() {
  const htmlTab = document.getElementById('tab-html');
  const sourceTab = document.getElementById('tab-source');
  const outputElement = document.getElementById('markdown-output');
  const sourceElement = document.getElementById('markdown-source');
  
  htmlTab.addEventListener('click', () => {
    htmlTab.classList.add('active');
    sourceTab.classList.remove('active');
    outputElement.style.display = 'block';
    sourceElement.style.display = 'none';
  });
  
  sourceTab.addEventListener('click', () => {
    sourceTab.classList.add('active');
    htmlTab.classList.remove('active');
    sourceElement.style.display = 'block';
    outputElement.style.display = 'none';
  });
}

// Main function to process markdown
async function processMarkdown() {
  const outputElement = document.getElementById('markdown-output');
  const sourceElement = document.getElementById('markdown-source');
  
  try {
    // Get the markdown file from attachments
    const attachment = {
      "name": "input.md",
      "url": "data:text/markdown;base64,aGVsbG8KIyBUaXRsZQ=="
    };
    
    let markdownContent = '';
    
    // Process the attachment based on its URL type
    if (attachment.url.startsWith('data:')) {
      const parsed = parseDataUrl(attachment.url);
      if (parsed && parsed.text) {
        markdownContent = parsed.text;
      }
    } else {
      // For HTTP URLs, fetch the content
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      markdownContent = await response.text();
    }
    
    if (!markdownContent) {
      throw new Error('No content found in markdown file');
    }
    
    // Store the original markdown content
    sourceElement.textContent = markdownContent;
    
    // Convert markdown to HTML using marked
    const htmlContent = marked.parse(markdownContent);
    
    // Set the HTML content
    outputElement.innerHTML = htmlContent;
    
    // Highlight code blocks if highlight.js is available
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  } catch (error) {
    console.error('Error processing markdown:', error);
    outputElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  processMarkdown();
  setupTabs();
});