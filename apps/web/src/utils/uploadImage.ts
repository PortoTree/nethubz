export async function uploadToCloudinary(fileOrUrl: string | File | Blob, preset: string = "mencari_assets"): Promise<string> {
  // Fetch the blob from the local blob URL if it's a string
  let blob: Blob;
  if (typeof fileOrUrl === "string") {
    const response = await fetch(fileOrUrl);
    blob = await response.blob();
  } else {
    blob = fileOrUrl;
  }
  
  // Determine extension from blob type
  let extension = "png";
  if (blob.type) {
    const typeParts = blob.type.split("/");
    if (typeParts.length === 2) {
      extension = typeParts[1];
    }
  }
  
  // Use a random filename to avoid CDN caching if preset allows use_filename
  const randomStr = Math.random().toString(36).substring(2, 10);
  
  // Prepare FormData for Cloudinary
  const formData = new FormData();
  formData.append("file", blob, `img_${randomStr}.${extension}`);
  formData.append("upload_preset", preset);
  
  // Cloudinary unauthenticated upload endpoint
  const cloudName = "ecdhyrfa";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  
  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}
