import streamlit as st
import fitz  # PyMuPDF
import json
import datetime
import openai

# --- API Key ---
openai.api_key = "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"

# --- Extract text from PDF ---
def extract_text_from_pdf(uploaded_file):
    pdf = fitz.open(stream=uploaded_file.read(), filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    pdf.close()
    return text

# --- Resume Analysis via GPT (new SDK) ---
def analyze_resume(resume_text):
    client = openai.OpenAI()

    prompt = f"""
You are a smart resume assistant. Analyze the following resume and return a structured JSON with:
- name
- contact_information (email, phone, linkedin)
- summary
- work_experience (job_title, company, duration, responsibilities)
- education (degree, institution, graduation_year)
- skills
- overall_summary
- suitability_score (0-100)

Resume:
{resume_text}

Respond only with a valid JSON.
"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )
    content = response.choices[0].message.content
    return json.loads(content)

# --- Streamlit UI ---
st.set_page_config(page_title="Smart Resume Analyzer", page_icon="📄")
st.title("📄 Smart Resume Analyzer")
st.markdown("Upload a resume in PDF format to receive structured insights.")

uploaded_file = st.file_uploader("📎 Upload Resume (PDF)", type="pdf")

if st.button("🚀 Analyze Resume"):
    if not uploaded_file:
        st.error("Please upload a PDF file.")
    else:
        with st.spinner("Analyzing resume..."):
            resume_text = extract_text_from_pdf(uploaded_file)
            try:
                result = analyze_resume(resume_text)
                st.success("✅ Analysis Complete!")
                st.subheader(f"👤 Candidate: {result.get('name', 'N/A')}")
                st.json(result)
            except Exception as e:
                st.error(f"❌ Failed to analyze resume: {e}")

st.caption(f"© {datetime.datetime.now().year} Victor Vengatesh")
