from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
import asyncio
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
from bson import ObjectId

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client["temple_db"]
temples_collection = db["temples"]
trips_collection = db["trips"]

# AI Integration
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, dict):
                doc[key] = serialize_doc(value)
            elif isinstance(value, list):
                doc[key] = serialize_doc(value)
    return doc

# Pydantic models
class Temple(BaseModel):
    id: str
    name: str
    location: str
    state: str
    city: str
    deity: str
    image: str
    description: str
    history: str
    timings: str
    prasadam: str
    festivals: List[str]
    contact: str
    booking_link: str
    coordinates: Dict[str, float]
    nearby_attractions: List[str]

class TripPlanRequest(BaseModel):
    starting_location: str
    days: int
    preferred_states: List[str]
    temples_of_interest: Optional[List[str]] = []

class TripPlan(BaseModel):
    id: str
    title: str
    duration: int
    daily_itinerary: List[Dict[str, Any]]
    total_temples: int
    estimated_cost: str
    best_travel_mode: str

# Sample temple data
SAMPLE_TEMPLES = [
    {
        "id": "temple_001",
        "name": "Meenakshi Amman Temple",
        "location": "Madurai, Tamil Nadu",
        "state": "Tamil Nadu", 
        "city": "Madurai",
        "deity": "Meenakshi (Parvati) and Sundareshwarar (Shiva)",
        "image": "https://images.unsplash.com/photo-1566915682737-3e97a7eed93b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB0ZW1wbGVzfGVufDB8fHx8MTc1NTAxMDk4NHww&ixlib=rb-4.1.0&q=85",
        "description": "One of the most important temples dedicated to Meenakshi, a form of Parvati, and her consort, Sundareshwarar.",
        "history": "The temple has a rich history dating back to the 6th century CE. The current structure was built in the 17th century.",
        "timings": "5:00 AM - 12:30 PM, 4:00 PM - 9:30 PM",
        "prasadam": "Coconut rice, sweet pongal, and sacred water",
        "festivals": ["Meenakshi Thirukalyanam", "Navarathri", "Float Festival"],
        "contact": "+91-452-2345678",
        "booking_link": "https://www.maduraitemple.org",
        "coordinates": {"lat": 9.9195, "lng": 78.1193},
        "nearby_attractions": ["Thirumalai Nayakkar Palace", "Gandhi Memorial Museum", "Alagar Koil"]
    },
    {
        "id": "temple_002", 
        "name": "Golden Temple (Harmandir Sahib)",
        "location": "Amritsar, Punjab",
        "state": "Punjab",
        "city": "Amritsar",
        "deity": "Guru Granth Sahib",
        "image": "https://images.unsplash.com/photo-1715876722520-02ccc9248dab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxoaW5kdSUyMHRlbXBsZXxlbnwwfHx8fDE3NTUwMTA5OTB8MA&ixlib=rb-4.1.0&q=85",
        "description": "The most sacred Gurdwara and a central religious place of worship for Sikhs.",
        "history": "Built in 1604 by Guru Ram Das, the fourth Sikh Guru. The temple is surrounded by a sacred pool (sarovar).",
        "timings": "24 hours (open all day)",
        "prasadam": "Langar (free community meal) served 24/7",
        "festivals": ["Vaisakhi", "Guru Nanak Jayanti", "Hola Mohalla"],
        "contact": "+91-183-2553954",
        "booking_link": "https://www.sgpc.net",
        "coordinates": {"lat": 31.6200, "lng": 74.8765},
        "nearby_attractions": ["Jallianwala Bagh", "Wagah Border", "Partition Museum"]
    },
    {
        "id": "temple_003",
        "name": "Jagannath Temple",
        "location": "Puri, Odisha", 
        "state": "Odisha",
        "city": "Puri",
        "deity": "Jagannath (Krishna), Balabhadra, Subhadra",
        "image": "https://images.unsplash.com/photo-1565195161077-f5c5f61f9ea2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZXxlbnwwfHx8fDE3NTUwMTA5OTB8MA&ixlib=rb-4.1.0&q=85",
        "description": "Famous for the annual Rath Yatra (Chariot Festival), one of the Char Dham pilgrimage sites.",
        "history": "The temple was built in 12th century by King Anantavarman Chodaganga Deva of Eastern Ganga Dynasty.",
        "timings": "5:00 AM - 12:00 PM, 2:00 PM - 9:00 PM",
        "prasadam": "Mahaprasad served in earthen pots, including khichdi, dalma, and sweets",
        "festivals": ["Rath Yatra", "Snana Yatra", "Chandan Yatra"],
        "contact": "+91-6752-222253",
        "booking_link": "https://www.jagannath.nic.in",
        "coordinates": {"lat": 19.8135, "lng": 85.8312},
        "nearby_attractions": ["Puri Beach", "Konark Sun Temple", "Chilika Lake"]
    },
    {
        "id": "temple_004",
        "name": "Kashi Vishwanath Temple",
        "location": "Varanasi, Uttar Pradesh",
        "state": "Uttar Pradesh", 
        "city": "Varanasi",
        "deity": "Shiva (Vishwanath)",
        "image": "https://images.unsplash.com/photo-1566300141301-ab0577dcba1c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxoaW5kdSUyMHRlbXBsZXxlbnwwfHx8fDE3NTUwMTA5OTB8MA&ixlib=rb-4.1.0&q=85",
        "description": "One of the twelve Jyotirlingas, considered the most sacred of Shiva temples.",
        "history": "The temple has been destroyed and rebuilt several times. The current structure was built by Ahilyabai Holkar in 1780.",
        "timings": "3:00 AM - 11:00 PM",
        "prasadam": "Panchamrit, bel leaves, and sacred water from Ganga",
        "festivals": ["Maha Shivratri", "Shravan Month celebrations", "Annakut"],
        "contact": "+91-542-2393226",
        "booking_link": "https://www.shrikashivishwanath.org",
        "coordinates": {"lat": 25.3109, "lng": 83.0107},
        "nearby_attractions": ["Dasaswamedh Ghat", "Sarnath", "BHU Campus"]
    },
    {
        "id": "temple_005",
        "name": "Brihadishvara Temple",
        "location": "Thanjavur, Tamil Nadu",
        "state": "Tamil Nadu",
        "city": "Thanjavur", 
        "deity": "Shiva (Brihadishvara)",
        "image": "https://images.unsplash.com/photo-1695981152719-3fc012dc3da4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGVzfGVufDB8fHx8MTc1NTAxMDk4NHww&ixlib=rb-4.1.0&q=85",
        "description": "UNESCO World Heritage Site, also known as the Big Temple, a masterpiece of Chola architecture.",
        "history": "Built by Raja Raja Chola I between 1003 and 1010 CE, representing the height of Chola architectural achievement.",
        "timings": "6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM",
        "prasadam": "Coconut, banana, jaggery, and sacred ash (vibhuti)",
        "festivals": ["Maha Shivratri", "Brahmotsavam", "Arudra Darshan"],
        "contact": "+91-4362-267573",
        "booking_link": "https://www.tnhrce.org",
        "coordinates": {"lat": 10.7821, "lng": 79.1312},
        "nearby_attractions": ["Thanjavur Palace", "Art Gallery", "Saraswathi Mahal Library"]
    },
    {
        "id": "temple_006",
        "name": "Somnath Temple",
        "location": "Somnath, Gujarat",
        "state": "Gujarat",
        "city": "Somnath",
        "deity": "Shiva (Somnath)", 
        "image": "https://images.unsplash.com/photo-1524443169398-9aa1ceab67d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxoaW5kdSUyMHRlbXBsZXxlbnwwfHx8fDE3NTUwMTA5OTB8MA&ixlib=rb-4.1.0&q=85",
        "description": "The first among the twelve Jyotirlinga shrines of Shiva, known as the 'Shrine Eternal'.",
        "history": "Destroyed and rebuilt multiple times through history. The current temple was reconstructed in 1951.",
        "timings": "6:00 AM - 9:00 PM",
        "prasadam": "Panchamrit, coconut water, and sacred ash", 
        "festivals": ["Maha Shivratri", "Kartik Purnima", "Shravan Somvar"],
        "contact": "+91-2876-231866", 
        "booking_link": "https://www.somnath.org",
        "coordinates": {"lat": 20.8978, "lng": 70.4012},
        "nearby_attractions": ["Somnath Beach", "Bhalka Tirtha", "Triveni Sangam"]
    }
]

