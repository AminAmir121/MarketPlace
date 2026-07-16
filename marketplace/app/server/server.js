const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const SendOTP = async (req) => {
  const response = await fetch(`${API_BASE_URL}/api/user/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  const data = await response.json();
  return data;
};

export const VerifyOTP = async (req) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to verify OTP." };
    }

    return data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: "Network error while verifying OTP." };
  }
};

export const RegisterUser = async (req) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to Register User." };
    }

    return data;
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: "Network error while registering user." };
  }
};

export const Login = async (req) => {
try {
       const response = await fetch(`${API_BASE_URL}/api/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  const data = await response.json();
  return data;
} catch (error) {
     console.log("Error logging in user:", error);
     return { success: false, message: "Network error while logging in user." };
}
};

export const CheckToken  = async (token)=>{
       try {
    const response = await fetch(`${API_BASE_URL}/api/user/CheckToken`,{
      method : "GET",
      headers:{
        'Content-Type' : 'application/json',
        'Authorization' : `Bearer ${token}`
      }
    })
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error Checking Token From Server.js : ", error);
    throw error;
  }
}

export const GetUserAds = async () => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/GetUserAds`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch ads." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching user ads:", error);
    return { success: false, message: "Network error while fetching ads." };
  }
};

export const GetAllAds = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/GetAllAds`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch products." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching all ads:", error);
    return { success: false, message: "Network error while fetching products." };
  }
};

const getStoredToken = () => {
  if (typeof window === "undefined") return null;

  const keys = ["authToken", "token", "jwt", "accessToken"];
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return null;
};

export const UpdateStoreName = async (userId, storeName) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/update-store-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId, storeName }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: "Failed to save store name." };
    }

    return data;
  } catch (error) {
    console.log("Error updating store name:", error);
    return { success: false, message: "Network error while updating store name." };
  }
};

export const PostAd = async (formData) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/post-ad`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to post ad." };
    }

    return data;
  } catch (error) {
    console.log("Error posting ad:", error);
    return { success: false, message: "Network error while posting ad." };
  }
};

export const EditAd = async (formData) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/editAdByUserId`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to update ad." };
    }

    return data;
  } catch (error) {
    console.log("Error updating ad:", error);
    return { success: false, message: "Network error while updating ad." };
  }
};

export const DeleteAd = async (adId) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/DeleteAdByUserId`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ adId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to delete ad." };
    }

    return data;
  } catch (error) {
    console.log("Error deleting ad:", error);
    return { success: false, message: "Network error while deleting ad." };
  }
};

export const AddToCart = async (productId) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/AddToCart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to add item to cart." };
    }

    return data;
  } catch (error) {
    console.log("Error adding item to cart:", error);
    return { success: false, message: "Network error while adding item to cart." };
  }
};

export const RemoveFromCart = async (productId) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/RemoveFromCart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to remove item from cart." };
    }

    return data;
  } catch (error) {
    console.log("Error removing item from cart:", error);
    return { success: false, message: "Network error while removing item from cart." };
  }
};

export const GetUserCart = async () => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/GetUserCart`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch your cart." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching user cart:", error);
    return { success: false, message: "Network error while fetching your cart." };
  }
};

