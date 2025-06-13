import streamlit as st
import fitz  # PyMuPDF
import io
from PIL import Image
import tempfile
import os
import json
import pytesseract
import google.generativeai as genai

# === IMPORTANT: Set this path to your installed tesseract.exe location ===
# Example Windows default install path:
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# On Linux or Mac, this line can be omitted if tesseract is in PATH

# Configure your Google Gemini API key
genai.configure(api_key="AIzaSyBxTR_8EDXy5muyAyKN9VGOo4kbPY2osnQ")

CUSTOM_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
html, body, [class*="css"]  {
    font-family: 'Inter', sans-serif;
    background: #f9fafb;
    color: #1f2937;
}
h1, h2, h3 {
    font-weight: 700;
    color: #2563eb;
    opacity: 0;
    animation: fadeInOut 3s ease forwards;
}
h1 {
    font-size: 2.5rem;
    margin-bottom: 0.2rem;
    animation-delay: 0.2s;
}
h2 {
    font-size: 1.75rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    animation-delay: 0.8s;
}
h3 {
    font-size: 1.2rem;
    animation-delay: 1.4s;
}
@keyframes fadeInOut {
    from {opacity: 0; transform: translateY(20px);}
    to {opacity: 1; transform: translateY(0);}
}
.image-container {
    display: flex;
    justify-content: center;
    margin: 1.5rem 0 1rem 0;
}
.candidate-photo {
    border-radius: 16px;
    box-shadow: 0 6px 24px rgba(37, 99, 235, 0.15);
    max-width: 320px;
    width: 100%;
    height: auto;
    animation: fadeInPhoto 2s ease forwards;
}
@keyframes fadeInPhoto {
    from {opacity: 0; transform: scale(0.95);}
    to {opacity: 1; transform: scale(1);}
}
.stButton > button {
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    transition: background-color 0.3s ease, transform 0.2s;
    box-shadow: 0 2px 8px rgba(37,99,235,0.08);
}
.stButton > button:hover {
    background-color: #1e40af;
    transform: translateY(-2px) scale(1.04);
}
.stExpander > div {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    padding: 0.75rem 1rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.css-1lcbmhc.e1fqkh3o3 > div {
    padding-right: 2rem;
}
"""

def extract_text_from_pdf(file):
    pdf = fitz.open(stream=file.read(), filetype="pdf")
    text = "".join(page.get_text() for page in pdf)
    pdf.close()
    return text

def extract_text_from_docx(file):
    import docx2txt
    import io
    file_bytes = io.BytesIO(file.read())
    text = docx2txt.process(file_bytes)
    return text

def extract_text_from_txt(file):
    return file.read().decode("utf-8")

def extract_text_from_jpg(file):
    try:
        image = Image.open(file)
        text = pytesseract.image_to_string(image)
        if not text.strip():
            st.warning("⚠️ No text detected in the JPG image.")
        return text
    except Exception as e:
        st.error(f"❌ OCR failed: {e}")
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
    elif uploaded_file.type == "image/jpeg":
        return extract_text_from_jpg(uploaded_file)
    else:
        st.error("❌ Unsupported file type. Please upload PDF, DOCX, TXT, or JPG.")
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
        fixed = cleaned.replace("'", '"')
        return json.loads(fixed)

def extract_first_image_from_pdf(pdf_path):
    pdf_doc = fitz.open(pdf_path)
    for page_num in range(len(pdf_doc)):
        page = pdf_doc[page_num]
        image_list = page.get_images(full=True)
        if image_list:
            xref = image_list[0][0]
            base_image = pdf_doc.extract_image(xref)
            image_bytes = base_image["image"]
            image = Image.open(io.BytesIO(image_bytes))
            pdf_doc.close()
            return image
    pdf_doc.close()
    return None

DEFAULT_BANNER_URL = "https://via.placeholder.com/320x320.png?text=No+Photo+Available"

st.set_page_config(page_title="Smart Resume Analyzer", page_icon="📄", layout="centered")

st.markdown(f"<style>{CUSTOM_CSS}</style>", unsafe_allow_html=True)

st.markdown('<h1 style="text-align:center;">📄 Smart Resume Analyzer</h1>', unsafe_allow_html=True)

uploaded_file = st.file_uploader("📎 Upload Resume (PDF, DOCX, TXT, JPG)", type=["pdf", "docx", "txt", "jpg"])

if st.button("🚀 Analyze Resume"):
    if not uploaded_file:
        st.error("❌ Please upload a resume file before analyzing.")
    else:
        candidate_image = None
        tmp_pdf_path = None

        if uploaded_file.type == "application/pdf":
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(uploaded_file.read())
                tmp_pdf_path = tmp_file.name
            candidate_image = extract_first_image_from_pdf(tmp_pdf_path)
            os.remove(tmp_pdf_path)
        elif uploaded_file.type == "image/jpeg":
            candidate_image = Image.open(uploaded_file)
        else:
            candidate_image = None

        with st.spinner("🔍 Extracting and analyzing resume..."):
            uploaded_file.seek(0)
            resume_text = extract_text(uploaded_file)

            if resume_text:
                try:
                    result = analyze_resume(resume_text)
                    st.success("✅ Analysis Complete!")

                    st.markdown('<div class="image-container">', unsafe_allow_html=True)
                    if candidate_image:
                        max_width = 320
                        w, h = candidate_image.size
                        if w > max_width:
                            new_height = int(h * max_width / w)
                            candidate_image = candidate_image.resize((max_width, new_height))
                        st.image(candidate_image, caption="Candidate Photo", use_container_width=False, output_format="PNG")
                    else:
                        st.image(DEFAULT_BANNER_URL, caption="No Photo Available", use_container_width=False, output_format="PNG")
                    st.markdown('</div>', unsafe_allow_html=True)

                    st.markdown(f"<h2>👤 {safe_get(result, ['name'], 'N/A')}</h2>", unsafe_allow_html=True)

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