# Initialize database with sample data
@app.on_event("startup")
async def initialize_database():
    # Check if temples exist, if not insert sample data
    existing_temples = await temples_collection.count_documents({})
    if existing_temples == 0:
        await temples_collection.insert_many(SAMPLE_TEMPLES)
        print("Initialized database with sample temple data")

# API Routes
@app.get("/")
async def root():
    return {"message": "Temple Search & Trip Planning API"}

@app.get("/api/temples", response_model=List[Temple])
async def get_all_temples():
    temples = await temples_collection.find({}).to_list(1000)
    return serialize_doc(temples)

@app.get("/api/temples/{temple_id}", response_model=Temple)
async def get_temple(temple_id: str):
    temple = await temples_collection.find_one({"id": temple_id})
    if not temple:
        raise HTTPException(status_code=404, detail="Temple not found")
    return temple

@app.get("/api/search/temples")
async def search_temples(q: str = "", state: str = "", deity: str = ""):
    query = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"location": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}}
        ]
    if state:
        query["state"] = {"$regex": state, "$options": "i"}
    if deity:
        query["deity"] = {"$regex": deity, "$options": "i"}
    
    temples = await temples_collection.find(query).to_list(100)
    return temples

@app.post("/api/trip-plan", response_model=TripPlan)
async def generate_trip_plan(request: TripPlanRequest):
    try:
        # Get relevant temples based on preferred states
        query = {}
        if request.preferred_states:
            query["state"] = {"$in": request.preferred_states}
        
        temples = await temples_collection.find(query).to_list(50)
        
        # Create AI prompt for trip planning
        temples_info = []
        for temple in temples[:10]:  # Limit to 10 temples for prompt
            temples_info.append(f"- {temple['name']} in {temple['location']} (Deity: {temple['deity']})")
        
        temples_text = "\n".join(temples_info)
        
        prompt = f"""
        Create a detailed {request.days}-day temple pilgrimage itinerary starting from {request.starting_location}.
        
        Available temples in preferred states:
        {temples_text}
        
        Please provide a JSON response with the following structure:
        {{
            "title": "A creative title for the trip",
            "duration": {request.days},
            "daily_itinerary": [
                {{
                    "day": 1,
                    "location": "City name",
                    "temples": ["Temple names to visit"],
                    "activities": ["Activities and experiences"],
                    "travel_time": "Estimated travel time",
                    "accommodation": "Suggested accommodation area"
                }}
            ],
            "total_temples": "Number of temples covered",
            "estimated_cost": "Estimated budget in INR",
            "best_travel_mode": "Recommended travel mode"
        }}
        
        Focus on creating a practical, spiritual journey with proper time allocation and regional diversity.
        """
        
        # Initialize AI chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"trip_plan_{uuid.uuid4()}",
            system_message="You are an expert travel planner specializing in Indian temple pilgrimages. Provide detailed, practical itineraries."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
            
            ai_plan = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            ai_plan = {
                "title": f"{request.days}-Day Temple Pilgrimage",
                "duration": request.days,
                "daily_itinerary": [
                    {
                        "day": i+1,
                        "location": f"Day {i+1} destination",
                        "temples": ["Selected temples"],
                        "activities": ["Temple darshan", "Local exploration"],
                        "travel_time": "2-4 hours",
                        "accommodation": "Local guest house or hotel"
                    } for i in range(request.days)
                ],
                "total_temples": min(request.days * 2, len(temples)),
                "estimated_cost": f"₹{request.days * 3000}-{request.days * 5000}",
                "best_travel_mode": "Car/Taxi"
            }
        
        # Create trip plan object
        trip_plan = TripPlan(
            id=str(uuid.uuid4()),
            title=ai_plan.get("title", f"{request.days}-Day Temple Journey"),
            duration=ai_plan.get("duration", request.days),
            daily_itinerary=ai_plan.get("daily_itinerary", []),
            total_temples=ai_plan.get("total_temples", len(temples)),
            estimated_cost=ai_plan.get("estimated_cost", f"₹{request.days * 3000}-{request.days * 5000}"),
            best_travel_mode=ai_plan.get("best_travel_mode", "Car/Taxi")
        )
        
        # Save trip plan to database
        await trips_collection.insert_one(trip_plan.model_dump())
        
        return trip_plan
        
    except Exception as e:
        print(f"Error generating trip plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate trip plan")

@app.get("/api/trip-plans/{trip_id}", response_model=TripPlan)
async def get_trip_plan(trip_id: str):
    trip = await trips_collection.find_one({"id": trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found")
    return trip

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)