import os
import json
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from PIL import Image
import io
import PyPDF2
import base64

app = FastAPI(title="Loan Recommendation API with OCR", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("API_KEY not found in environment variables")

genai.configure(api_key=API_KEY)

LOAN_PRODUCTS = [
  {
    "bank": "State Bank of India",
    "interest_rate": "8.30%–11.50%",
    "loan_amount": "Up to ₹3 crore",
    "collateral": "Not required up to ₹7.5 lakh; required above",
    "documents": ["Admission letter", "Previous marksheets", "Cost estimate", "KYC", "Co-applicant details"],
    "credit_score": "Co-applicant CIBIL 685+ preferred",
    "repayment": "Moratorium, then up to 15 years",
    "special": "Global Ed-Vantage scheme"
  },
  {
    "bank": "Punjab National Bank",
    "interest_rate": "8.55%–11.25%",
    "loan_amount": "Up to ₹1 crore",
    "collateral": "None up to ₹7.5 lakh; otherwise, tangible security",
    "documents": ["Admission proof", "Mark sheets", "Co-applicant"],
    "credit_score": "Co-borrower's credit profile considered",
    "repayment": "Moratorium, then 15 years",
    "special": None
  },
  {
    "bank": "Bank of Baroda",
    "interest_rate": "9.10%–12.45%",
    "loan_amount": "Up to ₹80 lakh (abroad)",
    "collateral": "None up to ₹7.5 lakh, security above",
    "documents": ["Admission letter", "Past marksheets"],
    "credit_score": "Co-applicant or collateral",
    "repayment": "Moratorium, then 15 years",
    "special": None
  },
  {
    "bank": "ICICI Bank",
    "interest_rate": "9.50% onwards",
    "loan_amount": "Up to ₹2 crore",
    "collateral": "May be required for large amounts",
    "documents": ["Admission letter", "KYC", "Co-applicant"],
    "credit_score": "Co-applicant or collateral",
    "repayment": "Moratorium, then 10-15 years",
    "special": None
  },
  {
    "bank": "Bank of India",
    "interest_rate": "8.25%–11.60%",
    "loan_amount": "Up to ₹1 crore",
    "collateral": "None up to ₹7.5 lakh; tangible security above",
    "documents": ["Merit/admission letter", "Past marksheets"],
    "credit_score": "Co-applicant/collateral",
    "repayment": "Moratorium, then 15 years",
    "special": None
  },
  {
    "bank": "Canara Bank",
    "interest_rate": "7.30%–10.85%",
    "loan_amount": "Up to ₹1 crore",
    "collateral": "Not required up to ₹7.5 lakh; otherwise tangible security",
    "documents": ["Admission", "Academic proofs", "Co-applicant"],
    "credit_score": "Co-applicant's CIBIL used",
    "repayment": "Moratorium, then 15 years",
    "special": None
  },
  {
    "bank": "Bank of Maharashtra",
    "interest_rate": "7.60%–11.05%",
    "loan_amount": "Up to ₹20-40 lakh",
    "collateral": "Not required up to ₹7.5 lakh; above: collateral",
    "documents": ["Fee schedule", "Marksheets", "Co-applicant", "Account proof"],
    "credit_score": "Co-applicant preferred",
    "repayment": "Moratorium, then 15 years",
    "special": None
  },
  {
    "bank": "Axis Bank",
    "interest_rate": "13.70%–15.20%",
    "loan_amount": "Up to ₹40 lakh",
    "collateral": "May not be required for select institutes",
    "documents": ["Academic proofs", "Co-applicant"],
    "credit_score": "Applicant & co-applicant scored",
    "repayment": "Moratorium, then up to 10-15 years",
    "special": None
  },
  {
    "bank": "HDFC Bank",
    "interest_rate": "9.50% onwards",
    "loan_amount": "Up to ₹50-150 lakh",
    "collateral": "May not be needed for select institutes",
    "documents": ["Admission", "Academic", "Cost", "Co-applicant"],
    "credit_score": "Co-applicant preferred",
    "repayment": "Moratorium, then max 15 years",
    "special": None
  },
  {
    "bank": "Central Bank of India",
    "interest_rate": "8.30%–11.25%",
    "loan_amount": "Up to ₹50 lakh",
    "collateral": "Required above ₹7.5 lakh",
    "documents": ["Admission", "Proof of expenses", "Past records"],
    "credit_score": "Co-applicant preferred",
    "repayment": "Moratorium, then max 15 years",
    "special": None
  }
]

class StudentProfile(BaseModel):
    name: str
    dob: str
    college: str
    course: str
    cgpa: float
    loanAmount: int
    familyIncome: int

@app.get("/loans")
async def get_loan_products():
    """
    Return all available loan products
    """
    return {"loans": LOAN_PRODUCTS}

@app.post("/ocr")
async def extract_student_data(file: UploadFile = File(...)):
    """
    Upload a student document (ID card, marksheet, PDF, etc.)
    → Extract structured details using Gemini Vision OCR.
    """
    try:
        print(f"📥 Received file: {file.filename}")
        print(f"📋 Content type: {file.content_type}")
        
        file_bytes = await file.read()
        print(f"📊 File size: {len(file_bytes)} bytes")
        
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        if file.content_type == "application/pdf":
            print("📄 Processing PDF file...")
            
            try:
                pdf_part = {
                    "mime_type": "application/pdf",
                    "data": base64.b64encode(file_bytes).decode('utf-8')
                }
                
                ocr_prompt = """
                You are analyzing a student document (ID card, marksheet, or admission letter) in PDF format.
                
                Extract and return ONLY this JSON (no extra text):
                {
                  "name": "student full name",
                  "dob": "date of birth",
                  "college": "college/university name",
                  "course": "course/program name",
                  "batch": "batch/year",
                  "cgpa": "CGPA or percentage"
                  "loanAmount": "loan amount needed in INR"
                  "familyIncome": "family annual income in INR"
                }

                Rules:
                - Extract exactly what you see
                - If a field is not visible, use empty string ""
                - Return pure JSON only, no markdown, no explanations
                """
                
                print("🤖 Sending PDF to Gemini...")
                model = genai.GenerativeModel('gemini-2.5-flash')
                
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                    tmp_file.write(file_bytes)
                    tmp_path = tmp_file.name
                
                try:
                    uploaded_file = genai.upload_file(tmp_path, mime_type="application/pdf")
                    
                    import time
                    while uploaded_file.state.name == "PROCESSING":
                        print("⏳ Waiting for PDF processing...")
                        time.sleep(2)
                        uploaded_file = genai.get_file(uploaded_file.name)
                    
                    if uploaded_file.state.name == "FAILED":
                        raise ValueError("PDF processing failed")
                    
                    print("✅ PDF uploaded and processed")
                    
                    response = model.generate_content(
                        [ocr_prompt, uploaded_file],
                        generation_config=genai.types.GenerationConfig(
                            temperature=0.1,
                        )
                    )
                finally:
                    os.unlink(tmp_path)
                
                print("📥 Received response from Gemini")
                
            except Exception as pdf_error:
                print(f"❌ PDF processing error: {pdf_error}")
                try:
                    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    
                    print(f"📝 Extracted text from PDF ({len(text)} chars)")
                    
                    ocr_prompt = f"""
                    Here is text extracted from a student document:
                    
                    {text}
                    
                    Extract and return ONLY this JSON:
                    {{
                      "name": "student full name",
                      "dob": "date of birth",
                      "college": "college/university name",
                      "course": "course/program name",
                      "batch": "batch/year",
                      "cgpa": "CGPA or percentage"
                      "loanAmount": "loan amount needed in INR"
                      "familyIncome": "family annual income in INR"
                    }}
                    
                    Return pure JSON only, no markdown.
                    """
                    
                    model = genai.GenerativeModel('gemini-2.5-flash')
                    response = model.generate_content(
                        ocr_prompt,
                        generation_config=genai.types.GenerationConfig(
                            temperature=0.1,
                        )
                    )
                    
                except Exception as fallback_error:
                    print(f"❌ PDF fallback also failed: {fallback_error}")
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Could not process PDF: {str(fallback_error)}"
                    )
        
        else:
            print("🖼️ Processing image file...")
            try:
                image = Image.open(io.BytesIO(file_bytes))
                if image.mode not in ('RGB', 'L'):
                    image = image.convert('RGB')
                print(f"✅ Image loaded: format={image.format}, mode={image.mode}, size={image.size}")
            except Exception as img_error:
                print(f"❌ Image processing error: {img_error}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid image file. Please upload JPG, PNG, or PDF. Error: {str(img_error)}"
                )
            
            ocr_prompt = """
            You are analyzing a student document (ID card, marksheet, or admission letter).
            
            Extract and return ONLY this JSON (no extra text):
            {
              "name": "student full name",
              "dob": "date of birth",
              "college": "college/university name",
              "course": "course/program name",
              "batch": "batch/year",
              "cgpa": "CGPA or percentage"
              "loanAmount": "loan amount needed in INR"
              "familyIncome": "family annual income in INR"
            }

            Rules:
            - Extract exactly what you see
            - If a field is not visible, use empty string ""
            - Return pure JSON only, no markdown, no explanations
            """

            print("🤖 Sending image to Gemini...")
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            response = model.generate_content(
                [ocr_prompt, image],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                )
            )
            
            print("📥 Received response from Gemini")
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from Gemini API")

        response_text = response.text.strip()
        print(f"📝 Raw response (first 500 chars):\n{response_text[:500]}")
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            parts = response_text.split("```")
            if len(parts) >= 2:
                response_text = parts[1].strip()

        print(f"🧹 Cleaned response:\n{response_text}")
        
        try:
            extracted_data = json.loads(response_text)
            print(f"✅ Successfully parsed JSON: {extracted_data}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            print(f"❌ Problematic text: {response_text}")
            raise HTTPException(
                status_code=500, 
                detail=f"Could not parse OCR response as JSON. Error: {str(e)}"
            )

        return {"extracted_data": extracted_data}

    except HTTPException as he:
        print(f"⚠️ HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}: {e}")
        import traceback
        print("📋 Full traceback:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


@app.post("/recommend")
async def recommend_loans(profile: StudentProfile):
    """
    Input: Student profile
    Output: Top 3 recommended loans (JSON)
    """
    try:
        # --------- Data sanitization to avoid 422 ---------
        try:
            cgpa = float(profile.cgpa) if profile.cgpa not in ["", None] else 0.0
        except:
            cgpa = 0.0

        try:
            loanAmount = int(profile.loanAmount)
        except:
            loanAmount = 0

        try:
            familyIncome = int(profile.familyIncome)
        except:
            familyIncome = 0

        # Safeguard: If any numeric field is zero, use fallback defaults
        if loanAmount <= 0:
            loanAmount = 500000
        if familyIncome <= 0:
            familyIncome = 300000

        lti = round(loanAmount / max(familyIncome, 1), 2)

        # --------- AI prompt ---------
        prompt_text = f"""
You are an experienced Indian education loan analyst. Evaluate the student's profile carefully and recommend the **TOP 3 banks** most suitable for an education loan.

STUDENT PROFILE:
- Name: {profile.name}
- DOB: {profile.dob}
- College: {profile.college}
- Course: {profile.course}
- CGPA: {cgpa}
- Loan Amount Needed: ₹{profile.loanAmount:,}
- Family Income: ₹{familyIncome:,}
- Loan-to-Income Ratio (LTI): {lti}

---------------------------------------------------
EVALUATION LOGIC:
Use these rules to decide eligibility and scoring.

1️⃣ **Academic Score (0–100)**
   - CGPA ≥ 9 → 100  
   - 8–9 → 85  
   - 7–8 → 70  
   - 6–7 → 50  
   - 5–6 → 30  
   - <5 → 10  

2️⃣ **Loan-to-Income Ratio (LTI = LoanAmount / FamilyIncome)**
   - LTI ≤ 1 → 90  
   - ≤2 → 80  
   - ≤3 → 70  
   - ≤5 → 50  
   - ≤10 → 30  
   - ≤20 → 15  
   - >20 → 5  

3️⃣ **Risk Adjustment**
   - If CGPA < 6 → −10 points  
   - If LTI > 10 → −20 points  
   - If LTI > 20 → −30 points  
   - If LoanAmount > 20L → −10 (collateral mandatory)  
   - If FamilyIncome < 3L → +5 if government/public bank, −10 for private  

4️⃣ **Bank Suitability**
   - Public banks (SBI, PNB, Canara, BoB, Union, Central Bank) = best for low income or low CGPA.  
   - Private banks (HDFC, ICICI, Axis) = only if strong profile and high CGPA.  
   - Penalize private banks for weak profiles.  
   - Favor government banks if CGPA < 7 or income < ₹5L.

5️⃣ **Final Score**
   Weighted = 0.4*(Academic) + 0.4*(LTI) + 0.2*(Suitability adjustments)
   Clamp between 0–100.
   Be very critical — weak profiles should get <45.

---------------------------------------------------
OUTPUT RULES:
Return **only** a pure JSON array with exactly 3 items. No markdown, no comments.
Each object must follow:

[
  {{
    "bank": "Bank Name",
    "match_reason": "Why this bank is suitable (50–100 words; mention CGPA, LTI, collateral, subsidy, risk)",
    "score": <integer 0–100>,
    "key_features": ["feature1", "feature2", "feature3"],
    "link": "https://..."
  }}
]
"""

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt_text)

        if not response or not response.text:
            raise HTTPException(status_code=500, detail="No response from Gemini model.")
        
        response_text = response.text.strip()

        # Clean JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            parts = response_text.split("```")
            if len(parts) >= 2:
                response_text = parts[1].strip()

        # Parse JSON safely
        try:
            result_json = json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            raise HTTPException(status_code=500, detail="Invalid JSON returned by Gemini")

        # Normalize output
        if isinstance(result_json, dict):
            result_json = [result_json]
        if not isinstance(result_json, list):
            raise ValueError("Invalid format: expected JSON array")

        return {"recommendations": result_json[:3]}

    except Exception as e:
        print(f"Recommendation error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


class ScholarshipQuery(BaseModel):
    course: str = ""
    college: str = ""
    cgpa: float = 0.0
    familyIncome: int = 0
    category: str = ""  # General, SC, ST, OBC, etc.


@app.post("/scholarships")
async def find_scholarships(query: ScholarshipQuery):
    """
    Find relevant scholarships using Gemini API based on student profile
    """
    try:
        prompt_text = f"""
You are an expert on Indian scholarships and financial aid for students. Based on the student profile below, recommend relevant scholarships they can apply for.

STUDENT PROFILE:
- Course: {query.course if query.course else "Any course"}
- College: {query.college if query.college else "Any college"}
- CGPA: {query.cgpa if query.cgpa > 0 else "Not specified"}
- Family Income: ₹{query.familyIncome:,} per year
- Category: {query.category if query.category else "General"}

TASK:
List scholarships that match this profile. Include both government and private scholarships.
Consider:
1. Merit-based scholarships (if CGPA is good)
2. Need-based scholarships (based on family income)
3. Category-specific scholarships (if applicable)
4. Course-specific scholarships
5. State and central government schemes
6. Corporate/private scholarships

OUTPUT FORMAT:
Return ONLY a pure JSON array with 8-12 scholarship options. No markdown, no comments.
Each object must include:

[
  {{
    "name": "Scholarship Name",
    "provider": "Organization/Government Body",
    "amount": "Award amount or range",
    "eligibility": "Key eligibility criteria",
    "deadline": "Application deadline or period",
    "category": "Merit/Need-based/Category-specific/Course-specific",
    "link": "Official website or application link",
    "description": "Brief description (2-3 sentences)"
  }}
]

Include real, well-known scholarships in India. Focus on currently active schemes.
"""

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt_text)

        if not response or not response.text:
            raise HTTPException(status_code=500, detail="No response from Gemini model.")
        
        response_text = response.text.strip()

        # Clean JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            parts = response_text.split("```")
            if len(parts) >= 2:
                response_text = parts[1].strip()

        # Parse JSON safely
        try:
            scholarships = json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Response text: {response_text}")
            raise HTTPException(status_code=500, detail="Invalid JSON returned by Gemini")

        # Normalize output
        if isinstance(scholarships, dict):
            scholarships = [scholarships]
        if not isinstance(scholarships, list):
            raise ValueError("Invalid format: expected JSON array")

        return {"scholarships": scholarships}

    except Exception as e:
        print(f"Scholarships error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


class Branch(BaseModel):
    bank: str
    
class UserCoords(BaseModel):
    lat: float
    lng: float

class NearestBranchRequest(BaseModel):
    user_coords: UserCoords
    branches: list[Branch]

@app.post("/nearest-branches")
async def nearest_branches(payload: NearestBranchRequest):
    try:
        if not API_KEY:
            raise HTTPException(status_code=500, detail="API Key missing")

        client = GoogleGenai.Client(api_key=API_KEY)
        model_id = "gemini-2.0-flash"

        # Construct a search-oriented prompt
        user_lat = payload.user_coords.lat
        user_lng = payload.user_coords.lng
        bank_names = ", ".join([b.bank for b in payload.branches])

        prompt_text = f"""
        Find the nearest physical bank branch for each of the following banks: {bank_names}.
        The user is located at Latitude: {user_lat}, Longitude: {user_lng}.
        
        For each bank, use Google Search to find the exact address and coordinates of the nearest branch.
        
        Return the result as a strict JSON object with a single key "nearest_branches" containing a list of objects.
        Each object must have:
        - "bank": The name of the bank
        - "name": The branch name (e.g., "SBI MG Road Branch")
        - "lat": Latitude (number)
        - "lng": Longitude (number)
        - "address": Full address
        
        Example Output:
        {{
          "nearest_branches": [
            {{ "bank": "SBI", "name": "SBI Indiranagar", "lat": 12.97, "lng": 77.64, "address": "..." }}
          ]
        }}
        """

        response = model.generate_content(prompt_text)
        
        if not response or not response.text:
             raise HTTPException(status_code=500, detail="No response from Gemini")

        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            # Fallback cleanup for markdown
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].strip()
            return json.loads(text)

    except Exception as e:
        print(f"Nearest Branch Error: {e}")
        # Log to see if it's a tool error specific to model version
        print(f"Make sure gemini-2.0-flash-exp or similar supports tools in this SDK version.")
        raise HTTPException(status_code=500, detail=str(e))