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

export const PlaceOrder = async (productId) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/PlaceOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to place order." };
    }

    return data;
  } catch (error) {
    console.log("Error placing order:", error);
    return { success: false, message: "Network error while placing order." };
  }
};

export const GetUserOrders = async () => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/GetUserOrders`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch your orders." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching user orders:", error);
    return { success: false, message: "Network error while fetching your orders." };
  }
};

export const AddComment = async (productId, comment) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/AddComment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productId, comment }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to post comment." };
    }

    return data;
  } catch (error) {
    console.log("Error posting comment:", error);
    return { success: false, message: "Network error while posting comment." };
  }
};

export const GetProductComments = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/GetProductComments?productId=${productId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch comments." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching comments:", error);
    return { success: false, message: "Network error while fetching comments." };
  }
};

export const GetVendorAds = async (vendorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/GetVendorAds?vendorId=${vendorId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch vendor's products." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching vendor ads:", error);
    return { success: false, message: "Network error while fetching vendor's products." };
  }
};

export const SubmitReport = async (storeName, comment) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/SubmitReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ storeName, comment }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to submit report." };
    }

    return data;
  } catch (error) {
    console.log("Error submitting report:", error);
    return { success: false, message: "Network error while submitting report." };
  }
};

export const GetUserRole = async () => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/GetUserRole`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch user role." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching user role:", error);
    return { success: false, message: "Network error while fetching user role." };
  }
};

export const GetAllVendorStores = async () => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/GetAllVendorStores`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch vendor stores." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching vendor stores:", error);
    return { success: false, message: "Network error while fetching vendor stores." };
  }
};

export const BanStore = async (vendorId) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/BanStore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ vendorId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to ban store." };
    }

    return data;
  } catch (error) {
    console.log("Error banning store:", error);
    return { success: false, message: "Network error while banning store." };
  }
};

export const GetAdminReports = async () => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/GetAdminReports`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to fetch reports." };
    }

    return data;
  } catch (error) {
    console.log("Error fetching reports:", error);
    return { success: false, message: "Network error while fetching reports." };
  }
};

export const ResolveReport = async (reportId) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/api/user/ResolveReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ reportId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data?.message || "Failed to resolve report." };
    }

    return data;
  } catch (error) {
    console.log("Error resolving report:", error);
    return { success: false, message: "Network error while resolving report." };
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

