const imageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (image.startsWith("/uploads/")) {
    return `${apiUrl}${image}`;
  }

  if (image.startsWith("uploads/")) {
    return `${apiUrl}/${image}`;
  }

  if (image.startsWith("public/")) {
    return `/${image.replace(/^public\//, "")}`;
  }

  if (image.startsWith("/public/")) {
    return image.replace(/^\/public\//, "/");
  }

  return image.startsWith("/")
    ? image
    : `/${image}`;
};

export default imageUrl;
