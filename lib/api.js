const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Helper function to make API calls with fetch
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token")

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Handle auth errors
    if (response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/auth/login"
      throw new Error("Unauthorized")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

// Auth API calls
export const authAPI = {
  login: (credentials) => apiCall("/auth/login", { method: "POST", body: credentials }),
  register: (userData) => apiCall("/auth/register", { method: "POST", body: userData }),
  getProfile: () => apiCall("/auth/profile"),
  updateProfile: (data) => apiCall("/auth/profile", { method: "PUT", body: data }),
}

// Aid Packages API calls
export const aidPackagesAPI = {
  getAll: () => apiCall("/aid-packages"),
  getById: (id) => apiCall(`/aid-packages/${id}`),
  create: (packageData) => apiCall("/aid-packages", { method: "POST", body: packageData }),
  update: (id, data) => apiCall(`/aid-packages/${id}`, { method: "PUT", body: data }),
  getByNGO: (ngoId) => apiCall(`/aid-packages/ngo/${ngoId}`),
  getReadyForDelivery: () => apiCall("/aid-packages/ready-for-delivery"),
}

// Donations API calls
export const donationsAPI = {
  create: (donationData) => apiCall("/donations", { method: "POST", body: donationData }),
  getByDonor: (donorId) => apiCall(`/donations/donor/${donorId}`),
  getByPackage: (packageId) => apiCall(`/donations/package/${packageId}`),
  getAll: () => apiCall("/donations"),
}

// Deliveries API calls
export const deliveriesAPI = {
  pledge: (deliveryData) => apiCall("/deliveries/pledge", { method: "POST", body: deliveryData }),
  updateStatus: (deliveryId, statusData) =>
    apiCall(`/deliveries/${deliveryId}/status`, { method: "PUT", body: statusData }),
  confirm: (deliveryId, confirmationData) =>
    apiCall(`/deliveries/${deliveryId}/confirm`, { method: "PUT", body: confirmationData }),
  getByVolunteer: (volunteerId) => apiCall(`/deliveries/volunteer/${volunteerId}`),
  getByPackage: (packageId) => apiCall(`/deliveries/package/${packageId}`),
}

// Users API calls
export const usersAPI = {
  updateWalletAddress: (walletAddress) => apiCall("/users/wallet", { method: "PUT", body: { walletAddress } }),
  getStats: () => apiCall("/users/stats"),
}

export default { authAPI, aidPackagesAPI, donationsAPI, deliveriesAPI, usersAPI }
