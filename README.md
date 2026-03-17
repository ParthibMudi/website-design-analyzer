AI Web Designer & Analyzer
An AI-powered tool designed to analyze website front-ends and provide actionable design improvements. By simply pasting a URL, the application captures a full-page screenshot, analyzes the visual hierarchy using Google Gemini, and generates optimized React code based on AI recommendations and user-specific customizations.

🚀 Features
URL Analysis: Enter any website link to initiate a deep design audit [00:00].

Automated Screenshotting: The backend automatically visits the target website and captures a high-resolution, full-page screenshot [00:15].

AI-Powered Insights: Utilizes Gemini AI to provide visual analysis, technical recommendations, and optimized color palettes [00:52].

Instant Code Generation: Automatically generates front-end code (React) based on the AI's design suggestions [01:06].

Custom Prompting: Users can provide specific instructions (e.g., "Use a green theme" or "Use less text") to tailor the generated code [01:26].

Iterative Code Modification: Refine the generated code through follow-up suggestions to achieve the perfect look and feel [01:53].

🛠️ Tech Stack
Frontend: React [02:30]

Backend: Flask [02:30]

AI Engine: Google Gemini [00:24]

Tools: Screenshot automation for web analysis

📖 How It Works
Input: Paste the URL of the website you want to analyze on the landing page [00:00].

Processing: The Flask backend visits the site, takes a screenshot, and sends it to the Gemini API [00:15].

Review: View the visual analysis and download the screenshot if needed [00:42].

Generate: Click "Generate Code" to receive React components based on the AI's suggestions [01:44].

Refine: Provide custom instructions to modify the code until it meets your requirements [02:13].

🏗️ Installation (Placeholder)
Bash
# Clone the repository
git clone https://github.com/your-username/hackathon-project.git

# Install Frontend dependencies
cd frontend
npm install

# Install Backend dependencies
cd ../backend
pip install -r requirements.txt

# Run the project
# Start Flask server
python app.py
# Start React app
npm start
👥 Contributors
Parthib Mudi - https://youtu.be/vicoEIEWkGM

Created for the Hackathon project showcase [02:30].

Video Demo: Watch here
