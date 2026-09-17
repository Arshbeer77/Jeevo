import os
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import engine, get_db, init_db, Lead

# Initialize DB tables on launch
init_db()

app = FastAPI(
    title="Jeevo Tours CRM API",
    description="API for lead ingestion and CRM management for Jeevo Tours",
    version="1.0.0"
)

# Enable CORS for all origins so static forms (e.g. Vercel) can post enquiries
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Schemas ---

class EnquiryCreate(BaseModel):
    name: str
    email: str
    phone: str
    destination: Optional[str] = None
    budget: Optional[str] = None
    travel_dates: Optional[str] = None
    notes: Optional[str] = ""


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    destination: Optional[str] = None
    budget: Optional[str] = None
    travel_dates: Optional[str] = None
    status: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True


VALID_STATUSES = ["New Lead", "Contacted", "Itinerary Sent", "Booked", "Lost"]


# --- Endpoints ---

@app.get("/", include_in_schema=False)
def root():
    """Redirect or serve Admin interface by default."""
    return FileResponse("admin.html")


@app.get("/admin", include_in_schema=False)
def get_admin_page():
    """Serve the single-file Admin Dashboard HTML."""
    if os.path.exists("admin.html"):
        return FileResponse("admin.html")
    raise HTTPException(status_code=404, detail="admin.html file not found")


@app.post("/api/enquiries", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_enquiry(enquiry: EnquiryCreate, db: Session = Depends(get_db)):
    """
    Public endpoint to ingest leads submitted from website forms (Vercel, etc.).
    """
    if not enquiry.name or not enquiry.email or not enquiry.phone:
        raise HTTPException(status_code=400, detail="Name, Email, and Phone are required fields.")

    new_lead = Lead(
        name=enquiry.name.strip(),
        email=enquiry.email.strip(),
        phone=enquiry.phone.strip(),
        destination=enquiry.destination.strip() if enquiry.destination else "",
        budget=enquiry.budget.strip() if enquiry.budget else "",
        travel_dates=enquiry.travel_dates.strip() if enquiry.travel_dates else "",
        notes=enquiry.notes.strip() if enquiry.notes else "",
        status="New Lead"
    )

    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead


@app.get("/api/crm/leads", response_model=List[LeadResponse])
def get_all_leads(db: Session = Depends(get_db)):
    """
    Private CRM endpoint returning all leads ordered by created_at descending.
    """
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return leads


@app.put("/api/crm/leads/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, update_data: LeadUpdate, db: Session = Depends(get_db)):
    """
    Private CRM endpoint to update a lead's status and/or notes.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with ID {lead_id} not found.")

    if update_data.status is not None:
        if update_data.status not in VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{update_data.status}'. Must be one of: {VALID_STATUSES}"
            )
        lead.status = update_data.status

    if update_data.notes is not None:
        lead.notes = update_data.notes

    db.commit()
    db.refresh(lead)
    return lead


@app.delete("/api/crm/leads/{lead_id}", status_code=status.HTTP_200_OK)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    Private CRM endpoint to delete a lead.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with ID {lead_id} not found.")

    db.delete(lead)
    db.commit()
    return {"message": f"Lead {lead_id} successfully deleted."}
