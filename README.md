# Smart Resume Analyzer (Streamlit Version)

This application uses Google's Gemini AI to extract and analyze key information from resumes provided in PDF format. It's a Python/Streamlit re-implementation of the original React project.

## Prerequisites
- Python 3.8 or newer
- A Google AI API Key. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

## How to Run

1.  **Unzip the Folder**: Extract the contents of the zip file into a new directory.

2.  **Open a Terminal**: Navigate into the extracted directory.
    ```bash
    cd path/to/smart-resume-analyzer-streamlit
    ```

3.  **Create a Virtual Environment** (Recommended):
    ```bash
    # For Windows
    python -m venv venv
    venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

4.  **Install Dependencies**: Install the required Python packages.
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the App**: Start the Streamlit server.
    ```bash
    streamlit run app.py
    ```

Your web browser should automatically open with the application running.

## How to Use

1.  Enter your Google AI API Key in the sidebar on the left.
2.  Upload a resume in PDF format.
3.  Click the "Analyze Resume" button.
4.  Wait for the analysis to complete and view the structured results.