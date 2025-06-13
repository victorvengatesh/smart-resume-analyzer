import streamlit as st
import requests
import base64
import fitz  # PyMuPDF
import json
import google.generativeai as genai
import datetime

# --- GitHub Config ---
GITHUB_USERNAME = "victor"  # your GitHub username
REPO_NAME = "secrets"       # your repo name
FILE_PATH = "api_key.txt"   # file inside the repo
GITHUB_TOKEN = "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"

# --- Load API key from GitHub ---
def load_api_key_from_github():
    url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{REPO_NAME}/contents/{FILE_PATH}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        content_base64 = response.json()["content"]
        return base64.b64decode(content_base64).decode("utf-8").strip()
    else:
        st.error(f"Failed to load API key. GitHub returned: {response.status_code}")
        return None

# --- Extract text from PDF ---
def extract_text_from_pdf(uploaded_file):
    pdf = fitz.open(stream=uploaded_file.read(), filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    pdf.close()
    return text

# --- Get response from Gemini API ---
def get_gemini_response(api_key, resume_text):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
You are an expert resume analyzer. Analyze this resume text and return a structured JSON with:
- name
- contact_information: email, phone, linkedin
- summary
- work_experience: list of jobs with job_title, company, duration, responsibilities
- education: list with degree, institution, graduation_year
- skills
- overall_summary
- suitability_score (0-100)

Resume:
{resume_text}

Respond only with a valid JSON object.
"""
        response = model.generate_content(prompt)
        cleaned = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned)
    except Exception as e:
        st.error(f"Error: {e}")
        return None

# --- Streamlit UI ---
st.set_page_config(page_title="Resume Analyzer", page_icon="📄")
st.title("📄 Smart Resume Analyzer (using Gemini + GitHub API key)")

uploaded_file = st.file_uploader("Upload your resume PDF", type="pdf")
if st.button("Analyze"):
    if not uploaded_file:
        st.error("Please upload a resume.")
    else:
        api_key = load_api_key_from_github()
        if api_key:
            with st.spinner("Analyzing resume..."):
                resume_text = extract_text_from_pdf(uploaded_file)
                data = get_gemini_response(api_key, resume_text)
                if data:
                    st.success("✅ Resume analyzed successfully!")
                    st.json(data)

st.caption(f"© {datetime.datetime.now().year} Victor Vengatesh")
