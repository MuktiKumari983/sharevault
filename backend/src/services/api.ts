const API_BASE_URL = "http://localhost:8080/api";

export interface Resource {
  id: number;
  name: string;
  category: string;
  location: string;
  description?: string;
  isAvailable: boolean;
  requiresQualification?: boolean;
  qualificationRequired?: string;
  [key: string]: any;
}

export interface BookingRequestDto {
  userId: number;
  resourceId: number;
  startTime: string;
  endTime: string;
  qualificationProof?: string;
}

export interface BookingRequest {
  id: number;
  resource: Resource;
  requester: { id: number; [key: string]: any };
  startTime: string;
  endTime: string;
  status: string;
  qualificationProof?: string;
  [key: string]: any;
}

export interface EligibilityRequest {
  userQualification: string;
  resourceRequirement: string;
}

export interface EligibilityResponse {
  isEligible: boolean;
  confidence: number;
  matchedSkills: string[];
  recommendation: string;
}

export async function fetchAllResources(): Promise<Resource[]> {
  const response = await fetch(`${API_BASE_URL}/resources`);
  if (!response.ok) {
    throw new Error("Failed to fetch resources");
  }
  return response.json();
}

export async function createBookingRequest(
  booking: BookingRequestDto
): Promise<BookingRequest> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  });
  if (!response.ok) {
    throw new Error("Failed to create booking request");
  }
  return response.json();
}

export async function checkUserEligibility(
  request: EligibilityRequest
): Promise<EligibilityResponse> {
  const response = await fetch(`${API_BASE_URL}/eligibility`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error("Failed to check eligibility");
  }
  return response.json();
}
