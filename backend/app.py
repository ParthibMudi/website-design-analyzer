import os
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from playwright.sync_api import sync_playwright
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})



# Initialize Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Model initialization with fallback
try:
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    print("Using model: gemini-1.5-pro-latest")
except Exception as e:
    try:
        model = genai.GenerativeModel('gemini-pro')
        print("Using model: gemini-pro")
    except Exception as e:
        print(f"Failed to initialize model: {str(e)}")
        model = None

def take_screenshot(url):
    """Capture screenshot of a website"""
    os.makedirs('screenshots', exist_ok=True)
    filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    filepath = f"screenshots/{filename}"
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url, timeout=15000)
            page.screenshot(path=filepath, full_page=True)
            browser.close()
        return filename
    except Exception as e:
        raise Exception(f"Screenshot failed: {str(e)}")

@app.route('/test')
def test_connection():
    """Test endpoint for backend connectivity"""
    return jsonify({"status": "Backend is running"})

@app.route('/models')
def list_available_models():
    """List available Gemini models"""
    try:
        return jsonify({"models": [m.name for m in genai.list_models()]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/process', methods=['POST'])
def process_url():
    """Process URL and capture screenshot"""
    try:
        if not model:
            return jsonify({"error": "AI model not available"}), 503
            
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
            
        filename = take_screenshot(url)
        return jsonify({
            "success": True,
            "screenshot_url": f"/download/{filename}",
            "filename": filename
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download/<filename>')
def download_file(filename):
    """Download screenshot endpoint"""
    try:
        return send_file(
            f"screenshots/{filename}",
            as_attachment=True,
            mimetype='image/png',
            download_name=filename
        )
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

@app.route('/analyze', methods=['POST'])
def analyze_website():
    """Analyze website using Gemini AI"""
    try:
        if not model:
            return jsonify({"error": "AI model not available"}), 503
            
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
            
        prompt = f"""
        Analyze the design of this website: {url}
        Provide:
        1. Specific visual improvements (bullet points)
        2. Score out of 10 with detailed reasoning
        3. Technical recommendations
        4. Suggested color palette
        5. Typography suggestions
        """
        
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 1,
                "top_k": 32,
                "max_output_tokens": 4096,
            }
        )
        return jsonify({
            "success": True,
            "analysis": response.text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-code', methods=['POST'])
def generate_website_code():
    """Generate website code using Gemini AI"""
    try:
        if not model:
            return jsonify({"error": "AI model not available"}), 503
            
        data = request.get_json()
        url = data.get('url')
        tech_stack = data.get('techStack', 'React')
        custom_prompt = data.get('customPrompt', '')
        
        base_prompt = f"""
        Generate complete {tech_stack} code for a website similar to: {url}
        Include:
        1. All necessary components/files
        2. Modern styling (CSS-in-JS if applicable)
        3. Responsive layout
        4. Clean, production-ready code
        5. Proper component structure
        """
        
        full_prompt = f"{base_prompt}\n\nAdditional user suggestions: {custom_prompt}\n\n" + \
        """Output format should be:
        ```jsx
        // React components here
        ```
        ```css
        /* Styles here */
        ```
        """
        
        response = model.generate_content(
            full_prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 1,
                "top_k": 32,
                "max_output_tokens": 4096,
            }
        )
        return jsonify({
            "success": True,
            "code": response.text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)