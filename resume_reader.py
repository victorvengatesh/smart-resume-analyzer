import streamlit as st

# Page config
st.set_page_config(page_title="Resume Extractor", page_icon="📄", layout="wide")

# Title and header
st.title("Resume Text Extractor 📝")
st.markdown("Upload your resume PDF file and get Skills, Education, Experience extracted automatically.")

# Sidebar
with st.sidebar:
    st.header("Help")
    st.markdown("""
    - Upload a PDF resume file  
    - Wait for extraction  
    - View Skills, Education & Experience sections  
    - Contact: victor@example.com  
    """)

# File uploader
uploaded_file = st.file_uploader("Upload your resume (PDF format)", type=["pdf"])

if uploaded_file is not None:
    # Here you call your extraction function, e.g.
    # text = extract_resume_text(uploaded_file)
    # skills, education, experience = extract_sections(text)

    # For example, dummy extracted data:
    skills = ["Python", "Machine Learning", "Data Analysis"]
    education = "B.Tech in Computer Science, XYZ University"
    experience = "2 years at ABC Corp as Data Scientist"

    # Layout with columns
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Skills 💡")
        st.write(", ".join(skills))

    with col2:
        st.subheader("Education 🎓")
        st.write(education)

    st.subheader("Experience 💼")
    st.write(experience)

else:
    st.info("Please upload your resume to start extraction.")

# Footer or extra info
st.markdown("---")
st.markdown("Made with ❤️ by Victor")
