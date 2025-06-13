import streamlit as st
import fitz  # PyMuPDF
import docx2txt
import json
import datetime
import google.generativeai as genai
import io

# Configure Gemini API key
genai.configure(api_key="AIzaSyBxTR_8EDXy5muyAyKN9VGOo4kbPY2osnQ")

def extract_text_from_pdf(file):
    try:
        pdf = fitz.open(stream=file.read(), filetype="pdf")
        text = "".join(page.get_text() for page in pdf)
        pdf.close()
        return text
    except Exception as e:
        st.error(f"❌ Error reading PDF: {e}")
        return None

def extract_text_from_docx(file):
    try:
        file_bytes = io.BytesIO(file.read())
        text = docx2txt.process(file_bytes)
        return text
    except Exception as e:
        st.error(f"❌ Error reading DOCX: {e}")
        return None

def extract_text_from_txt(file):
    try:
        return file.read().decode("utf-8")
    except Exception as e:
        st.error(f"❌ Error reading TXT: {e}")
        return None

def extract_text(uploaded_file):
    if uploaded_file.type == "application/pdf":
        return extract_text_from_pdf(uploaded_file)
    elif uploaded_file.type in [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ]:
        return extract_text_from_docx(uploaded_file)
    elif uploaded_file.type == "text/plain":
        return extract_text_from_txt(uploaded_file)
    else:
        st.error("❌ Unsupported file type. Please upload PDF, DOCX, or TXT.")
        return None

def safe_get(d, keys, default=None):
    for key in keys:
        if isinstance(d, dict):
            d = d.get(key, default)
        else:
            return default
    return d

def analyze_resume(resume_text):
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
    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    response = model.generate_content(prompt)
    cleaned = response.text.strip()
    for token in ["``````", "`json", "`"]:
        cleaned = cleaned.replace(token, "")
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        try:
            fixed = cleaned.replace("'", '"')
            return json.loads(fixed)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON response: {e}\nResponse:\n{cleaned}")

# Streamlit UI
st.set_page_config(page_title="📄 Smart Resume Analyzer", page_icon="📄", layout="wide")

st.markdown(
    """
    <h1 style="text-align:center; color:#4B8BBE;">📄 Smart Resume Analyzer</h1>
    <p style="text-align:center; font-size:18px; color:#306998;">
    Upload your resume (PDF, DOCX, TXT) and get detailed, structured insights instantly.
    </p>
    """,
    unsafe_allow_html=True,
)

uploaded_file = st.file_uploader("📎 Upload Resume (PDF, DOCX, TXT)", type=["pdf", "docx", "txt"])

if st.button("🚀 Analyze Resume"):
    if not uploaded_file:
        st.error("❌ Please upload a file before analyzing.")
    else:
        with st.spinner("🔍 Extracting and analyzing resume..."):
            resume_text = extract_text(uploaded_file)
            if resume_text:
                try:
                    result = analyze_resume(resume_text)
                    st.success("✅ Analysis Complete!")

                    st.markdown(f"<h2 style='color:#2E8B57;'>👤 {safe_get(result, ['name'], 'N/A')}</h2>", unsafe_allow_html=True)

                    col1, col2 = st.columns(2)

                    with col1:
                        st.markdown("### 📞 Contact Information")
                        contact = safe_get(result, ['contact_information'], {})
                        st.markdown(f"- 📧 Email: {contact.get('email', 'N/A')}")
                        st.markdown(f"- 📱 Phone: {contact.get('phone', 'N/A')}")
                        st.markdown(f"- 🔗 LinkedIn: {contact.get('linkedin', 'N/A')}")

                    with col2:
                        st.markdown("### 🛠️ Skills")
                        skills = safe_get(result, ['skills'], [])
                        if skills:
                            st.write(", ".join(skills))
                        else:
                            st.write("N/A")

                    st.markdown("### 📝 Summary")
                    st.write(safe_get(result, ['summary'], 'N/A'))

                    with st.expander("💼 Work Experience", expanded=False):
                        work_exp = safe_get(result, ['work_experience'], [])
                        if work_exp:
                            for i, job in enumerate(work_exp, 1):
                                st.markdown(f"**{i}. {job.get('job_title', 'N/A')} at {job.get('company', 'N/A')}**")
                                st.markdown(f"- Duration: {job.get('duration', 'N/A')}")
                                st.markdown(f"- Responsibilities: {job.get('responsibilities', 'N/A')}")
                        else:
                            st.write("N/A")

                    with st.expander("🎓 Education", expanded=False):
                        education = safe_get(result, ['education'], [])
                        if education:
                            for i, edu in enumerate(education, 1):
                                st.markdown(f"**{i}. {edu.get('degree', 'N/A')} from {edu.get('institution', 'N/A')}**")
                                st.markdown(f"- Graduation Year: {edu.get('graduation_year', 'N/A')}")
                        else:
                            st.write("N/A")

                    st.markdown("### 📊 Overall Summary")
                    st.write(safe_get(result, ['overall_summary'], 'N/A'))

                    st.markdown(f"### 🎯 Suitability Score: {safe_get(result, ['suitability_score'], 'N/A')} / 100")

                    json_str = json.dumps(result, indent=2)
                    st.download_button(
                        label="📥 Download Analysis JSON",
                        data=json_str,
                        file_name="resume_analysis.json",
                        mime="application/json"
                    )

                except Exception as e:
                    st.error(f"❌ Failed to analyze resume: {e}")

st.caption(f"© {datetime.datetime.now().year} Victor Vengatesh")
